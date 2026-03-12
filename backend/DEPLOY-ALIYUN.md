# 阿里云部署指南

> 版本：v1.0  
> 目标：部署到阿里云 ECS

## 📋 前置准备

### 1. 阿里云资源

- ✅ ECS 实例（Ubuntu 20.04/22.04）
- ✅ 安全组规则（开放 80/443/3000 端口）
- ✅ 域名（可选，用于 HTTPS）
- ✅ SSL 证书（可选，阿里云免费证书）

### 2. 本地准备

```bash
# 确保项目完整
cd /home/admin/openclaw/workspace/projects/china-solar-storage

# 打包项目（排除 node_modules）
tar -czf solar-storage-v1.0.tar.gz \
  --exclude='backend/node_modules' \
  --exclude='backend/data/*.db' \
  backend/ web/ docs/ README.md
```

## 🚀 部署步骤

### 步骤 1：上传到阿里云

```bash
# 使用 scp 上传
scp solar-storage-v1.0.tar.gz root@your-server-ip:/opt/

# 或使用 FTP 工具（FileZilla 等）
```

### 步骤 2：安装 Node.js

```bash
# 登录阿里云 ECS
ssh root@your-server-ip

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 验证安装
node -v  # v20.x
npm -v   # 10.x
```

### 步骤 3：解压并安装依赖

```bash
cd /opt
tar -xzf solar-storage-v1.0.tar.gz
cd backend

# 安装依赖
npm install --production
```

### 步骤 4：初始化数据库

```bash
node scripts/init-db.js
```

### 步骤 5：配置环境变量

```bash
cp .env.example .env
nano .env

# 修改配置：
PORT=3000
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### 步骤 6：安装 PM2（进程管理）

```bash
npm install -g pm2

# 启动服务
cd /opt/backend
pm2 start server.js --name solar-storage

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs solar-storage
```

### 步骤 7：配置 Nginx（反向代理）

```bash
apt-get install -y nginx

# 创建配置文件
nano /etc/nginx/sites-available/solar-storage

# 配置内容：
server {
    listen 80;
    server_name your-domain.com;  # 或服务器 IP
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
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
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# 启用配置
ln -s /etc/nginx/sites-available/solar-storage /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 步骤 8：配置 HTTPS（可选但推荐）

```bash
# 安装 Certbot
apt-get install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期（已自动配置 cron）
certbot renew --dry-run
```

### 步骤 9：配置防火墙

```bash
# 使用 ufw
apt-get install -y ufw
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

### 步骤 10：配置阿里云安全组

登录阿里云控制台 → ECS → 安全组 → 配置规则：

| 端口 | 协议 | 授权对象 | 说明 |
|-----|------|---------|------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

## 📊 监控与维护

### 查看日志

```bash
# 应用日志
pm2 logs solar-storage

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 系统日志
journalctl -u nginx -f
```

### 数据库备份

```bash
# 创建备份脚本
nano /opt/backup-db.sh

#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /opt/backend/data/solar-storage.db $BACKUP_DIR/solar-storage_$DATE.db

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.db" -mtime +7 -delete

# 设置执行权限
chmod +x /opt/backup-db.sh

# 添加定时任务（每天凌晨 2 点）
crontab -e
0 2 * * * /opt/backup-db.sh
```

### 应用更新

```bash
# 1. 上传新版本
scp solar-storage-v1.1.tar.gz root@your-server-ip:/opt/

# 2. 备份当前版本
cd /opt
mv backend backend.backup

# 3. 解压新版本
tar -xzf solar-storage-v1.1.tar.gz

# 4. 恢复数据库（如果有新数据）
cp backend.backup/data/solar-storage.db backend/data/

# 5. 安装依赖
cd backend
npm install --production

# 6. 重启服务
pm2 restart solar-storage

# 7. 验证
curl http://localhost:3000/api/health
```

### 性能监控

```bash
# 安装 PM2 Plus（免费监控）
pm2 plus

# 或使用阿里云监控
# 控制台 → 云监控 → 主机监控
```

## 🔐 安全加固

### 1. 修改默认密码

```bash
# 登录后台修改 admin 和 terry 的密码
# 或使用 API：
curl -X POST http://localhost:3000/api/users/1/reset-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"new_password": "your-strong-password"}'
```

### 2. 配置 Fail2Ban

```bash
apt-get install -y fail2ban
nano /etc/fail2ban/jail.local

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600

systemctl restart fail2ban
```

### 3. 定期更新系统

```bash
# 设置自动更新
apt-get install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

## 📈 扩展方案

### 负载均衡（高并发）

```nginx
upstream solar_storage {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://solar_storage;
    }
}
```

### 数据库迁移（PostgreSQL）

```bash
# 安装 PostgreSQL
apt-get install -y postgresql postgresql-contrib

# 创建数据库
sudo -u postgres psql
CREATE DATABASE solar_storage;
CREATE USER solar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE solar_storage TO solar_user;
```

### 使用 RDS（阿里云托管数据库）

1. 阿里云控制台 → RDS → 创建实例
2. 获取连接字符串
3. 修改后端代码使用 PostgreSQL
4. 更新 .env 配置

## 💰 成本估算（阿里云）

| 资源 | 配置 | 月费用 |
|-----|------|--------|
| ECS | 2 核 4G | ¥199 |
| 带宽 | 3Mbps | ¥162 |
| 域名 | .com | ¥6/月 |
| SSL | 免费 | ¥0 |
| **总计** | - | **约¥367/月** |

## ⚠️ 常见问题

### 1. 服务无法访问
```bash
# 检查安全组
# 检查防火墙
ufw status

# 检查 Nginx
systemctl status nginx

# 检查 PM2
pm2 status
```

### 2. 数据库锁定
```bash
# 重启服务
pm2 restart solar-storage

# 如仍有问题，恢复备份
cp /opt/backups/solar-storage_*.db /opt/backend/data/solar-storage.db
```

### 3. 内存不足
```bash
# 查看内存
free -h

# 优化 Node.js 内存
export NODE_OPTIONS="--max-old-space-size=512"
pm2 restart solar-storage
```

## 📞 技术支持

- **API 文档**: API.md
- **部署文档**: 本文件
- **阿里云文档**: https://help.aliyun.com

---

**部署完成检查清单**:

- [ ] 服务正常运行（pm2 status）
- [ ] Nginx 反向代理正常
- [ ] HTTPS 证书有效
- [ ] 数据库备份配置
- [ ] 监控告警配置
- [ ] 默认密码已修改
- [ ] 防火墙配置正确
- [ ] 安全组规则配置

**部署成功！** 🎉
