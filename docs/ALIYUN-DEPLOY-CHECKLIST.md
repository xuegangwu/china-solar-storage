# 阿里云部署 - 快速检查清单

## 📋 部署前准备

### 1. 阿里云资源
- [ ] ECS 实例已创建（2 核 4G 5M）
- [ ] 安全组规则已配置（80/443/22 端口）
- [ ] 域名已备案（如使用国内节点）
- [ ] SSH 密钥已配置

### 2. 本地准备
- [ ] 项目已打包：`solar-storage-v1.0.tar.gz`
- [ ] 文件大小检查：< 50MB
- [ ] 已测试本地运行正常

## 🚀 部署步骤（15 分钟）

### 步骤 1: 上传项目
```bash
# 本地执行
scp solar-storage-v1.0.tar.gz root@你的服务器 IP:/opt/
```

### 步骤 2: 登录服务器
```bash
ssh root@你的服务器 IP
```

### 步骤 3: 运行一键部署
```bash
# 下载部署脚本
wget https://raw.githubusercontent.com/your-repo/solar-storage/main/deploy-aliyun.sh

# 或使用已上传的脚本
cd /opt
chmod +x deploy-aliyun.sh

# 运行部署
./deploy-aliyun.sh
```

### 步骤 4: 验证部署
```bash
# 检查服务状态
pm2 status

# 应显示：
# ┌────┬─────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
# │ id │ name        │ mode     │ ↺    │ status    │ cpu      │ memory   │
# ├────┼─────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
# │ 0  │ solar-stor… │ fork     │ 0    │ online    │ 0%       │ 50.1mb   │
# └────┴─────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

### 步骤 5: 访问测试
```bash
# 获取服务器 IP
curl ifconfig.me

# 浏览器访问
http://你的服务器 IP
```

## ✅ 验证清单

### 服务状态
- [ ] PM2 服务运行正常
- [ ] Nginx 运行正常
- [ ] 防火墙已配置

### 功能测试
- [ ] 首页可访问
- [ ] 登录页可访问
- [ ] 光储龙虾页面可访问
- [ ] 政策采集页面可访问
- [ ] 登录功能正常
- [ ] API 接口正常

### 安全检查
- [ ] 默认密码已修改
- [ ] 防火墙已开启
- [ ] 安全组已配置

## 🔧 常用运维命令

### 服务管理
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs solar-storage

# 重启服务
pm2 restart solar-storage

# 停止服务
pm2 stop solar-storage

# 删除服务
pm2 delete solar-storage
```

### 数据备份
```bash
# 手动备份
/opt/backup-solar-storage.sh

# 查看备份
ls -lh /opt/backups/

# 恢复备份
cd /opt/backups
tar -xzf solar-storage_最新备份.tar.gz
cp solar-storage-db_*.db /opt/solar-storage/backend/data/solar-storage.db
pm2 restart solar-storage
```

### 日志查看
```bash
# 应用日志
pm2 logs solar-storage --lines 50

# Nginx 访问日志
tail -f /var/log/nginx/solar-storage-access.log

# Nginx 错误日志
tail -f /var/log/nginx/solar-storage-error.log

# 备份日志
tail -f /var/log/solar-storage-backup.log
```

## 🐛 故障排查

### 问题 1: 服务无法访问
```bash
# 1. 检查服务状态
pm2 status

# 2. 检查端口
netstat -tlnp | grep 3000

# 3. 检查防火墙
ufw status

# 4. 检查安全组（阿里云控制台）
```

### 问题 2: 数据库错误
```bash
# 1. 重启服务
pm2 restart solar-storage

# 2. 检查数据库文件
ls -lh /opt/solar-storage/backend/data/

# 3. 恢复备份
/opt/backup-solar-storage.sh
```

### 问题 3: Nginx 错误
```bash
# 1. 测试配置
nginx -t

# 2. 重启 Nginx
systemctl restart nginx

# 3. 查看错误日志
tail -f /var/log/nginx/solar-storage-error.log
```

### 问题 4: 内存不足
```bash
# 1. 查看内存
free -h

# 2. 优化 Node.js 内存
export NODE_OPTIONS="--max-old-space-size=512"
pm2 restart solar-storage

# 3. 升级服务器配置（阿里云控制台）
```

## 📊 性能监控

### PM2 监控
```bash
# 实时监控
pm2 monit

# CPU/内存使用
pm2 show solar-storage
```

### 系统监控
```bash
# 安装监控工具
apt install -y htop iotop

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看网络
iftop
```

### 阿里云监控
1. 登录阿里云控制台
2. 云监控 → 主机监控
3. 查看 CPU/内存/磁盘/网络
4. 配置告警规则

## 🔒 安全加固

### 修改默认密码
```bash
# 通过 API 修改
curl -X POST http://localhost:3000/api/users/1/reset-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"new_password": "YourStrongPassword123!"}'
```

### 配置 HTTPS
```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

### 配置 Fail2Ban
```bash
# 安装
apt install -y fail2ban

# 启动
systemctl start fail2ban
systemctl enable fail2ban

# 查看状态
systemctl status fail2ban
```

## 📈 成本优化

### 初期（<100 用户/天）
- ECS 2 核 2G 1M: ¥119/月
- 总计：约¥125/月

### 成长期（100-1000 用户/天）
- ECS 2 核 4G 3M: ¥199/月
- 总计：约¥205/月

### 成熟期（>1000 用户/天）
- ECS 4 核 8G 5M: ¥399/月
- RDS MySQL: ¥150/月
- SLB: ¥50/月
- 总计：约¥605/月

## 📞 技术支持

### 日志收集
```bash
# 收集所有日志
pm2 logs > /tmp/pm2-logs.txt
tail -100 /var/log/nginx/solar-storage-error.log > /tmp/nginx-error.txt
tar -czf logs-$(date +%Y%m%d).tar.gz /tmp/pm2-logs.txt /tmp/nginx-error.txt
```

### 系统信息
```bash
# 收集系统信息
uname -a > /tmp/sysinfo.txt
free -h >> /tmp/sysinfo.txt
df -h >> /tmp/sysinfo.txt
cat /etc/os-release >> /tmp/sysinfo.txt
```

---

**部署完成后，请逐项检查本清单！** ✅
