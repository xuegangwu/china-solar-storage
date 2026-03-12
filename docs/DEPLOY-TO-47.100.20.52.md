# 部署到 47.100.20.52 - 操作指南

## 📦 已准备文件

| 文件 | 大小 | 位置 |
|-----|------|------|
| `solar-storage-deploy.tar.gz` | 已打包 | `/home/admin/openclaw/workspace/projects/china-solar-storage/` |
| `deploy-aliyun.sh` | 一键部署脚本 | 同上 |

## 🚀 部署步骤

### 步骤 1: 上传文件到服务器

**在本地执行**（选择一种方式）：

#### 方式 A: SCP 上传
```bash
# 在项目目录执行
cd /home/admin/openclaw/workspace/projects/china-solar-storage

# 上传项目包
scp solar-storage-deploy.tar.gz root@47.100.20.52:/opt/

# 上传部署脚本
scp deploy-aliyun.sh root@47.100.20.52:/opt/
```

#### 方式 B: 使用 FileZilla
1. 打开 FileZilla
2. 主机：`47.100.20.52`
3. 用户名：`root`
4. 密码/密钥：你的服务器密码
5. 拖拽文件到 `/opt/` 目录

#### 方式 C: 使用阿里云 Workbench
1. 登录阿里云控制台
2. ECS → 实例 → 47.100.20.52
3. 远程连接 → Workbench
4. 上传文件按钮 → 选择文件上传

### 步骤 2: 登录服务器

```bash
ssh root@47.100.20.52
```

### 步骤 3: 运行一键部署

```bash
# 进入目录
cd /opt

# 检查文件
ls -lh

# 应该看到：
# solar-storage-deploy.tar.gz
# deploy-aliyun.sh

# 给脚本执行权限
chmod +x deploy-aliyun.sh

# 运行部署
./deploy-aliyun.sh
```

### 步骤 4: 等待部署完成

部署过程约 5-10 分钟，会自动完成：
- ✅ 系统更新
- ✅ Node.js 安装
- ✅ PM2 安装
- ✅ Nginx 安装
- ✅ 项目解压
- ✅ 依赖安装
- ✅ 数据库初始化
- ✅ 应用启动
- ✅ Nginx 配置

### 步骤 5: 验证部署

```bash
# 检查服务状态
pm2 status

# 应该显示 online

# 测试 API
curl http://localhost:3000/api/health

# 测试页面
curl http://localhost:3000/
```

### 步骤 6: 访问网站

打开浏览器访问：
```
http://47.100.20.52
```

## 🔧 故障排查

### 问题 1: SSH 连接失败

**错误**: `Connection timed out`

**解决**:
1. 检查服务器是否开机（阿里云控制台）
2. 检查安全组是否开放 22 端口
3. 检查 SSH 密码/密钥是否正确

**测试**:
```bash
ping 47.100.20.52
ssh -v root@47.100.20.52
```

### 问题 2: 上传失败

**错误**: `Permission denied`

**解决**:
```bash
# 确保使用 root 用户
ssh root@47.100.20.52

# 或使用 sudo
scp solar-storage-deploy.tar.gz your-user@47.100.20.52:/tmp/
ssh root@47.100.20.52 "mv /tmp/solar-storage-deploy.tar.gz /opt/"
```

### 问题 3: 部署脚本执行失败

**错误**: `Permission denied`

**解决**:
```bash
chmod +x /opt/deploy-aliyun.sh
/opt/deploy-aliyun.sh
```

### 问题 4: 端口被占用

**错误**: `Port 3000 is already in use`

**解决**:
```bash
# 查看占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 重新部署
./deploy-aliyun.sh
```

### 问题 5: 网站无法访问

**检查**:
```bash
# 1. 检查服务状态
pm2 status

# 2. 检查 Nginx
systemctl status nginx

# 3. 检查防火墙
ufw status

# 4. 检查安全组（阿里云控制台）
```

**解决**:
```bash
# 重启服务
pm2 restart solar-storage
systemctl restart nginx

# 开放端口
ufw allow 80/tcp
ufw allow 443/tcp
```

## 📋 部署后配置

### 1. 修改默认密码

访问：http://47.100.20.52/login-v1.0.html

默认账号：
- admin / admin123
- terry / terry123

**立即修改！**

### 2. 配置 HTTPS（推荐）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书（需要域名）
certbot --nginx -d your-domain.com
```

### 3. 配置域名（可选）

1. 阿里云控制台 → 域名
2. 添加域名解析
3. A 记录 → 47.100.20.52
4. 等待生效（5-10 分钟）

### 4. 配置监控

1. 阿里云控制台 → 云监控
2. 主机监控 → 安装插件
3. 配置告警：
   - CPU > 80%
   - 内存 > 80%
   - 磁盘 > 85%

## 📊 运维命令

### 服务管理
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs solar-storage

# 重启
pm2 restart solar-storage

# 停止
pm2 stop solar-storage
```

### 数据备份
```bash
# 手动备份
/opt/backup-solar-storage.sh

# 查看备份
ls -lh /opt/backups/
```

### 日志查看
```bash
# 应用日志
pm2 logs solar-storage --lines 50

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🎯 快速部署命令（复制粘贴）

```bash
# === 本地执行 ===
# 1. 上传文件
cd /home/admin/openclaw/workspace/projects/china-solar-storage
scp solar-storage-deploy.tar.gz deploy-aliyun.sh root@47.100.20.52:/opt/

# 2. 登录服务器
ssh root@47.100.20.52

# === 服务器上执行 ===
# 3. 运行部署
cd /opt
chmod +x deploy-aliyun.sh
./deploy-aliyun.sh

# 4. 验证
pm2 status
curl http://localhost:3000/api/health

# 5. 访问
# 浏览器打开：http://47.100.20.52
```

## 📞 技术支持

### 收集诊断信息
```bash
# 服务状态
pm2 status > /tmp/diag.txt
pm2 logs solar-storage --lines 100 >> /tmp/diag.txt

# 系统信息
uname -a >> /tmp/diag.txt
free -h >> /tmp/diag.txt
df -h >> /tmp/diag.txt

# 打包
tar -czf diag-$(date +%Y%m%d).tar.gz /tmp/diag.txt
```

### 紧急恢复
```bash
# 停止服务
pm2 stop solar-storage

# 恢复最新备份
cd /opt/backups
ls -lt | head -2  # 查看最新备份
tar -xzf solar-storage_最新.tar.gz -C /opt/solar-storage/

# 重启服务
pm2 start solar-storage
pm2 save
```

---

**准备就绪！开始部署吧！** 🚀

**目标服务器**: 47.100.20.52  
**预计时间**: 10-15 分钟  
**访问地址**: http://47.100.20.52
