# 部署到 47.100.20.52/demo - 操作指南

## 📦 已准备文件

| 文件 | 位置 |
|-----|------|
| `solar-storage-deploy.tar.gz` | 项目根目录 |
| `deploy-aliyun.sh` | 项目根目录（已修改为/deploy 目录） |

## 🚀 部署步骤

### 步骤 1: 上传文件到服务器

**在本地执行**：
```bash
cd /home/admin/openclaw/workspace/projects/china-solar-storage
scp solar-storage-deploy.tar.gz deploy-aliyun.sh root@47.100.20.52:/demo/
```

### 步骤 2: 登录服务器

```bash
ssh root@47.100.20.52
```

### 步骤 3: 运行一键部署

```bash
cd /demo
chmod +x deploy-aliyun.sh
./deploy-aliyun.sh
```

### 步骤 4: 等待部署完成

部署过程约 **5-10 分钟**

### 步骤 5: 验证部署

```bash
# 检查服务状态
pm2 status

# 测试 API
curl http://localhost:3000/api/health
```

### 步骤 6: 访问网站

打开浏览器访问：
```
http://47.100.20.52
```

## 📂 部署后目录结构

```
/demo/
├── solar-storage/          # 应用目录
│   ├── backend/            # 后端代码
│   │   ├── server.js
│   │   ├── .env
│   │   └── data/
│   │       └── solar-storage.db
│   └── web/                # 前端页面
├── deploy-aliyun.sh        # 部署脚本
└── backup-solar-storage.sh # 备份脚本
```

## 🔧 运维命令

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
/demo/backup-solar-storage.sh

# 查看备份
ls -lh /demo/backups/
```

### 日志查看
```bash
# 应用日志
pm2 logs solar-storage --lines 50

# Nginx 日志
tail -f /var/log/nginx/solar-storage-access.log
tail -f /var/log/nginx/solar-storage-error.log
```

## 🌐 访问地址

部署完成后：
- **首页**: http://47.100.20.52
- **光储龙虾**: http://47.100.20.52/longi.html
- **政策采集**: http://47.100.20.52/global-policies.html
- **登录页**: http://47.100.20.52/login-v1.0.html

**默认账号**: admin / admin123

## 📋 快速部署命令

```bash
# === 本地执行 ===
cd /home/admin/openclaw/workspace/projects/china-solar-storage
scp solar-storage-deploy.tar.gz deploy-aliyun.sh root@47.100.20.52:/demo/
ssh root@47.100.20.52

# === 服务器上执行 ===
cd /demo
chmod +x deploy-aliyun.sh
./deploy-aliyun.sh

# === 验证 ===
pm2 status
curl http://localhost:3000/api/health
```

---

**准备就绪！开始部署吧！** 🚀

**目标**: 47.100.20.52/demo  
**预计时间**: 10-15 分钟
