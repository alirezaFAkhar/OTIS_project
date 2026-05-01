#!/bin/bash

# اسکریپت build Docker image برای deploy بدون اینترنت
# استفاده: ./scripts/docker-build-offline.sh

set -e

echo "🐳 در حال build کردن Docker image..."
docker build -t otis-app:latest .

echo "💾 در حال ذخیره image به فایل..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_FILE="otis-app-image-${TIMESTAMP}.tar.gz"

docker save otis-app:latest | gzip > "$IMAGE_FILE"

# محاسبه حجم
SIZE=$(du -h "$IMAGE_FILE" | cut -f1)

echo ""
echo "✅ Docker image با موفقیت ایجاد شد!"
echo "📦 نام فایل: $IMAGE_FILE"
echo "📊 حجم: $SIZE"
echo ""
echo "📤 مراحل بعدی:"
echo "   1. فایل $IMAGE_FILE را به سرور منتقل کنید"
echo "   2. روی سرور: docker load < $IMAGE_FILE"
echo "   3. اجرا: docker run -d --name otis-app -p 3000:3000 --env-file .env.local otis-app:latest"
echo ""





