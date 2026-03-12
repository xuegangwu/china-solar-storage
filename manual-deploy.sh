#!/bin/bash
# 手动部署到 /demo 的说明

echo "=========================================="
echo "光储电站系统 - 手动部署指南"
echo "目标：47.100.20.52:/demo"
echo "=========================================="
echo ""

# 检查文件
echo "📦 检查部署文件..."
if [ -f "solar-storage-deploy.tar.gz" ]; then
    echo "✅ 项目包已准备：solar-storage-deploy.tar.gz"
    ls -lh solar-storage-deploy.tar.gz
else
    echo "❌ 项目包未找到，正在打包..."
    tar -czf solar-storage-deploy.tar.gz \
      --exclude='backend/node_modules' \
      --exclude='backend/data/*.db' \
      backend/ web/ docs/
    echo "✅ 打包完成"
fi

if [ -f "deploy-aliyun.sh" ]; then
    echo "✅ 部署脚本已准备：deploy-aliyun.sh"
else
    echo "❌ 部署脚本未找到"
fi

echo ""
echo "=========================================="
echo "请执行以下命令上传文件："
echo "=========================================="
echo ""
echo "1️⃣  上传文件到服务器："
echo "   scp solar-storage-deploy.tar.gz deploy-aliyun.sh root@47.100.20.52:/demo/"
echo ""
echo "2️⃣  登录服务器："
echo "   ssh root@47.100.20.52"
echo ""
echo "3️⃣  运行部署："
echo "   cd /demo"
echo "   chmod +x deploy-aliyun.sh"
echo "   ./deploy-aliyun.sh"
echo ""
echo "=========================================="
echo "或使用以下一键命令："
echo "=========================================="
echo ""
echo "ssh root@47.100.20.52 'bash -s' < deploy-remote.sh"
echo ""
echo "=========================================="
