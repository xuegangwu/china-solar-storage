# v1.1 完善计划

> 目标：修复问题 + 数据填充 + 优化体验  
> 工期：3-5 天  
> 版本：v1.1 稳定版

## 📋 任务清单

### P0 - 紧急修复

- [ ] 服务自启动（PM2）
- [ ] 数据库自动备份
- [ ] 错误日志监控
- [ ] 登录会话保持

### P1 - 数据填充

- [ ] 30 省份电价政策
- [ ] 15 越南省份政策
- [ ] 示例项目数据（20+）
- [ ] 光照资源数据

### P2 - 体验优化

- [ ] 加载动画
- [ ] 错误提示优化
- [ ] 搜索功能
- [ ] 数据导出优化

### P3 - 文档完善

- [ ] 用户手册
- [ ] API 文档
- [ ] 数据字典
- [ ] 部署文档

## 🚀 立即开始

### 1. 安装 PM2（服务管理）

```bash
npm install -g pm2
cd backend
pm2 start server.js --name solar-storage
pm2 save
pm2 startup
```

### 2. 配置自动备份

```bash
# 备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR
cp backend/data/solar-storage.db $BACKUP_DIR/solar-storage_$DATE.db
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
EOF

# 每天凌晨 2 点备份
crontab -e
0 2 * * * /path/to/backup.sh
```

### 3. 填充电价政策数据

创建各省电价政策 JSON 文件

### 4. 优化用户体验

- 添加页面加载动画
- 优化错误提示
- 添加搜索功能

## 📊 验收标准

- [ ] 服务 7x24 小时稳定运行
- [ ] 数据完整（45 省份政策）
- [ ] 无明显 Bug
- [ ] 用户文档齐全

---

**开始实施** ✅
