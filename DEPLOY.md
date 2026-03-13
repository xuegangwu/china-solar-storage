# 🚀 快速部署指南 - 服务器 121.43.69.200

---

## 📋 部署方式（2 选 1）

### 方式 1：自动部署（推荐⭐）

**只需 3 条命令，10 分钟完成！**

```bash
# 1. SSH 登录服务器
ssh root@121.43.69.200

# 2. 上传并执行部署脚本
cd /root
wget https://raw.githubusercontent.com/xuegangwu/china-solar-storage/main/quick-deploy.sh
chmod +x quick-deploy.sh
bash quick-deploy.sh

# 3. 等待完成（约 5-10 分钟）
```

---

### 方式 2：手动部署

**适合想逐步配置的用户**

```bash
# 1. SSH 登录
ssh root@121.43.69.200

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 3. 安装 PM2
npm install -g pm2

# 4. 安装 Nginx
apt install -y nginx

# 5. 克隆代码
mkdir -p /var/www/solar-storage-map
cd /var/www/solar-storage-map
git clone https://github.com/xuegangwu/china-solar-storage.git .

# 6. 安装后端依赖
cd server
npm install

# 7. 创建环境变量
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=/var/www/solar-storage-map/server/storage/db/nocobase.db
JWT_SECRET=$(openssl rand -base64 32)
EOF

# 8. 配置 Nginx
cat > /etc/nginx/sites-available/solar-storage-map << 'EOF'
server {
    listen 80;
    server_name 121.43.69.200;
    
    location / {
        root /var/www/solar-storage-map/web;
        index index.html;
        try_files $uri $uri/ /index.html;
        gzip on;
        gzip_types text/plain text/css application/json application/javascript;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 9. 启用配置
ln -sf /etc/nginx/sites-available/solar-storage-map /etc/nginx/sites-enabled/solar-storage-map
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 10. 启动应用
cd /var/www/solar-storage-map/server
pm2 start src/server.js --name solar-api
pm2 save
pm2 startup
```

---

## ✅ 部署完成后

### 访问地址

**使用 IP 访问：**
- 🏠 首页：http://121.43.69.200
- 📊 API 文档：http://121.43.69.200/api-docs
- 🔔 通知中心：http://121.43.69.200/notification-center.html
- 🗺️ 中国区地图：http://121.43.69.200/map-v1.0.html
- 🇪🇺 欧洲区地图：http://121.43.69.200/europe-map.html
- 🧮 收益计算器：http://121.43.69.200/calculator.html

### 测试命令

```bash
# 测试首页
curl http://121.43.69.200

# 测试 API 健康
curl http://121.43.69.200/api/health

# 测试省份列表
curl http://121.43.69.200/api/provinces

# 查看服务状态
pm2 status
systemctl status nginx
```

---

## 🔧 运维管理

### 常用命令

```bash
# 查看服务状态
pm2 status
systemctl status nginx

# 查看日志
pm2 logs solar-api
tail -f /var/log/nginx/access.log

# 重启服务
pm2 restart solar-api
systemctl restart nginx

# 停止服务
pm2 stop solar-api
systemctl stop nginx

# 查看资源使用
df -h          # 磁盘
free -h        # 内存
top            # CPU
```

### 更新部署

```bash
# 拉取最新代码
cd /var/www/solar-storage-map
git pull origin main

# 安装新依赖
cd server
npm install

# 重启服务
pm2 restart solar-api
```

---

## 🔒 安全建议

### 配置防火墙

```bash
# 安装 UFW
apt install -y ufw

# 配置规则
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3001/tcp  # API

# 启用
ufw enable
ufw status
```

### 配置 SSL（可选）

```bash
# 申请免费 SSL 证书
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com

# 配置后自动开启 HTTPS
```

---

## 📊 系统要求检查

### 最低配置
- ✅ CPU: 2 核
- ✅ 内存：4GB
- ✅ 磁盘：50GB
- ✅ 带宽：5Mbps
- ✅ 系统：Ubuntu 20.04+

### 推荐配置
- ✅ CPU: 4 核
- ✅ 内存：8GB
- ✅ 磁盘：100GB
- ✅ 带宽：10Mbps
- ✅ 系统：Ubuntu 22.04

---

## 🎯 部署检查清单

### 部署前
- [ ] 服务器已购买（IP: 121.43.69.200）
- [ ] 可以 SSH 登录
- [ ] 服务器可以访问外网

### 部署中
- [ ] 执行部署脚本
- [ ] 等待安装完成（5-10 分钟）
- [ ] 检查无报错

### 部署后
- [ ] 访问 http://121.43.69.200 显示首页
- [ ] API 接口正常响应
- [ ] Nginx 运行正常
- [ ] PM2 服务运行正常

---

## 🆘 故障排查

### 问题 1：无法访问首页

```bash
# 检查 Nginx 状态
systemctl status nginx

# 检查端口占用
netstat -tlnp | grep :80

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 问题 2：API 无法访问

```bash
# 检查 PM2 服务
pm2 status

# 查看应用日志
pm2 logs solar-api

# 检查端口
netstat -tlnp | grep :3001

# 重启服务
pm2 restart solar-api
```

### 问题 3：内存不足

```bash
# 查看内存使用
free -h

# 如果内存不足，创建 swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 📞 需要帮助？

### 部署遇到问题？

1. **检查日志**
   ```bash
   pm2 logs solar-api
   tail -f /var/log/nginx/error.log
   ```

2. **查看服务状态**
   ```bash
   pm2 status
   systemctl status nginx
   ```

3. **重启服务**
   ```bash
   pm2 restart solar-api
   systemctl restart nginx
   ```

4. **联系支持**
   - GitHub Issues: https://github.com/xuegangwu/china-solar-storage/issues
   - 邮箱：wuxuegang@gmail.com

---

## 🎉 部署成功！

**恭喜！您的光储投资地图已部署到阿里云！**

**访问地址：** http://121.43.69.200

**下一步：**
1. ✅ 测试所有功能
2. ⏳ 配置域名（如有）
3. ⏳ 申请 SSL 证书
4. ⏳ 配置 RDS PostgreSQL（可选）
5. ⏳ 配置 OSS 存储（可选）

---

**📝 文档版本：** v1.0  
**📅 更新日期：** 2026-03-13  
**🖥️ 服务器 IP：** 121.43.69.200
