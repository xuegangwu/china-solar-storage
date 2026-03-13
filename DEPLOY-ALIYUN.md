# 🚀 阿里云部署完整指南

> **服务器 IP:** 121.43.69.200  
> **部署时间：** 2026-03-13  
> **预计时间：** 10-15 分钟

---

## 📋 部署前准备

### 1. 确认服务器信息

**服务器：** 阿里云 ECS  
**IP 地址：** 121.43.69.200  
**系统：** Ubuntu 20.04/22.04  
**用户：** root

### 2. 测试 SSH 连接

```bash
# 测试连接
ssh -i ~/.ssh/id_ed25519 root@121.43.69.200

# 如果提示权限问题，执行：
chmod 600 ~/.ssh/id_ed25519

# 如果连接失败，检查：
# 1. 服务器安全组是否放行 22 端口
# 2. SSH 服务是否运行
# 3. 密钥是否正确
```

### 3. 配置 SSH（可选，方便后续连接）

```bash
# 编辑 SSH 配置
nano ~/.ssh/config

# 添加以下内容
Host solar-server
    HostName 121.43.69.200
    User root
    IdentityFile ~/.ssh/id_ed25519

# 保存后，以后可以直接
ssh solar-server
```

---

## 🚀 快速部署（推荐）

### 方式 1：一条命令完成

```bash
ssh -i ~/.ssh/id_ed25519 root@121.43.69.200 "bash -s" < deploy.sh
```

### 方式 2：分步执行

```bash
# 1. 上传部署脚本
scp -i ~/.ssh/id_ed25519 deploy.sh root@121.43.69.200:/root/

# 2. SSH 登录
ssh -i ~/.ssh/id_ed25519 root@121.43.69.200

# 3. 执行部署
cd /root
chmod +x deploy.sh
bash deploy.sh
```

---

## 📝 手动部署（详细步骤）

### Step 1: SSH 登录服务器

```bash
ssh -i ~/.ssh/id_ed25519 root@121.43.69.200
```

### Step 2: 更新系统并安装依赖

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装其他工具
apt install -y git nginx wget curl ufw

# 安装 PM2
npm install -g pm2

# 验证安装
node -v
npm -v
git --version
```

### Step 3: 克隆项目代码

```bash
# 创建应用目录
mkdir -p /var/www/solar-storage-map
cd /var/www/solar-storage-map

# 克隆代码
git clone https://github.com/xuegangwu/china-solar-storage.git .

# 或者如果没有 git，使用 wget 下载
# wget https://github.com/xuegangwu/china-solar-storage/archive/refs/heads/main.zip
# apt install -y unzip
# unzip main.zip
# mv china-solar-storage-main/* .
```

### Step 4: 安装后端依赖

```bash
cd /var/www/solar-storage-map/server

# 安装依赖
npm install

# 创建日志目录
mkdir -p logs
mkdir -p storage/db
```

### Step 5: 配置环境变量

```bash
cd /var/www/solar-storage-map/server

# 创建 .env 文件
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=/var/www/solar-storage-map/server/storage/db/nocobase.db
JWT_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=http://121.43.69.200
API_URL=http://121.43.69.200:3001
EOF

# 生成 JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
```

### Step 6: 配置 Nginx

```bash
# 创建 Nginx 配置文件
cat > /etc/nginx/sites-available/solar-storage-map << 'EOF'
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
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/solar-storage-map /etc/nginx/sites-enabled/solar-storage-map
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx
```

### Step 7: 启动应用

```bash
cd /var/www/solar-storage-map/server

# 启动 PM2
pm2 start src/server.js --name solar-api --max-memory-restart 512M

# 设置开机自启
pm2 save
pm2 startup | tail -1 | bash

# 查看状态
pm2 status
pm2 logs solar-api
```

### Step 8: 配置防火墙

```bash
# 安装 UFW
apt install -y ufw

# 配置规则
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3001/tcp  # API

# 启用防火墙
ufw --force enable
ufw status
```

### Step 9: 测试访问

```bash
# 测试首页
curl http://121.43.69.200

# 测试 API
curl http://121.43.69.200/api/health

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
```

---

## ✅ 部署验证

### 访问测试

**打开浏览器访问：**

1. **登录页面：** http://121.43.69.200
   - 应该显示登录/注册页面
   
2. **API 健康检查：** http://121.43.69.200/api/health
   - 应该返回：`{"status": "ok", ...}`

3. **投资地图主页：** http://121.43.69.200/dashboard.html
   - 未登录应该跳转到登录页

### 功能测试

```bash
# 1. 测试前端页面
curl http://121.43.69.200 | grep "光储投资地图"

# 2. 测试 API 服务
curl http://121.43.69.200/api/provinces

# 3. 查看服务状态
pm2 status
systemctl status nginx

# 4. 查看端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :3001
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
tail -f /var/log/nginx/error.log

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
# 1. 拉取最新代码
cd /var/www/solar-storage-map
git pull origin main

# 2. 安装新依赖
cd server
npm install

# 3. 重启服务
pm2 restart solar-api
```

### 备份数据

```bash
# 备份数据库
cp /var/www/solar-storage-map/server/storage/db/nocobase.db \
   /backups/nocobase-$(date +%Y%m%d).db

# 备份到 OSS（如果配置了）
# ossutil cp /backups oss://your-bucket/backups/
```

---

## 🆘 故障排查

### 问题 1: SSH 无法连接

```bash
# 检查服务器是否运行
ping 121.43.69.200

# 检查 SSH 端口
telnet 121.43.69.200 22

# 检查安全组
# 登录阿里云控制台 -> ECS -> 安全组
# 确保放行 22 端口
```

### 问题 2: 页面无法访问

```bash
# 检查 Nginx 状态
systemctl status nginx

# 检查 Nginx 配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 检查端口占用
netstat -tlnp | grep :80
```

### 问题 3: API 无法访问

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

### 问题 4: 内存不足

```bash
# 查看内存
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

## 📊 部署检查清单

### 部署前
- [ ] 服务器已购买（121.43.69.200）
- [ ] SSH 密钥已配置
- [ ] 安全组已放行 22/80/443/3001 端口
- [ ] 服务器可以访问外网

### 部署中
- [ ] 系统依赖已安装
- [ ] 代码已克隆
- [ ] 后端依赖已安装
- [ ] 环境变量已配置
- [ ] Nginx 已配置
- [ ] 应用已启动

### 部署后
- [ ] 首页可以访问（http://121.43.69.200）
- [ ] API 正常响应（/api/health）
- [ ] PM2 服务运行正常
- [ ] Nginx 运行正常
- [ ] 防火墙已配置
- [ ] 日志正常无报错

---

## 🎯 下一步

### 立即可做
1. ✅ 执行部署脚本
2. ✅ 测试访问
3. ✅ 配置域名（如有）

### 短期计划
1. ⏳ 申请 SSL 证书
2. ⏳ 配置 HTTPS
3. ⏳ 配置 RDS PostgreSQL
4. ⏳ 配置 OSS 存储

### 长期计划
1. ⏳ 配置 CDN 加速
2. ⏳ 配置 Redis 缓存
3. ⏳ 配置自动备份
4. ⏳ 配置监控告警

---

## 📞 需要帮助？

### 部署遇到问题？

1. **查看日志**
   ```bash
   pm2 logs solar-api
   tail -f /var/log/nginx/error.log
   ```

2. **检查服务状态**
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

**访问地址：**
- 登录页面：http://121.43.69.200
- 投资地图主页：http://121.43.69.200/dashboard.html
- 中国区地图：http://121.43.69.200/map-v1.0.html
- 欧洲区地图：http://121.43.69.200/europe-map.html
- API 文档：http://121.43.69.200/api-docs

**下一步：**
1. ✅ 测试所有功能
2. ⏳ 配置域名（如有）
3. ⏳ 申请 SSL 证书
4. ⏳ 配置数据库（可选）
5. ⏳ 配置对象存储（可选）

---

**📝 文档版本：** v2.0  
**📅 更新日期：** 2026-03-13  
**🖥️ 服务器 IP：** 121.43.69.200
