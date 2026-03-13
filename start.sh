#!/bin/bash
# 光储电站投资地图 - 快速启动脚本

echo "🌞 光储电站投资地图 - 启动服务"
echo "================================"

# 进入后端目录
cd "$(dirname "$0")/backend"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查数据库
if [ ! -f "data/solar-storage.db" ]; then
    echo "🗄️ 初始化数据库..."
    node scripts/init-db.js
fi

# 停止旧服务
pkill -f "node server.js" 2>/dev/null
sleep 1

# 启动服务
echo "🚀 启动后端服务..."
node server.js &

# 等待服务启动
sleep 3

# 验证服务
echo ""
echo "✅ 服务状态检查:"
curl -s http://localhost:3000/api/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'   健康状态：{d.get(\"status\",\"未知\")}')" 2>/dev/null || echo "   ❌ 服务启动失败"

PROVINCES=$(curl -s http://localhost:3000/api/provinces | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('provinces',[])))" 2>/dev/null)
echo "   省份数量：${PROVINCES:-0}"

echo ""
echo "🌐 访问地址:"
echo "   登录页：http://localhost:3000/login-v1.0.html"
echo "   中国地图：http://localhost:3000/map-v1.0.html"
echo "   越南地图：http://localhost:3000/vietnam-map.html"
echo ""
echo "📊 演示账号:"
echo "   admin / admin123 (管理员)"
echo "   terry / terry123 (管理员)"
echo "   user / user123 (普通用户)"
echo ""
echo "================================"
echo "💡 按 Ctrl+C 停止服务"
echo ""

# 保持运行
wait
