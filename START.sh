#!/bin/bash
# 光储电站投资地图 - 一键启动（修复版）

set -e

echo "======================================"
echo "🌞 光储电站投资地图 - 一键启动"
echo "======================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# 1. 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "   安装依赖中..."
    npm install --silent
fi
echo "   ✅ 依赖检查完成"

# 2. 检查数据库
echo "🗄️  检查数据库..."
if [ ! -f "data/solar-storage.db" ]; then
    echo "   初始化数据库..."
    node scripts/init-db.js --silent
fi
echo "   ✅ 数据库就绪"

# 3. 停止旧服务
echo "🛑 停止旧服务..."
pkill -f "node server.js" 2>/dev/null || true
sleep 1
echo "   ✅ 已清理"

# 4. 启动服务
echo "🚀 启动服务..."
nohup node server.js > server.log 2>&1 &
SERVER_PID=$!
echo "   ✅ 服务已启动 (PID: $SERVER_PID)"

# 5. 等待并验证
echo "⏳ 等待服务启动..."
sleep 4

echo ""
echo "======================================"
echo "✅ 服务状态"
echo "======================================"

# 检查进程
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "🟢 服务运行中 (PID: $SERVER_PID)"
else
    echo "🔴 服务启动失败，查看日志："
    tail -20 server.log
    exit 1
fi

# 健康检查
HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null)
if [ -n "$HEALTH" ]; then
    echo "🟢 健康检查通过"
else
    echo "🔴 健康检查失败"
fi

# 省份数据
PROVINCES=$(curl -s http://localhost:3000/api/provinces 2>/dev/null | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('provinces',[])))" 2>/dev/null || echo "0")
echo "🟢 省份数据：${PROVINCES} 个"

echo ""
echo "======================================"
echo "🌐 访问地址"
echo "======================================"
echo ""
echo "   📱 登录页面："
echo "   http://localhost:3000/login-v1.0.html"
echo ""
echo "   🗺️  中国地图："
echo "   http://localhost:3000/map-v1.0.html"
echo ""
echo "   🌏 越南地图："
echo "   http://localhost:3000/vietnam-map.html"
echo ""
echo "======================================"
echo "🔐 演示账号"
echo "======================================"
echo ""
echo "   管理员：admin / admin123"
echo "   管理员：terry / terry123"
echo "   普通用户：user / user123"
echo "   访客：viewer / viewer123"
echo ""
echo "======================================"
echo "📝 常用命令"
echo "======================================"
echo ""
echo "   查看日志：tail -f backend/server.log"
echo "   停止服务：pkill -f 'node server.js'"
echo "   重启服务：./START.sh"
echo ""
echo "======================================"
echo ""

# 保存 PID
echo $SERVER_PID > /tmp/solar-storage.pid

echo "💡 提示：服务已在后台运行，关闭终端不会停止服务"
echo ""
