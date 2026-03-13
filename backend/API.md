# 后端 API 文档

> 版本：v1.0  
> 基础 URL: `http://localhost:3000/api`

## 认证

### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
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

### 使用 Token
所有需要认证的接口需要在 Header 中携带 Token:
```
Authorization: Bearer <token>
```

---

## 用户管理

### 获取用户列表
```http
GET /api/users
Authorization: Bearer <token>
```

### 创建用户
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "name": "新用户",
  "role": "user",
  "email": "user@example.com"
}
```

### 更新用户
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新名字",
  "role": "admin"
}
```

### 删除用户
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### 重置密码
```http
POST /api/users/:id/reset-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_password": "newpassword123"
}
```

---

## 省份数据

### 获取所有省份
```http
GET /api/provinces
```

### 获取单个省份
```http
GET /api/provinces/:id
```

### 创建省份
```http
POST /api/provinces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "测试省",
  "abbr": "测试",
  "lat": 30.0,
  "lng": 120.0,
  "annual_hours": 1200,
  "benchmark_price": 0.4,
  "grade": "B"
}
```

### 更新省份
```http
PUT /api/provinces/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "curtailed_rate": 5.0,
  "grade": "C"
}
```

### 删除省份
```http
DELETE /api/provinces/:id
Authorization: Bearer <token>
```

---

## 项目数据

### 获取所有项目
```http
GET /api/projects
```

### 创建项目
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "测试项目",
  "province": "浙江省",
  "lat": 30.2741,
  "lng": 120.1551,
  "capacity_mw": 100,
  "status": "planned",
  "developer": "测试公司"
}
```

---

## 日志管理

### 获取操作日志
```http
GET /api/logs?limit=50&user_id=1&action=登录
Authorization: Bearer <token>
```

### 获取访问日志
```http
GET /api/logs/access/list?limit=50
Authorization: Bearer <token>
```

### 清空日志
```http
DELETE /api/logs/clear
Authorization: Bearer <token>
```

---

## 系统设置

### 获取所有设置
```http
GET /api/settings
```

### 更新设置
```http
PUT /api/settings/weight_resource
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": "20"
}
```

### 批量更新设置
```http
PUT /api/settings/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "weight_resource": "15",
  "weight_price": "25",
  "weight_policy": "15",
  "weight_grid": "45"
}
```

---

## 统计数据

### 获取仪表盘数据
```http
GET /api/stats/dashboard
Authorization: Bearer <token>
```

**响应**:
```json
{
  "stats": {
    "users": {
      "total": 4,
      "admins": 2,
      "users": 1,
      "viewers": 1
    },
    "provinces": {
      "total": 30,
      "grade_b": 4,
      "grade_c": 12,
      "grade_d": 14
    },
    "projects": {
      "total": 6,
      "operating": 3,
      "construction": 2,
      "planned": 1
    },
    "visits": {
      "today": 12
    }
  },
  "recentVisits": [...]
}
```

### 获取用户分布
```http
GET /api/stats/users/distribution
Authorization: Bearer <token>
```

### 获取省份等级分布
```http
GET /api/stats/provinces/grade
Authorization: Bearer <token>
```

---

## 错误响应

所有错误返回统一格式:
```json
{
  "error": "错误信息"
}
```

**常见错误码**:
- `400` - 请求参数错误
- `401` - 未认证（未登录）
- `403` - 无权限
- `404` - 资源不存在
- `500` - 服务器错误

---

## 快速测试

### 使用 curl 测试登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 使用 curl 测试获取省份
```bash
curl http://localhost:3000/api/provinces
```

### 使用 curl 测试用户管理（需要 Token）
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

---

## 演示账号

| 用户名 | 密码 | 角色 | 权限 |
|-------|------|------|------|
| admin | admin123 | admin | 全部权限 |
| terry | terry123 | admin | 全部权限 |
| user | user123 | user | 查看 + 导出 |
| viewer | viewer123 | viewer | 只读 |
