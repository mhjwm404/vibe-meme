#!/bin/bash

# Meme生成器启动脚本
# 使用方法: ./start.sh

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 加载nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    echo "正在尝试使用nvm安装Node.js LTS版本..."
    nvm install --lts
    nvm use --lts
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到npm"
    exit 1
fi

# 检查node_modules是否存在，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
    echo "检测到未安装依赖，正在安装..."
    npm install
fi

# 显示启动信息
echo "=========================================="
echo "  Meme生成器开发服务器"
echo "=========================================="
echo "项目目录: $SCRIPT_DIR"
echo "Node版本: $(node --version)"
echo "npm版本: $(npm --version)"
echo ""
echo "正在启动开发服务器..."
echo "服务器将在 http://localhost:5173 启动"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "=========================================="
echo ""

# 启动开发服务器
npm run dev
