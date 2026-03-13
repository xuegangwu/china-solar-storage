# 阿里云部署完整指南

> 版本：v1.0  
> 日期：2026-03-11  
> 目标：将光储龙虾系统部署到阿里云 ECS

## 1. 部署前准备

### 1.1 阿里云资源准备

| 资源 | 配置建议 | 月费用 | 必需 |
|-----|---------|--------|------|
| ECS 实例 | 2 核 4G 5M 带宽 | ¥199 | ✅ |
| 域名 | .com/.cn | ¥6/月 | 推荐 |
| SSL 证书 | 免费版 | ¥0 | 推荐 |
| RDS | MySQL 基础版 | ¥150 | 可选 |
| OSS | 对象存储 | ¥10 | 可选 |

**最低配置**: ¥199/月 (ECS 2 核 4G 5M)

### 1.2 本地准备

```bash
# 1. 打包项目
cd /home/admin/openclaw/workspace/projects/china-solar-storage
tar -czf solar-storage-v1.0.tar.gz \
  --exclude='backend/node_modules' \
  --exclude='backend/data/*.db' \
  --exclude='backend/crawlers/*.json' \
  backend/ web/ docs/ README.md

# 2. 检查文件大小
ls -lh solar-storage-v1.0.tar.gz

# 3. 准备上传
```

## 2. 服务器环境配置

### 2.1 连接服务器

```bash
# SSH 登录
ssh root@your-server-ip

# 或使用阿里云 Workbench
# 控制台 → ECS → 远程连接
```

### 2.2 系统更新

```bash
# 更新系统包
apt update && apt upgrade -y

# 安装必要工具
apt install -y curl git wget vim unzip
```

### 2.3 安装 Node.js

```bash
# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node -v  # v20.x
npm -v   # 10.x
```

### 2.4 安装 PM2（进程管理）

```bash
# 全局安装 PM2
npm install -g pm2

# 配置 PM2 开机自启
pm2 startup
# 执行输出的命令
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# 保存 PM2 配置
pm2 save
```

### 2.5 安装 Nginx

```bash
# 安装 Nginx
apt install -y nginx

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 验证
systemctl status nginx
```

### 2.6 配置防火墙

```bash
# 安装 UFW
apt install -y ufw

# 配置规则
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# 启用防火墙
ufw enable
ufw status
```

### 2.7 配置阿里云安全组

**阿里云控制台操作**:
1. 登录阿里云控制台
2. ECS → 实例
3. 安全组 → 配置规则
4. 添加入方向规则:
   - 端口 22 (SSH)
   - 端口 80 (HTTP)
   - 端口 443 (HTTPS)

## 3. 应用部署

### 3.1 上传项目

```bash
# 方式 1: SCP 上传（本地执行）
scp solar-storage-v1.0.tar.gz root@your-server-ip:/opt/

# 方式 2: 使用 Git
cd /opt
git clone https://github.com/your-repo/solar-storage.git

# 方式 3: 使用阿里云 OSS
# 上传到 OSS → ECS 下载
```

### 3.2 解压项目

```bash
cd /opt
mkdir -p solar-storage
tar -xzf solar-storage-v1.0.tar.gz -C solar-storage
cd solar-storage
```

### 3.3 安装依赖

```bash
cd /opt/solar-storage/backend

# 安装 Node.js 依赖
npm install --production

# 验证安装
npm list --depth=0
```

### 3.4 配置环境变量

```bash
# 创建.env 文件
cd /opt/solar-storage/backend
cat > .env << 'EOF'
# 服务配置
PORT=3000
NODE_ENV=production

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)
JWT_EXPIRES_IN=7d

# 数据库配置
DATABASE_TYPE=sqlite
DATABASE_PATH=/opt/solar-storage/backend/data/solar-storage.db

# 翻译服务（可选）
DEEPL_API_KEY=your_deepl_api_key
EOF

# 设置权限
chmod 600 .env
```

### 3.5 初始化数据库

```bash
cd /opt/solar-storage/backend

# 创建数据目录
mkdir -p data

# 初始化数据库
node scripts/init-db.js

# 验证数据库
ls -lh data/solar-storage.db
```

### 3.6 使用 PM2 启动服务

```bash
cd /opt/solar-storage/backend

# 启动服务
pm2 start server.js --name solar-storage

# 查看状态
pm2 status

# 查看日志
pm2 logs solar-storage

# 保存配置
pm2 save
```

### 3.7 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置文件
cat > /etc/nginx/sites-available/solar-storage << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器 IP
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # 日志
    access_log /var/log/nginx/solar-storage-access.log;
    error_log /var/log/nginx/solar-storage-error.log;
    
    # 静态文件
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
        
        # 静态资源缓存
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API 限流
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 限流配置
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
EOF

# 启用配置
ln -s /etc/nginx/sites-available/solar-storage /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 3.8 配置 HTTPS（可选但推荐）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书（需要域名）
certbot --nginx -d your-domain.com

# 自动续期测试
certbot renew --dry-run

# 验证 HTTPS
curl -I https://your-domain.com
```

## 4. 数据备份

### 4.1 创建备份脚本

```bash
# 创建备份脚本
cat > /opt/backup-solar-storage.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp /opt/solar-storage/backend/data/solar-storage.db \
   $BACKUP_DIR/solar-storage-db_$DATE.db

# 备份.env 文件
cp /opt/solar-storage/backend/.env \
   $BACKUP_DIR/solar-storage-env_$DATE

# 压缩备份
cd $BACKUP_DIR
tar -czf solar-storage_$DATE.tar.gz \
   solar-storage-db_$DATE.db \
   solar-storage-env_$DATE

# 清理旧备份
find $BACKUP_DIR -name "solar-storage_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 清理临时文件
rm -f $BACKUP_DIR/solar-storage-db_$DATE.db
rm -f $BACKUP_DIR/solar-storage-env_$DATE

echo "Backup completed: solar-storage_$DATE.tar.gz"
EOF

# 设置执行权限
chmod +x /opt/backup-solar-storage.sh
```

### 4.2 配置定时备份

```bash
# 编辑 crontab
crontab -e

# 添加每日凌晨 2 点备份
0 2 * * * /opt/backup-solar-storage.sh >> /var/log/solar-storage-backup.log 2>&1
```

### 4.3 备份到 OSS（可选）

```bash
# 安装 ossutil
wget http://gosspublic.alicdn.com/ossutil/1.7.19/ossutil64
chmod 755 ossutil64
mv ossutil64 /usr/bin/ossutil

# 配置 OSS
ossutil config -i your-access-key-id -k your-access-key-secret -e oss-cn-hangzhou.aliyuncs.com

# 上传备份
ossutil cp /opt/backups/solar-storage_$(date +%Y%m%d).tar.gz oss://your-bucket/backups/
```

## 5. 监控与日志

### 5.1 PM2 监控

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs solar-storage

# 监控 CPU/内存
pm2 monit

# 设置告警
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 5.2 系统监控

```bash
# 安装监控工具
apt install -y htop iotop nethogs

# 查看资源使用
htop

# 查看磁盘使用
df -h

# 查看网络
nethogs
```

### 5.3 阿里云监控

**配置步骤**:
1. 阿里云控制台 → 云监控
2. 主机监控 → 安装插件
3. 配置告警规则:
   - CPU 使用率 > 80%
   - 内存使用率 > 80%
   - 磁盘使用率 > 85%
   - 网络流量异常

## 6. 性能优化

### 6.1 Node.js 优化

```bash
# 设置 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=512"

# 在 PM2 中配置
pm2 start server.js --name solar-storage --max-memory-restart 512M
```

### 6.2 Nginx 优化

```nginx
# 启用 Gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml 
           application/javascript application/json;

# 开启连接复用
keepalive_timeout 65;
keepalive_requests 100;

# 客户端 body 大小限制
client_max_body_size 10M;
```

### 6.3 数据库优化

```bash
# SQLite 优化（如果数据量大，建议迁移到 PostgreSQL）
# 在代码中配置 WAL 模式
sqlite3 data/solar-storage.db "PRAGMA journal_mode=WAL;"
sqlite3 data/solar-storage.db "PRAGMA synchronous=NORMAL;"
sqlite3 data/solar-storage.db "PRAGMA cache_size=10000;"
```

## 7. 安全加固

### 7.1 修改默认密码

```bash
# 通过 API 修改管理员密码
curl -X POST http://localhost:3000/api/users/1/reset-password \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_password": "YourStrongPassword123!"}'
```

### 7.2 配置 Fail2Ban

```bash
# 安装 Fail2Ban
apt install -y fail2ban

# 配置 SSH 保护
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

# 启动 Fail2Ban
systemctl start fail2ban
systemctl enable fail2ban
```

### 7.3 定期更新

```bash
# 设置自动安全更新
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades

# 定期更新 Node.js 依赖
cd /opt/solar-storage/backend
npm audit
npm update
pm2 restart solar-storage
```

## 8. 部署验证

### 8.1 功能验证清单

```bash
# 1. 检查服务状态
pm2 status
# 应显示 solar-storage 为 online

# 2. 检查 Nginx
systemctl status nginx

# 3. 健康检查
curl http://localhost:3000/api/health
curl http://your-domain.com/api/health

# 4. 测试登录
curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 5. 测试页面
curl http://your-domain.com/
curl http://your-domain.com/longi.html
curl http://your-domain.com/global-policies.html
```

### 8.2 性能测试

```bash
# 安装 ab（Apache Benchmark）
apt install -y apache2-utils

# 压力测试
ab -n 1000 -c 10 http://your-domain.com/

# 查看响应时间
# 应 < 500ms
```

### 8.3 监控验证

```bash
# 查看 PM2 日志
pm2 logs solar-storage --lines 50

# 查看 Nginx 日志
tail -f /var/log/nginx/solar-storage-access.log
tail -f /var/log/nginx/solar-storage-error.log

# 查看系统资源
htop
```

## 9. 故障排查

### 9.1 常见问题

**问题 1: 服务无法访问**
```bash
# 检查服务状态
pm2 status
pm2 logs solar-storage

# 检查防火墙
ufw status

# 检查安全组
# 阿里云控制台 → 安全组
```

**问题 2: 数据库锁定**
```bash
# 重启服务
pm2 restart solar-storage

# 如仍有问题，恢复备份
/opt/backup-solar-storage.sh
```

**问题 3: 内存不足**
```bash
# 查看内存使用
free -h

# 优化 Node.js 内存
export NODE_OPTIONS="--max-old-space-size=512"
pm2 restart solar-storage
```

**问题 4: Nginx 配置错误**
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/solar-storage-error.log
```

### 9.2 紧急恢复

```bash
# 1. 停止服务
pm2 stop solar-storage

# 2. 恢复备份
cd /opt/backups
tar -xzf solar-storage_最新备份.tar.gz -C /opt/

# 3. 重启服务
pm2 start solar-storage
pm2 save
```

## 10. 成本估算

### 10.1 月度成本

| 项目 | 配置 | 费用 |
|-----|------|------|
| ECS | 2 核 4G 5M | ¥199 |
| 域名 | .com | ¥6 |
| SSL | 免费版 | ¥0 |
| 备份 | OSS 50GB | ¥10 |
| **总计** | - | **约¥215/月** |

### 10.2 优化建议

**初期（<100 用户/天）**:
- ECS 2 核 2G 1M: ¥119/月
- 总计：约¥125/月

**成长期（100-1000 用户/天）**:
- ECS 2 核 4G 3M: ¥199/月
- RDS MySQL: ¥150/月
- 总计：约¥355/月

**成熟期（>1000 用户/天）**:
- ECS 4 核 8G 5M: ¥399/月
- RDS MySQL 高可用：¥300/月
- SLB 负载均衡：¥50/月
- 总计：约¥755/月

## 11. 部署检查清单

### 部署前
- [ ] 阿里云账号准备
- [ ] ECS 实例创建
- [ ] 域名备案（如使用国内节点）
- [ ] 本地项目打包

### 部署中
- [ ] 服务器环境配置
- [ ] Node.js 安装
- [ ] PM2 安装
- [ ] Nginx 安装
- [ ] 项目上传
- [ ] 依赖安装
- [ ] 数据库初始化
- [ ] PM2 启动
- [ ] Nginx 配置
- [ ] HTTPS 配置

### 部署后
- [ ] 功能验证
- [ ] 性能测试
- [ ] 备份配置
- [ ] 监控配置
- [ ] 安全加固
- [ ] 文档更新

---

**部署完成！** 🎉

**访问地址**: http://your-domain.com  
**后台管理**: http://your-domain.com/login-v1.0.html

**技术支持**: 查看日志 `/var/log/nginx/` 和 `pm2 logs`
