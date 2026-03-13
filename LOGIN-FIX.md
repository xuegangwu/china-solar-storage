# 登录功能修复报告

> 时间：2026-03-11 13:15  
> 问题：登录失败  
> 状态：✅ 已修复

## 🔍 问题原因

**根本原因**: 数据库重新创建后，用户数据丢失

**表现**:
- ✅ 首页可以正常显示
- ❌ 登录失败（数据库中无用户数据）
- ❌ API 返回 500 错误

## 🔧 修复步骤

### 1. 重新初始化数据库
```bash
cd backend
rm -f data/solar-storage.db
node scripts/init-db.js
```

### 2. 验证用户数据
```bash
# 检查用户表
sqlite3 data/solar-storage.db "SELECT username, role FROM users;"
# 应返回 4 个用户
```

### 3. 测试登录 API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# 应返回 Token
```

## ✅ 验证结果

### 所有账号测试通过

| 用户名 | 密码 | 角色 | 状态 |
|-------|------|------|------|
| admin | admin123 | admin | ✅ 登录成功 |
| terry | terry123 | admin | ✅ 登录成功 |
| user | user123 | user | ✅ 登录成功 |
| viewer | viewer123 | viewer | ✅ 登录成功 |

### API 测试

```bash
# 登录测试
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 返回:
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "系统管理员",
    "role": "admin"
  }
}
```

## 🎯 现在可以登录了

### 方式 1：通过登录页

1. 打开 http://localhost:3000/login-v1.0.html
2. 输入用户名和密码
3. 点击登录
4. 自动跳转到地图页面

### 方式 2：直接使用

**管理员**:
- 用户名：admin
- 密码：admin123
- 权限：全部权限（用户管理、数据管理、系统设置）

**普通用户**:
- 用户名：user
- 密码：user123
- 权限：查看地图、导出数据

**访客**:
- 用户名：viewer
- 密码：viewer123
- 权限：只读查看

## 📊 数据库内容

### 用户表（4 个用户）
```sql
SELECT username, name, role FROM users;

username | name    | role
---------|---------|-------
admin    | 系统管理员 | admin
terry    | 伍学纲   | admin
user     | 普通用户  | user
viewer   | 访客     | viewer
```

### 省份表（45 个省份）
- 中国：30 省份
- 越南：15 省份

### 项目表（6 个项目）
- 运行中：3 个
- 建设中：2 个
- 规划中：1 个

## 🔐 登录流程

```
输入用户名密码
    ↓
点击登录
    ↓
调用 API: POST /api/auth/login
    ↓
验证用户名密码（bcrypt）
    ↓
生成 JWT Token
    ↓
保存 Token 到 LocalStorage
    ↓
根据角色跳转
    ├─ 管理员 → 后台管理
    └─ 普通用户 → 地图页面
```

## 🚨 如果还是无法登录

### 检查 1：服务是否运行
```bash
curl http://localhost:3000/api/health
# 应返回 {"status":"ok"}
```

### 检查 2：用户数据是否存在
```bash
cd backend
node -e "const {getDatabase}=require('./utils/database'); getDatabase().then(db=>{ console.log(db.exec('SELECT username FROM users')); })"
# 应返回用户列表
```

### 检查 3：浏览器控制台
1. 按 F12 打开开发者工具
2. 查看 Console 错误
3. 查看 Network 请求（登录 API 响应）

### 检查 4：清除缓存
```javascript
// 浏览器控制台执行
localStorage.clear();
location.reload();
```

## 💡 使用技巧

### 保持登录状态
- 勾选"记住我（7 天）"
- Token 有效期 7 天
- 7 天后需要重新登录

### 退出登录
- 点击右上角"🚪 退出"
- 确认退出
- 清除 Token 并跳转登录页

### 忘记密码
- 联系管理员重置密码
- 或使用 API：
```bash
curl -X POST http://localhost:3000/api/users/3/reset-password \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"new_password":"newpassword123"}'
```

## 📝 防止数据丢失

### 定期备份数据库
```bash
# 备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp backend/data/solar-storage.db $BACKUP_DIR/solar-storage_$DATE.db
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
EOF
chmod +x backup.sh

# 每天凌晨 2 点备份
crontab -e
0 2 * * * /path/to/backup.sh
```

### 导出用户数据
```bash
# 导出为 JSON
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>" \
  > users-backup.json
```

---

## ✅ 修复确认

- [x] 数据库重新初始化
- [x] 4 个默认用户已创建
- [x] admin 登录成功
- [x] terry 登录成功
- [x] user 登录成功
- [x] viewer 登录成功
- [x] Token 生成正常
- [x] 页面跳转正常

**登录功能已恢复正常！** 🎉

**立即登录**: http://localhost:3000/login-v1.0.html  
**管理员账号**: admin / admin123
