#!/bin/bash
# 阿里云部署一键脚本

set -e

echo "======================================"
echo "🌞 光储电站投资地图 - 阿里云部署脚本"
echo "======================================"

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请使用 sudo 运行此脚本"
  exit 1
fi

# 配置变量
APP_NAME="solar-storage"
APP_DIR="/opt/solar-storage"
NODE_VERSION="20.x"

echo ""
echo "📦 步骤 1: 安装 Node.js..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION | bash -
  apt-get install -y nodejs
  echo "✅ Node.js 安装完成：$(node -v)"
else
  echo "✅ Node.js 已安装：$(node -v)"
fi

echo ""
echo "📦 步骤 2: 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  echo "✅ PM2 安装完成"
else
  echo "✅ PM2 已安装"
fi

echo ""
echo "📦 步骤 3: 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
  apt-get update
  apt-get install -y nginx
  echo "✅ Nginx 安装完成"
else
  echo "✅ Nginx 已安装"
fi

echo ""
echo "📁 步骤 4: 创建应用目录..."
mkdir -p $APP_DIR
echo "✅ 应用目录：$APP_DIR"

echo ""
echo "📋 步骤 5: 请上传项目文件到 $APP_DIR/backend"
echo "   上传后按任意键继续..."
read

cd $APP_DIR/backend

echo ""
echo "📦 步骤 6: 安装依赖..."
npm install --production
echo "✅ 依赖安装完成"

echo ""
echo "🗄️  步骤 7: 初始化数据库..."
node scripts/init-db.js
echo "✅ 数据库初始化完成"

echo ""
echo "⚙️  步骤 8: 配置环境变量..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ 环境变量文件已创建"
  echo "   ⚠️  请编辑 .env 文件配置 JWT_SECRET"
  echo "   按任意键继续..."
  read
else
  echo "✅ 环境变量文件已存在"
fi

echo ""
echo "🚀 步骤 9: 启动服务..."
pm2 start server.js --name $APP_NAME
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true
echo "✅ 服务已启动"

echo ""
echo "🌐 步骤 10: 配置 Nginx..."
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"

cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
echo "✅ Nginx 配置完成"

echo ""
echo "🔥 步骤 11: 配置防火墙..."
if command -v ufw &> /dev/null; then
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  echo "✅ 防火墙配置完成"
else
  echo "⚠️  UFW 未安装，请手动配置安全组"
fi

echo ""
echo "======================================"
echo "🎉 部署完成！"
echo "======================================"
echo ""
echo "📊 服务状态:"
pm2 status
echo ""
echo "🌐 访问地址:"
echo "   http://$(hostname -I | awk '{print $1}')"
echo "   http://$(curl -s ifconfig.me 2>/dev/null || echo '服务器 IP')"
echo ""
echo "📝 后续操作:"
echo "   1. 修改默认密码（admin/admin123, terry/terry123）"
echo "   2. 配置域名和 HTTPS 证书"
echo "   3. 配置数据库备份（crontab）"
echo "   4. 配置阿里云安全组"
echo ""
echo "📖 详细文档：docs/DEPLOY-ALIYUN.md"
echo ""
