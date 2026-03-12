# 后端部署指南

## 环境要求

- Node.js >= 18.x
- npm >= 9.x
- Linux/macOS/Windows

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 初始化数据库

```bash
node scripts/init-db.js
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 或使用启动脚本
./start.sh
```

### 4. 访问服务

- **API 服务**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health
- **前端页面**: http://localhost:3000

## 配置说明

### 环境变量

复制 `.env.example` 为 `.env` 并修改配置:

```bash
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### 数据库位置

默认：`backend/data/solar-storage.db`

## API 测试

### 登录测试
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 获取省份数据
```bash
curl http://localhost:3000/api/provinces
```

## 生产部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name solar-storage

# 设置开机自启
pm2 startup
pm2 save
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### HTTPS 配置

```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

## 数据库备份

```bash
# 备份数据库
cp data/solar-storage.db data/solar-storage.db.backup.$(date +%Y%m%d)

# 恢复数据库
cp data/solar-storage.db.backup.20260311 data/solar-storage.db
```

## 日志管理

### 查看日志

```bash
# 应用日志
tail -f logs/app.log

# PM2 日志
pm2 logs solar-storage
```

### 日志轮转

PM2 自动处理日志轮转，也可手动配置:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 监控

### 健康检查

```bash
curl http://localhost:3000/api/health
```

### 性能监控

使用 PM2 Monitor:
```bash
pm2 monit
```

## 故障排查

### 常见问题

1. **端口被占用**
   ```bash
   # 修改 PORT 环境变量
   export PORT=3001
   ```

2. **数据库锁定**
   ```bash
   # 删除数据库重新初始化
   rm data/solar-storage.db
   node scripts/init-db.js
   ```

3. **依赖安装失败**
   ```bash
   # 清理缓存重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

## 安全建议

1. **修改默认密码**
   - admin/admin123 → 强密码
   - terry/terry123 → 强密码

2. **启用 HTTPS**
   - 生产环境必须使用 HTTPS

3. **限制访问 IP**
   ```nginx
   allow 192.168.1.0/24;
   deny all;
   ```

4. **定期备份**
   - 数据库每日备份
   - 备份文件异地存储

5. **更新依赖**
   ```bash
   npm audit
   npm update
   ```

## 技术支持

- **API 文档**: API.md
- **项目文档**: ../docs/
- **问题反馈**: 联系系统管理员
