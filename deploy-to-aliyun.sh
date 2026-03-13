#!/bin/bash

# 光储投资地图 - 自动化部署脚本
# 使用方式：bash deploy-to-aliyun.sh

set -e

echo "🚀 光储投资地图 - 阿里云部署脚本"
echo "======================================"

# 配置变量
APP_NAME="solar-storage-map"
APP_DIR="/var/www/$APP_NAME"
DOMAIN="your-domain.com"  # 修改为你的域名
EMAIL="wuxuegang@gmail.com"  # 修改为你的邮箱

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}请使用 root 用户运行此脚本${NC}"
  exit 1
fi

# 1. 安装依赖
echo -e "${YELLOW}[1/8] 安装系统依赖...${NC}"
apt update
apt upgrade -y
apt install -y nodejs npm git nginx postgresql-client redis-tools curl wget

# 2. 安装 PM2
echo -e "${YELLOW}[2/8] 安装 PM2...${NC}"
npm install -g pm2

# 3. 创建应用目录
echo -e "${YELLOW}[3/8] 创建应用目录...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# 4. 克隆代码
echo -e "${YELLOW}[4/8] 克隆代码...${NC}"
git clone https://github.com/xuegangwu/china-solar-storage.git .

# 5. 安装后端依赖
echo -e "${YELLOW}[5/8] 安装后端依赖...${NC}"
cd server
npm install

# 6. 创建环境配置
echo -e "${YELLOW}[6/8] 创建环境配置...${NC}"
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ 请编辑 .env 文件配置数据库和 OSS 信息${NC}"
  echo "nano .env"
  read -p "按回车继续..."
fi

# 7. 配置 Nginx
echo -e "${YELLOW}[7/8] 配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
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
    
    # 静态资源
    location /assets {
        alias /var/www/solar-storage-map/web/assets;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

# 8. 启动应用
echo -e "${YELLOW}[8/8] 启动应用...${NC}"
cd $APP_DIR/server
pm2 start src/server.js --name solar-api
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "📝 下一步操作："
echo "1. 配置域名解析到服务器 IP"
echo "2. 申请 SSL 证书并配置 HTTPS"
echo "3. 访问 http://$DOMAIN 测试"
echo ""
echo "🔧 常用命令："
echo "  pm2 status          # 查看服务状态"
echo "  pm2 logs solar-api  # 查看日志"
echo "  pm2 restart solar-api # 重启服务"
echo "  nginx -t            # 测试 Nginx 配置"
echo "  systemctl status nginx # 查看 Nginx 状态"
echo ""
