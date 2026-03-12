# 🔧 使用 systemd 管理服务（推荐方案）

**更新时间**: 2026-03-12 14:55  
**说明**: 解决服务频繁停止的问题

---

## 🐛 问题现状

**症状**:
- ❌ Node.js 后端服务频繁停止
- ❌ 需要手动重启
- ❌ 影响页面访问

**根本原因**:
- 没有自动重启机制
- 进程崩溃后无法自动恢复
- 系统资源限制

---

## ✅ 解决方案：systemd 服务

### 优势

- ✅ **自动重启**: 崩溃后自动恢复
- ✅ **开机自启**: 系统重启后自动启动
- ✅ **日志管理**: 集中管理日志
- ✅ **资源控制**: 限制内存/CPU 使用
- ✅ **状态监控**: 随时查看服务状态

---

## 📋 配置步骤

### 1. 创建服务文件

**文件**: `/etc/systemd/system/solar-storage.service`

```bash
sudo tee /etc/systemd/system/solar-storage.service > /dev/null << 'EOF'
[Unit]
Description=Solar-Storage Investment Map Backend
Documentation=https://github.com/china-solar-storage
After=network.target

[Service]
Type=simple
User=admin
Group=admin
WorkingDirectory=/home/admin/openclaw/workspace/projects/china-solar-storage/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StartLimitInterval=60s
StartLimitBurst=3

# 资源限制
LimitNOFILE=65536
Nice=10
IOSchedulingClass=idle

# 日志
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=solar-storage

# 环境变量
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF
```

### 2. 重新加载 systemd 配置

```bash
sudo systemctl daemon-reload
```

### 3. 启用服务

```bash
# 设置开机自启
sudo systemctl enable solar-storage

# 启动服务
sudo systemctl start solar-storage
```

### 4. 查看状态

```bash
# 查看服务状态
sudo systemctl status solar-storage

# 查看详细日志
sudo journalctl -u solar-storage -f

# 查看最近 100 行日志
sudo journalctl -u solar-storage -n 100
```

---

## 🎯 常用命令

### 服务控制

```bash
# 启动服务
sudo systemctl start solar-storage

# 停止服务
sudo systemctl stop solar-storage

# 重启服务
sudo systemctl restart solar-storage

# 重新加载配置（不中断服务）
sudo systemctl reload solar-storage

# 查看状态
sudo systemctl status solar-storage
```

### 日志查看

```bash
# 实时查看日志
sudo journalctl -u solar-storage -f

# 查看今天日志
sudo journalctl -u solar-storage --since today

# 查看最近 1 小时日志
sudo journalctl -u solar-storage --since "1 hour ago"

# 查看错误日志
sudo journalctl -u solar-storage -p err

# 清空日志
sudo journalctl -u solar-storage --rotate
sudo journalctl -u solar-storage --vacuum-time=1d
```

### 开机自启

```bash
# 启用开机自启
sudo systemctl enable solar-storage

# 禁用开机自启
sudo systemctl disable solar-storage

# 检查是否启用自启
systemctl is-enabled solar-storage
```

---

## 📊 服务配置说明

### [Unit] 段

| 配置项 | 说明 | 值 |
|--------|------|-----|
| `Description` | 服务描述 | Solar-Storage Investment Map Backend |
| `Documentation` | 文档链接 | GitHub 地址 |
| `After` | 启动顺序 | network.target（网络启动后） |

### [Service] 段

| 配置项 | 说明 | 值 |
|--------|------|-----|
| `Type` | 服务类型 | simple（前台运行） |
| `User` | 运行用户 | admin |
| `WorkingDirectory` | 工作目录 | backend 目录 |
| `ExecStart` | 启动命令 | node server.js |
| `Restart` | 重启策略 | always（总是重启） |
| `RestartSec` | 重启间隔 | 10 秒 |
| `StartLimitInterval` | 重启限制间隔 | 60 秒 |
| `StartLimitBurst` | 最大重启次数 | 3 次 |

### 资源限制

| 配置项 | 说明 | 值 |
|--------|------|-----|
| `LimitNOFILE` | 文件描述符限制 | 65536 |
| `Nice` | CPU 优先级 | 10（较低优先级） |
| `IOSchedulingClass` | IO 调度类 | idle（空闲时 IO） |

### 日志配置

| 配置项 | 说明 | 值 |
|--------|------|-----|
| `StandardOutput` | 标准输出 | syslog |
| `StandardError` | 错误输出 | syslog |
| `SyslogIdentifier` | 日志标识 | solar-storage |

---

## 🔍 故障排查

### 服务无法启动

```bash
# 1. 检查配置语法
sudo systemd-analyze verify /etc/systemd/system/solar-storage.service

# 2. 手动启动查看错误
cd /home/admin/openclaw/workspace/projects/china-solar-storage/backend
node server.js

# 3. 查看详细日志
sudo journalctl -u solar-storage -n 100 --no-pager
```

### 服务频繁重启

```bash
# 1. 查看重启原因
sudo systemctl status solar-storage

# 2. 检查资源使用
sudo systemctl show solar-storage | grep -E "Memory|CPU"

# 3. 调整重启限制
# 编辑服务文件，修改：
# StartLimitInterval=120s
# StartLimitBurst=5
```

### 内存泄漏

```bash
# 1. 设置内存限制（编辑服务文件）
[Service]
MemoryLimit=512M

# 2. 重新加载并重启
sudo systemctl daemon-reload
sudo systemctl restart solar-storage
```

---

## 📈 监控配置

### 创建监控脚本

**文件**: `/home/admin/openclaw/workspace/projects/china-solar-storage/monitor.sh`

```bash
#!/bin/bash

SERVICE="solar-storage"
EMAIL="admin@example.com"

# 检查服务状态
if ! systemctl is-active --quiet $SERVICE; then
    echo "$(date): 服务 $SERVICE 未运行，尝试重启..." >> /tmp/solar-monitor.log
    systemctl restart $SERVICE
    
    if systemctl is-active --quiet $SERVICE; then
        echo "$(date): ✅ 服务重启成功" >> /tmp/solar-monitor.log
    else
        echo "$(date): ❌ 服务重启失败" >> /tmp/solar-monitor.log
        # 发送邮件通知（如配置了邮件）
        # echo "服务 $SERVICE 重启失败" | mail -s "告警：$SERVICE 服务异常" $EMAIL
    fi
fi
```

**配置定时任务**:
```bash
# 每 5 分钟检查一次
crontab -e
# 添加：*/5 * * * * /home/admin/openclaw/workspace/projects/china-solar-storage/monitor.sh
```

---

## 🎯 最佳实践

### 1. 定期维护

```bash
# 每周清理日志
sudo journalctl -u solar-storage --vacuum-time=7d

# 每月检查服务状态
sudo systemctl status solar-storage

# 每季度更新依赖
cd backend
npm update
```

### 2. 备份配置

```bash
# 备份服务文件
sudo cp /etc/systemd/system/solar-storage.service /backup/

# 备份数据库
cp backend/data/solar-storage.db /backup/

# 备份配置文件
cp backend/config.js /backup/
```

### 3. 性能优化

```bash
# 1. 使用 PM2 管理（可选）
npm install -g pm2
pm2 start server.js --name solar-storage
pm2 save
pm2 startup

# 2. 启用 Node.js 集群模式
# 修改 server.js，使用 cluster 模块

# 3. 配置反向代理（Nginx）
# 提高并发处理能力
```

---

## ✅ 验证清单

配置完成后，检查以下项目：

- [ ] 服务文件已创建
- [ ] 服务已启动
- [ ] 服务状态正常（active (running)）
- [ ] 日志正常输出
- [ ] API 可以访问
- [ ] 页面可以打开
- [ ] 开机自启已启用
- [ ] 监控脚本已配置（可选）

---

## 📞 快速参考

### 服务状态检查

```bash
# 一行命令检查
systemctl is-active solar-storage && echo "✅ 服务正常" || echo "❌ 服务异常"
```

### 快速重启

```bash
sudo systemctl restart solar-storage
```

### 查看日志（实时）

```bash
sudo journalctl -u solar-storage -f
```

---

**配置完成后，服务将自动运行并在崩溃时自动重启！** ✅
