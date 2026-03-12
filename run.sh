#!/bin/bash
# 光储电站投资地图 - 一键启动（最终版）

echo "🌞 光储电站投资地图 - 启动服务"
echo "================================"

cd "$(dirname "$0")/backend"

# 停止旧服务
pkill -f "node server.js" 2>/dev/null
sleep 1

# 启动服务
nohup node server.js > server.log 2>&1 &
echo $! > /tmp/solar-storage.pid

# 等待启动
sleep 4

# 验证
echo ""
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "🌐 访问地址:"
    echo "   登录页：http://localhost:3000/login-v1.0.html"
    echo "   中国地图：http://localhost:3000/map-v1.0.html"
    echo "   越南地图：http://localhost:3000/vietnam-map.html"
    echo ""
    echo "🔐 管理员账号：admin / admin123"
    echo ""
else
    echo "❌ 服务启动失败"
    echo "查看日志：tail backend/server.log"
fi
