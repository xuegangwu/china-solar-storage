# v1.0 发布说明 - 后端 API 集成

> 发布时间：2026-03-11 12:45  
> 版本：v1.0 企业版（完整后端）

## 🎉 重大更新

### 1. 完整后端 API 服务 🖥️

**技术栈**:
- Node.js + Express
- SQLite 数据库
- JWT 认证
- bcrypt 密码加密

**核心功能**:
- ✅ 用户认证（登录/登出/Token 刷新）
- ✅ 用户管理（CRUD）
- ✅ 省份数据管理（CRUD）
- ✅ 项目管理（CRUD）
- ✅ 操作日志
- ✅ 访问日志
- ✅ 系统设置
- ✅ 统计数据

### 2. 数据库设计 📊

**数据表**:
- `users` - 用户表
- `provinces` - 省份数据表
- `projects` - 项目数据表
- `operation_logs` - 操作日志表
- `access_logs` - 访问日志表
- `system_settings` - 系统设置表

**初始数据**:
- 4 个默认用户（admin/terry/user/viewer）
- 30 个省份数据
- 6 个示例项目
- 4 个系统设置（评估权重）

### 3. API 接口 📡

**接口分类**:
| 分类 | 接口数 | 说明 |
|-----|-------|------|
| 认证 | 4 | 登录/登出/刷新/获取当前用户 |
| 用户 | 5 | 用户 CRUD/重置密码 |
| 省份 | 5 | 省份数据 CRUD |
| 项目 | 5 | 项目 CRUD |
| 日志 | 3 | 操作日志/访问日志/清空 |
| 设置 | 3 | 获取/更新/批量更新 |
| 统计 | 3 | 仪表盘/用户分布/省份分布 |

**总计**: 28 个 API 接口

### 4. 安全特性 🔐

- ✅ JWT Token 认证（7 天有效期）
- ✅ bcrypt 密码加密（10 轮 salt）
- ✅ 角色权限控制（admin/user/viewer）
- ✅ 操作日志记录
- ✅ 访问日志记录
- ✅ CORS 跨域支持

## 📁 新增文件

```
backend/
├── server.js                    # 主服务器
├── package.json                 # 依赖配置
├── .env                         # 环境变量
├── .env.example                 # 环境变量示例
├── start.sh                     # 启动脚本
├── API.md                       # API 文档
├── DEPLOY.md                    # 部署指南
├── scripts/
│   └── init-db.js               # 数据库初始化
├── routes/
│   ├── auth.js                  # 认证路由
│   ├── users.js                 # 用户路由
│   ├── provinces.js             # 省份路由
│   ├── projects.js              # 项目路由
│   ├── logs.js                  # 日志路由
│   ├── settings.js              # 设置路由
│   └── stats.js                 # 统计路由
├── middleware/
│   └── auth.js                  # 认证中间件
└── data/
    └── solar-storage.db         # SQLite 数据库
```

## 🚀 快速开始

### 1. 启动后端服务

```bash
cd backend
./start.sh
```

或手动启动:
```bash
npm install
node scripts/init-db.js
npm start
```

### 2. 访问服务

- **前端登录**: http://localhost:3000
- **API 健康检查**: http://localhost:3000/api/health
- **API 文档**: 查看 `backend/API.md`

### 3. 测试 API

```bash
# 登录测试
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取省份数据
curl http://localhost:3000/api/provinces

# 获取统计数据（需要 Token）
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/stats/dashboard
```

## 📊 数据库结构

### users 表
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INTEGER | 主键 |
| username | TEXT | 用户名（唯一） |
| password_hash | TEXT | 密码哈希 |
| name | TEXT | 姓名 |
| role | TEXT | 角色（admin/user/viewer） |
| email | TEXT | 邮箱 |
| created_at | DATETIME | 创建时间 |
| last_login | DATETIME | 最后登录 |
| is_active | INTEGER | 是否激活 |

### provinces 表
| 字段 | 类型 | 说明 |
|-----|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 省份名称 |
| abbr | TEXT | 简称 |
| lat/lng | REAL | 坐标 |
| annual_hours | INTEGER | 年等效小时 |
| benchmark_price | REAL | 燃煤基准价 |
| curtailed_rate | REAL | 弃光率 |
| grade | TEXT | 投资等级 |
| scores | TEXT | 得分（JSON） |
| roi | TEXT | ROI 数据（JSON） |

## 🔐 默认账号

| 用户名 | 密码 | 角色 | 说明 |
|-------|------|------|------|
| admin | admin123 | admin | 系统管理员 |
| terry | terry123 | admin | 管理员 |
| user | user123 | user | 普通用户 |
| viewer | viewer123 | viewer | 访客 |

**⚠️ 重要**: 生产环境请修改默认密码！

## 📡 API 使用示例

### JavaScript Fetch
```javascript
// 登录
const login = async (username, password) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
};

// 获取省份数据（带认证）
const getProvinces = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/provinces', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await res.json();
};
```

### Python Requests
```python
import requests

# 登录
res = requests.post('http://localhost:3000/api/auth/login', json={
    'username': 'admin',
    'password': 'admin123'
})
token = res.json()['token']

# 获取省份数据
headers = {'Authorization': f'Bearer {token}'}
res = requests.get('http://localhost:3000/api/provinces', headers=headers)
provinces = res.json()
```

## ⚠️ 注意事项

### 开发环境
- ✅ 本地 SQLite 数据库
- ✅ 明文日志输出
- ✅ CORS 允许所有来源
- ⚠️ 不适合生产环境

### 生产部署
- 🔒 使用 PostgreSQL/MySQL
- 🔒 配置 HTTPS
- 🔒 限制 CORS 来源
- 🔒 使用 PM2 管理进程
- 🔒 配置日志轮转
- 🔒 定期备份数据库

## 🔜 后续优化

### 性能优化
- [ ] 数据库连接池
- [ ] API 响应缓存
- [ ] 静态资源 CDN
- [ ] 数据库查询优化

### 功能增强
- [ ] 数据导入/导出
- [ ] 批量操作
- [ ] 高级搜索
- [ ] 数据可视化 API

### 安全加固
- [ ] 双因素认证
- [ ] 登录 IP 限制
- [ ] 密码强度策略
- [ ] 会话管理

---

**发布人**: AI Assistant  
**审核**: Terry  
**状态**: ✅ 已发布  
**后端服务**: 运行中（端口 3000）
