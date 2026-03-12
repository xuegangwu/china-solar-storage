#!/bin/bash
# 部署到 47.100.20.52 的准备脚本

echo "======================================"
echo "光储电站系统 - 部署准备"
echo "目标服务器：47.100.20.52"
echo "======================================"
echo ""

# 1. 打包项目
echo "📦 步骤 1: 打包项目..."
cd /home/admin/openclaw/workspace/projects/china-solar-storage

tar -czf solar-storage-deploy.tar.gz \
  --exclude='backend/node_modules' \
  --exclude='backend/data/*.db' \
  --exclude='backend/crawlers/*.json' \
  --exclude='.git' \
  --exclude='*.log' \
  backend/ web/ docs/ README.md deploy-aliyun.sh

echo "✅ 打包完成"
ls -lh solar-storage-deploy.tar.gz
echo ""

# 2. 测试 SSH 连接
echo "🔐 步骤 2: 测试 SSH 连接..."
ssh -o ConnectTimeout=5 -o BatchMode=yes root@47.100.20.52 "echo 'SSH 连接成功'" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ SSH 连接正常"
else
    echo "⚠️  SSH 连接失败，请检查："
    echo "   1. 服务器是否开机"
    echo "   2. 安全组是否开放 22 端口"
    echo "   3. SSH 密钥是否正确"
    echo ""
    echo "   手动测试：ssh root@47.100.20.52"
fi
echo ""

# 3. 上传文件
echo "📤 步骤 3: 上传文件到服务器..."
echo "   执行命令："
echo "   scp solar-storage-deploy.tar.gz deploy-aliyun.sh root@47.100.20.52:/opt/"
echo ""

# 4. 部署说明
echo "======================================"
echo "📋 部署步骤"
echo "======================================"
echo ""
echo "1️⃣  上传文件（本地执行）："
echo "   scp solar-storage-deploy.tar.gz deploy-aliyun.sh root@47.100.20.52:/opt/"
echo ""
echo "2️⃣  登录服务器："
echo "   ssh root@47.100.20.52"
echo ""
echo "3️⃣  运行部署（服务器上执行）："
echo "   cd /opt"
echo "   chmod +x deploy-aliyun.sh"
echo "   ./deploy-aliyun.sh"
echo ""
echo "4️⃣  验证部署："
echo "   pm2 status"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "======================================"
echo "🌐 部署后访问地址："
echo "======================================"
echo ""
echo "   http://47.100.20.52"
echo ""
echo "======================================"
echo ""
