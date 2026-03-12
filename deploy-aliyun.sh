#!/bin/bash
#############################################
# 光储电站投资系统 - 阿里云一键部署脚本
# 版本：v1.0
# 日期：2026-03-11
#############################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
    print_error "请使用 sudo 运行此脚本"
    exit 1
fi

print_info "=========================================="
print_info "光储电站投资系统 - 一键部署脚本"
print_info "=========================================="
print_info ""

# 1. 系统更新
print_info "步骤 1/10: 更新系统..."
apt update && apt upgrade -y
print_success "系统更新完成"

# 2. 安装基础工具
print_info "步骤 2/10: 安装基础工具..."
apt install -y curl git wget vim unzip tar
print_success "基础工具安装完成"

# 3. 安装 Node.js
print_info "步骤 3/10: 安装 Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
print_success "Node.js 安装完成：$(node -v)"

# 4. 安装 PM2
print_info "步骤 4/10: 安装 PM2..."
npm install -g pm2
pm2 startup
pm2 save
print_success "PM2 安装完成"

# 5. 安装 Nginx
print_info "步骤 5/10: 安装 Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx 安装完成"

# 6. 配置防火墙
print_info "步骤 6/10: 配置防火墙..."
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "防火墙配置完成"

# 7. 创建应用目录
print_info "步骤 7/10: 创建应用目录..."
mkdir -p /opt/solar-storage
cd /opt/solar-storage
print_success "应用目录创建完成：/opt/solar-storage"

# 8. 解压项目（如果有）
if [ -f "/opt/solar-storage-v1.0.tar.gz" ]; then
    print_info "步骤 8/10: 解压项目..."
    tar -xzf /opt/solar-storage-v1.0.tar.gz -C /opt/solar-storage --strip-components=0
    print_success "项目解压完成"
else
    print_warning "未找到项目包，跳过解压步骤"
    print_info "请手动上传 solar-storage-v1.0.tar.gz 到 /opt/ 并重新运行此脚本"
fi

# 9. 安装依赖
print_info "步骤 9/10: 安装应用依赖..."
if [ -d "/opt/solar-storage/backend" ]; then
    cd /opt/solar-storage/backend
    npm install --production
    print_success "依赖安装完成"
else
    print_error "未找到 backend 目录"
    exit 1
fi

# 10. 配置环境变量
print_info "步骤 10/10: 配置环境变量..."
cat > /opt/solar-storage/backend/.env << 'EOF'
PORT=3000
NODE_ENV=production
JWT_SECRET=solar-storage-production-secret-key-2026
JWT_EXPIRES_IN=7d
DATABASE_TYPE=sqlite
DATABASE_PATH=/opt/solar-storage/backend/data/solar-storage.db
EOF
chmod 600 /opt/solar-storage/backend/.env
print_success "环境变量配置完成"

# 初始化数据库
print_info "初始化数据库..."
mkdir -p /opt/solar-storage/backend/data
node /opt/solar-storage/backend/scripts/init-db.js
print_success "数据库初始化完成"

# 启动应用
print_info "启动应用..."
cd /opt/solar-storage/backend
pm2 start server.js --name solar-storage
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true
print_success "应用启动完成"

# 配置 Nginx
print_info "配置 Nginx 反向代理..."
cat > /etc/nginx/sites-available/solar-storage << 'EOF'
server {
    listen 80;
    server_name _;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    access_log /var/log/nginx/solar-storage-access.log;
    error_log /var/log/nginx/solar-storage-error.log;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/solar-storage /etc/nginx/sites-enabled/solar-storage
nginx -t
systemctl restart nginx
print_success "Nginx 配置完成"

# 创建备份脚本
print_info "创建备份脚本..."
cat > /opt/backup-solar-storage.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /opt/solar-storage/backend/data/solar-storage.db $BACKUP_DIR/solar-storage-db_$DATE.db
cd $BACKUP_DIR
tar -czf solar-storage_$DATE.tar.gz solar-storage-db_$DATE.db
rm -f solar-storage-db_$DATE.db
find $BACKUP_DIR -name "solar-storage_*.tar.gz" -mtime +30 -delete
echo "Backup completed: solar-storage_$DATE.tar.gz"
EOF
chmod +x /opt/backup-solar-storage.sh

# 配置定时备份
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-solar-storage.sh") | crontab -
print_success "备份脚本配置完成"

# 显示部署信息
print_info ""
print_info "=========================================="
print_success "部署完成！"
print_info "=========================================="
print_info ""
print_info "访问地址:"
print_info "  http://$(hostname -I | awk '{print $1}')"
print_info "  http://$(curl -s ifconfig.me 2>/dev/null || echo '服务器 IP')"
print_info ""
print_info "应用状态:"
pm2 status
print_info ""
print_info "常用命令:"
print_info "  查看状态：pm2 status"
print_info "  查看日志：pm2 logs solar-storage"
print_info "  重启应用：pm2 restart solar-storage"
print_info "  停止应用：pm2 stop solar-storage"
print_info "  备份数据：/opt/backup-solar-storage.sh"
print_info ""
print_info "日志位置:"
print_info "  应用日志：pm2 logs"
print_info "  Nginx 日志：/var/log/nginx/"
print_info "  备份日志：/var/log/solar-storage-backup.log"
print_info ""
print_info "=========================================="
print_info "安全提示:"
print_info "  1. 立即修改默认密码 (admin/admin123)"
print_info "  2. 配置 HTTPS 证书 (certbot --nginx)"
print_info "  3. 配置阿里云安全组"
print_info "=========================================="
print_info ""
