# 光储电站投资地图 - 使用指南

> 版本：v1.1  
> 最后更新：2026-03-11

## 🚀 快速访问

### 方式 1：直接访问（推荐）

```bash
# 中国地图
open web/map-v1.0.html

# 越南地图
open web/vietnam-map.html

# 登录页
open web/login-v1.0.html
```

### 方式 2：通过浏览器

1. 打开浏览器
2. 访问以下地址：

| 页面 | 地址 |
|-----|------|
| 登录页 | http://localhost:3000/login-v1.0.html |
| 中国地图 | http://localhost:3000/map-v1.0.html |
| 越南地图 | http://localhost:3000/vietnam-map.html |

## ⚠️ 如果无法访问

### 检查 1：后端服务是否运行

```bash
# 检查服务
curl http://localhost:3000/api/health

# 如果无响应，启动服务：
cd /home/admin/openclaw/workspace/projects/china-solar-storage/backend
node server.js &
```

### 检查 2：端口是否被占用

```bash
# 检查 3000 端口
lsof -i :3000

# 如果端口被占用，杀掉进程：
pkill -f "node server.js"
# 然后重新启动
```

### 检查 3：数据库是否存在

```bash
# 检查数据库文件
ls -lh backend/data/solar-storage.db

# 如果不存在，重新初始化：
cd backend
node scripts/init-db.js
```

## 📡 服务状态检查

```bash
# 1. 健康检查
curl http://localhost:3000/api/health
# 应返回：{"status":"ok",...}

# 2. 省份数据
curl http://localhost:3000/api/provinces | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'省份数量：{len(d.get(\"provinces\",[]))}')"
# 应返回：省份数量：45

# 3. 登录测试
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# 应返回 Token
```

## 🗺️ 地图功能

### 中国地图 (30 省份)

**访问**: http://localhost:3000/map-v1.0.html

**功能**:
- ✅ 交互式地图（Leaflet）
- ✅ 省份列表（按总分排序）
- ✅ 点击查看详情
- ✅ 投资等级筛选（B/C/D）
- ✅ 统计卡片

**等级分布**:
- B 级（推荐）: 4 省 - 上海、浙江、广东、北京
- C 级（谨慎）: 12 省
- D 级（暂不建议）: 14 省

### 越南地图 (15 省份)

**访问**: http://localhost:3000/vietnam-map.html

**功能**:
- ✅ 越南全境地图
- ✅ 15 个省份评估
- ✅ 投资等级（A/B/C）
- ✅ 省份详情
- ✅ 统计数据

**等级分布**:
- A 级（优先）: 3 省 - 宁顺、平顺、林同
- B 级（推荐）: 7 省
- C 级（谨慎）: 5 省

## 🔐 登录账号

| 用户名 | 密码 | 角色 | 权限 |
|-------|------|------|------|
| admin | admin123 | 管理员 | 全部权限 |
| terry | terry123 | 管理员 | 全部权限 |
| user | user123 | 用户 | 查看 + 导出 |
| viewer | viewer123 | 访客 | 只读 |

## 🛠️ 故障排查

### 问题 1：页面空白

**原因**: 后端服务未启动

**解决**:
```bash
cd backend
node server.js &
```

### 问题 2：地图不显示

**原因**: 
1. 网络问题（Leaflet CDN 无法访问）
2. 浏览器缓存

**解决**:
1. 检查网络连接
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 刷新页面（Ctrl+F5）

### 问题 3：数据加载失败

**原因**: 数据库问题

**解决**:
```bash
cd backend
rm -f data/solar-storage.db
node scripts/init-db.js
pkill -f "node server.js"
node server.js &
```

### 问题 4：登录失败

**原因**: 
1. 后端服务未响应
2. 密码错误

**解决**:
1. 检查服务：`curl http://localhost:3000/api/health`
2. 使用正确密码：admin/admin123

## 📊 API 测试

```bash
# 获取所有省份
curl http://localhost:3000/api/provinces

# 获取单个省份
curl http://localhost:3000/api/provinces/1

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 健康检查
curl http://localhost:3000/api/health
```

## 🔧 重启服务

```bash
# 1. 停止服务
pkill -f "node server.js"

# 2. 等待 2 秒
sleep 2

# 3. 启动服务
cd /home/admin/openclaw/workspace/projects/china-solar-storage/backend
node server.js &

# 4. 验证
curl http://localhost:3000/api/health
```

## 📁 项目文件

```
/home/admin/openclaw/workspace/projects/china-solar-storage/
├── backend/
│   ├── server.js              # 主服务
│   ├── scripts/init-db.js     # 数据库初始化
│   ├── utils/database.js      # 数据库工具
│   ├── routes/                # API 路由
│   └── data/solar-storage.db  # 数据库文件
├── web/
│   ├── login-v1.0.html        # 登录页
│   ├── map-v1.0.html          # 中国地图
│   └── vietnam-map.html       # 越南地图
└── docs/
    ├── README.md              # 本文件
    ├── VIETNAM-MAP.md         # 越南地图说明
    └── RELEASE-v1.0.md        # 发布说明
```

## 💡 使用技巧

### 快速访问

创建桌面快捷方式：
```bash
# 创建脚本
cat > ~/solar-map.sh << 'EOF'
#!/bin/bash
xdg-open http://localhost:3000/map-v1.0.html
EOF
chmod +x ~/solar-map.sh

# 运行
~/solar-map.sh
```

### 后台运行

使用 nohup 让服务后台运行：
```bash
cd backend
nohup node server.js > server.log 2>&1 &
```

### 查看日志

```bash
# 实时查看日志
tail -f backend/server.log
```

## 📞 技术支持

- **API 文档**: backend/API.md
- **部署指南**: backend/DEPLOY-ALIYUN.md
- **问题反馈**: 联系系统管理员

---

## ✅ 检查清单

访问前请确认：

- [ ] 后端服务运行中
- [ ] 端口 3000 可访问
- [ ] 数据库文件存在
- [ ] 网络连接正常
- [ ] 浏览器缓存已清除

**服务地址**: http://localhost:3000  
**当前状态**: ✅ 运行中
