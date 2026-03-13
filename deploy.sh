#!/bin/bash

# 光储投资地图 - 一键部署脚本
# 服务器：121.43.69.200
# 使用方法：ssh root@121.43.69.200 "bash -s" < deploy.sh

set -e

echo "🚀 ======================================"
echo "   光储投资地图 - 自动化部署"
echo "   服务器：121.43.69.200"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否 root
if [ "$EUID" -ne 0 ]; then 
    log_error "请使用 root 用户运行此脚本"
    exit 1
fi

# 1. 系统更新
log_info "[1/8] 更新系统..."
apt update -y
apt upgrade -y
log_success "系统更新完成"

# 2. 安装依赖
log_info "[2/8] 安装基础软件..."
apt install -y nodejs npm git nginx curl wget ufw
log_success "基础软件安装完成"

# 验证 Node.js
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
log_info "Node.js: $NODE_VERSION"
log_info "npm: $NPM_VERSION"

# 3. 安装 PM2
log_info "[3/8] 安装 PM2..."
npm install -g pm2
log_success "PM2 安装完成 ($(pm2 -v))"

# 4. 创建应用目录
log_info "[4/8] 创建应用目录..."
mkdir -p /var/www/solar-storage-map
cd /var/www/solar-storage-map
log_success "应用目录创建完成"

# 5. 克隆代码
log_info "[5/8] 克隆代码..."
git clone https://github.com/xuegangwu/china-solar-storage.git .
log_success "代码克隆完成"

# 6. 安装后端依赖
log_info "[6/8] 安装后端依赖..."
cd /var/www/solar-storage-map/server
npm install
log_success "后端依赖安装完成"

# 7. 配置环境变量
log_info "[7/8] 配置环境变量..."
JWT_SECRET=$(openssl rand -base64 32)

cat > .env << EOF
NODE_ENV=production
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=/var/www/solar-storage-map/server/storage/db/nocobase.db
JWT_SECRET=$JWT_SECRET
EOF

log_success "环境变量配置完成"

# 8. 配置 Nginx
log_info "[8/8] 配置 Nginx..."
cat > /etc/nginx/sites-available/solar-storage-map << 'NGINX_EOF'
server {
    listen 80;
    server_name 121.43.69.200;
    
    # 前端静态文件
    location / {
        root /var/www/solar-storage-map/web;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Gzip 压缩
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    }
    
    # API 反向代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /var/www/solar-storage-map/web;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# 启用配置
ln -sf /etc/nginx/sites-available/solar-storage-map /etc/nginx/sites-enabled/solar-storage-map
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t
log_success "Nginx 配置完成"

# 9. 配置防火墙
log_info "配置防火墙..."
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw allow 3001/tcp || true
log_success "防火墙配置完成"

# 10. 启动应用
log_info "启动应用..."
cd /var/www/solar-storage-map/server

# 创建日志目录
mkdir -p logs
mkdir -p storage/db

# 启动 PM2
pm2 start src/server.js --name solar-api --max-memory-restart 512M --instances 1
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

log_success "应用启动完成"

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx
log_success "Nginx 启动完成"

# 等待服务启动
sleep 5

# 测试服务
log_info "测试服务..."
HEALTH_CHECK=$(curl -s http://localhost:3001/health 2>/dev/null || echo '{"status":"error"}')
echo ""
echo "健康检查响应：$HEALTH_CHECK"
echo ""

# 完成信息
echo ""
echo -e "${GREEN}======================================"
echo "   ✅ 部署完成！"
echo "======================================${NC}"
echo ""
echo -e "${BLUE}🌐 访问地址：${NC}"
echo "  首页：http://121.43.69.200"
echo "  API 文档：http://121.43.69.200/api-docs"
echo "  通知中心：http://121.43.69.200/notification-center.html"
echo "  中国区地图：http://121.43.69.200/map-v1.0.html"
echo "  欧洲区地图：http://121.43.69.200/europe-map.html"
echo ""
echo -e "${BLUE}🔧 常用命令：${NC}"
echo "  pm2 status              # 查看服务状态"
echo "  pm2 logs solar-api      # 查看应用日志"
echo "  pm2 restart solar-api   # 重启应用"
echo "  nginx -t                # 测试 Nginx 配置"
echo "  systemctl status nginx  # 查看 Nginx 状态"
echo "  tail -f /var/log/nginx/access.log  # 查看访问日志"
echo ""
echo -e "${BLUE}📊 服务信息：${NC}"
echo "  应用名称：solar-api"
echo "  运行端口：3001"
echo "  Web 端口：80"
echo "  进程管理：PM2"
echo "  Web 服务器：Nginx"
echo "  数据库：SQLite"
echo ""
echo -e "${YELLOW}📝 下一步建议：${NC}"
echo "  1. 访问 http://121.43.69.200 测试所有功能"
echo "  2. 配置域名解析（如有域名）"
echo "  3. 申请 SSL 证书配置 HTTPS"
echo "  4. 配置阿里云 RDS PostgreSQL（可选）"
echo "  5. 配置 OSS 对象存储（可选）"
echo ""
echo -e "${GREEN}======================================"
echo "   部署时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================${NC}"
echo ""
