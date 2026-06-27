#!/bin/bash
# start.sh — Load .env rồi khởi động Spring Boot backend
# Dùng: ./start.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  echo "📦 Loading environment from .env..."
  # Export tất cả biến trong .env (bỏ qua comment và dòng trống)
  export $(grep -v '^\s*#' "$ENV_FILE" | grep -v '^\s*$' | xargs)
else
  echo "⚠️  .env không tồn tại. Sao chép từ .env.example:"
  echo "   cp .env.example .env"
  echo ""
  echo "Tiếp tục với biến môi trường hệ thống..."
fi

# Kiểm tra biến bắt buộc
if [ -z "$GITHUB_MODELS_TOKEN" ]; then
  echo "❌ Thiếu GITHUB_MODELS_TOKEN! Vui lòng set trong .env"
  exit 1
fi

echo "✅ GITHUB_MODELS_TOKEN: ${GITHUB_MODELS_TOKEN:0:8}... (OK)"
echo "🚀 Khởi động Spring Boot..."
echo ""

JAVA_HOME=/Users/ttcenter/Library/Java/JavaVirtualMachines/ms-21.0.10/Contents/Home \
  mvn spring-boot:run
