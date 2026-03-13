#!/bin/bash
# 后端服务启动脚本

echo "🌞 光储电站投资地图 - 后端服务"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"

# 进入后端目录
cd "$(dirname "$0")"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install
fi

# 检查数据库
if [ ! -f "data/solar-storage.db" ]; then
    echo "🗄️ 初始化数据库..."
    node scripts/init-db.js
fi

# 启动服务
echo ""
echo "🚀 启动后端服务..."
echo ""

npm start
