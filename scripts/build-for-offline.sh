#!/bin/bash

# اسکریپت build و package برای deploy بدون اینترنت
# استفاده: ./scripts/build-for-offline.sh

set -e  # در صورت خطا متوقف شود

echo "🔨 در حال build کردن پروژه..."
npm run build

echo "📦 در حال ایجاد پکیج deploy..."
mkdir -p deploy-package
cd deploy-package

# کپی کردن standalone
echo "📋 کپی کردن فایل‌های standalone..."
cp -r ../.next/standalone ./

# کپی کردن public (اگر وجود دارد)
if [ -d "../public" ]; then
    echo "📁 کپی کردن فولدر public..."
    cp -r ../public ./standalone/
fi

# کپی کردن static files
if [ -d "../.next/static" ]; then
    echo "🖼️  کپی کردن فایل‌های استاتیک..."
    mkdir -p ./standalone/.next
    cp -r ../.next/static ./standalone/.next/
fi

# ایجاد اسکریپت start
echo "📝 ایجاد اسکریپت start..."
cat > ./standalone/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
node server.js
EOF
chmod +x ./standalone/start.sh

# ایجاد فایل راهنما
echo "📖 ایجاد فایل راهنما..."
cat > ./DEPLOY_INSTRUCTIONS.txt << 'EOF'
========================================
راهنمای نصب روی سرور
========================================

1. نصب Node.js (اگر نصب نشده):
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

2. Extract کردن فایل:
   tar -xzf otis-deploy-*.tar.gz
   cd deploy-package/standalone

3. تنظیم .env.local:
   nano .env.local
   (اطلاعات دیتابیس و تنظیمات را وارد کنید)

4. اجرا:
   ./start.sh

   یا با PM2:
   pm2 start server.js --name otis-app
   pm2 save
   pm2 startup

========================================
EOF

# بازگشت به root
cd ..

# ایجاد package با timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="otis-deploy-${TIMESTAMP}.tar.gz"

echo "🗜️  فشرده‌سازی..."
tar -czf "$PACKAGE_NAME" deploy-package/

# محاسبه حجم
SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)

echo ""
echo "✅ پکیج با موفقیت ایجاد شد!"
echo "📦 نام فایل: $PACKAGE_NAME"
echo "📊 حجم: $SIZE"
echo ""
echo "📤 مراحل بعدی:"
echo "   1. فایل $PACKAGE_NAME را به سرور منتقل کنید"
echo "   2. روی سرور: tar -xzf $PACKAGE_NAME"
echo "   3. cd deploy-package/standalone"
echo "   4. تنظیم .env.local و سپس ./start.sh"
echo ""

