#!/bin/bash

# 光储投资地图 - 快速部署脚本（简化版）
# 服务器 IP: 121.43.69.200

set -e

echo "🚀 开始快速部署..."
echo "======================================"

# 1. 更新系统并安装依赖
echo "[1/6] 安装系统依赖..."
apt update && apt upgrade -y
apt install -y nodejs npm git nginx curl wget

# 2. 安装 PM2
echo "[2/6] 安装 PM2..."
npm install -g pm2

# 3. 创建应用目录
echo "[3/6] 创建应用目录..."
mkdir -p /var/www/solar-storage-map
cd /var/www/solar-storage-map

# 4. 克隆代码
echo "[4/6] 克隆代码..."
git clone https://github.com/xuegangwu/china-solar-storage.git .

# 5. 安装后端依赖
echo "[5/6] 安装后端依赖..."
cd server
npm install

# 6. 配置环境变量（使用 SQLite，无需 RDS）
echo "[6/6] 配置环境变量..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=/var/www/solar-storage-map/server/storage/db/nocobase.db
JWT_SECRET=$(openssl rand -base64 32)
EOF

# 7. 配置 Nginx
echo "配置 Nginx..."
cat > /etc/nginx/sites-available/solar-storage-map << 'EOF'
server {
    listen 80;
    server_name 121.43.69.200;
    
    # 前端静态文件
    location / {
        root /var/www/solar-storage-map/web;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        gzip on;
        gzip_types text/plain text/css application/json application/javascript;
        gzip_min_length 1000;
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
    }
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/solar-storage-map /etc/nginx/sites-enabled/solar-storage-map
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

# 8. 启动应用
echo "启动应用..."
cd /var/www/solar-storage-map/server
pm2 start src/server.js --name solar-api
pm2 save
pm2 startup

# 9. 配置防火墙
echo "配置防火墙..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp

echo ""
echo "======================================"
echo "✅ 部署完成！"
echo "======================================"
echo ""
echo "🌐 访问地址："
echo "  首页：http://121.43.69.200"
echo "  API 文档：http://121.43.69.200/api-docs"
echo "  通知中心：http://121.43.69.200/notification-center.html"
echo ""
echo "🔧 常用命令："
echo "  pm2 status          - 查看服务状态"
echo "  pm2 logs solar-api  - 查看日志"
echo "  pm2 restart solar-api - 重启服务"
echo "  nginx -t            - 测试 Nginx 配置"
echo "  systemctl status nginx - 查看 Nginx 状态"
echo ""
echo "📝 下一步："
echo "  1. 访问 http://121.43.69.200 测试"
echo "  2. 配置域名（如有）"
echo "  3. 申请 SSL 证书"
echo ""
