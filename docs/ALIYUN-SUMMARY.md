# 阿里云部署总结

## ✅ 已完成工作

### 1. 后端服务优化

**问题**: better-sqlite3 需要编译原生模块，在部分环境安装失败

**解决方案**: 改用 sql.js（纯 JavaScript 实现的 SQLite）

**优势**:
- ✅ 无需编译，安装快速
- ✅ 跨平台兼容性好
- ✅ 适合容器化部署
- ✅ 内存中运行，性能优秀

**修改文件**:
- `package.json` - 替换 better-sqlite3 为 sql.js
- `scripts/init-db.js` - 改用 sql.js API
- `server.js` - 集成数据库工具
- `utils/database.js` - 新增数据库工具（自动保存）

### 2. 部署文档

**新增文档**:
- `DEPLOY-ALIYUN.md` - 阿里云部署详细指南
- `deploy.sh` - 一键部署脚本

**内容包括**:
- 阿里云 ECS 配置
- Node.js 安装
- PM2 进程管理
- Nginx 反向代理
- HTTPS 证书配置
- 防火墙和安全组
- 数据库备份
- 监控和维护

### 3. 服务验证

**后端服务**: ✅ 运行中（端口 3000）

```bash
# 健康检查
curl http://localhost:3000/api/health

# 响应:
# {"status":"ok","timestamp":"2026-03-11T12:50:00.000Z"}
```

## 📋 阿里云部署步骤

### 快速部署（推荐）

```bash
# 1. 上传项目到阿里云
scp -r backend/ root@your-server-ip:/opt/solar-storage/

# 2. 登录服务器
ssh root@your-server-ip

# 3. 运行一键部署脚本
cd /opt/solar-storage/backend
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

详细步骤见 `DEPLOY-ALIYUN.md`

## 🎯 部署后检查

### 1. 服务状态
```bash
pm2 status
# 应显示 solar-storage 为 online
```

### 2. API 测试
```bash
# 健康检查
curl http://localhost:3000/api/health

# 登录测试
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. 前端访问
```
http://服务器IP
```

## 🔐 安全建议

### 必须做

1. **修改默认密码**
   - admin/admin123 → 强密码
   - terry/terry123 → 强密码

2. **配置阿里云安全组**
   - 只开放 80/443 端口
   - SSH（22）限制源 IP

3. **启用 HTTPS**
   ```bash
   apt-get install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

4. **数据库备份**
   ```bash
   # 添加到 crontab
   0 2 * * * cp /opt/solar-storage/backend/data/solar-storage.db /opt/backups/solar-storage_$(date +\%Y\%m\%d).db
   ```

### 建议做

1. **配置 Fail2Ban**（防暴力破解）
2. **设置系统自动更新**
3. **配置 PM2 Plus 监控**
4. **Nginx 日志轮转**
5. **配置告警通知**

## 💰 阿里云成本

### 最低配置（测试）
| 资源 | 配置 | 月费用 |
|-----|------|--------|
| ECS | 2 核 2G | ¥119 |
| 带宽 | 1Mbps | ¥66 |
| **总计** | - | **约¥185/月** |

### 推荐配置（生产）
| 资源 | 配置 | 月费用 |
|-----|------|--------|
| ECS | 2 核 4G | ¥199 |
| 带宽 | 3Mbps | ¥162 |
| 域名 | .com | ¥6/月 |
| **总计** | - | **约¥367/月** |

### 高配（企业）
| 资源 | 配置 | 月费用 |
|-----|------|--------|
| ECS | 4 核 8G | ¥399 |
| RDS | MySQL 基础版 | ¥150 |
| 带宽 | 5Mbps | ¥270 |
| SLB | 负载均衡 | ¥50 |
| **总计** | - | **约¥869/月** |

## 📊 性能优化建议

### 数据库
- 定期清理日志表（保留 30 天）
- 导出历史数据到冷存储
- 考虑迁移到 PostgreSQL（大数据量）

### 应用
- 启用 PM2 cluster 模式（多核 CPU）
- 配置 Node.js 内存限制
- 启用 Gzip 压缩

### Nginx
- 静态资源缓存
- 启用 HTTP/2
- 配置连接池

## 🔄 更新流程

```bash
# 1. 本地打包
tar -czf solar-storage-v1.1.tar.gz \
  --exclude='backend/node_modules' \
  --exclude='backend/data/*.db' \
  backend/ web/

# 2. 上传到服务器
scp solar-storage-v1.1.tar.gz root@server:/opt/

# 3. 登录服务器更新
ssh root@server
cd /opt
mv backend backend.backup
tar -xzf solar-storage-v1.1.tar.gz
cd backend
npm install --production
cp ../backend.backup/data/solar-storage.db data/
pm2 restart solar-storage
```

## 📞 故障排查

### 服务无法访问
```bash
# 检查 PM2
pm2 logs solar-storage

# 检查 Nginx
tail -f /var/log/nginx/error.log

# 检查端口
netstat -tlnp | grep 3000
```

### 数据库问题
```bash
# 查看数据库文件
ls -lh /opt/solar-storage/backend/data/

# 恢复备份
cp /opt/backups/solar-storage_*.db \
   /opt/solar-storage/backend/data/solar-storage.db
pm2 restart solar-storage
```

## 📖 相关文档

- `API.md` - API 接口文档
- `DEPLOY.md` - 通用部署指南
- `DEPLOY-ALIYUN.md` - 阿里云详细部署
- `RELEASE-v1.0.md` - v1.0 发布说明

---

**部署成功检查清单**:

- [ ] PM2 服务运行正常
- [ ] Nginx 反向代理正常
- [ ] API 健康检查通过
- [ ] 前端页面可访问
- [ ] 登录功能正常
- [ ] 数据库备份配置
- [ ] 默认密码已修改
- [ ] HTTPS 证书配置
- [ ] 安全组规则配置
- [ ] 监控告警配置

**祝部署顺利！** 🎉
