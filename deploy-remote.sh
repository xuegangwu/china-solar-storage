#!/bin/bash
# 远程执行部署脚本（通过 SSH 管道）

set -e

echo "=========================================="
echo "光储电站系统 - 远程部署"
echo "=========================================="
echo ""

# 创建临时目录
TEMP_DIR="/tmp/solar-deploy-$$"
mkdir -p $TEMP_DIR
cd $TEMP_DIR

echo "📥 下载项目包..."
# 如果有 GitHub 或其他下载地址，在这里下载
# wget https://your-repo/solar-storage-deploy.tar.gz

echo "📦 解压项目..."
# tar -xzf solar-storage-deploy.tar.gz

echo "🚀 运行部署..."
# ./deploy-aliyun.sh

# 清理
cd /
rm -rf $TEMP_DIR

echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
