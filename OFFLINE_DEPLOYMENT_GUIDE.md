# راهنمای Deploy بدون اینترنت (برای سرورهای ایران)

این راهنما روش‌های مختلف برای build و deploy پروژه بدون نیاز به npm روی سرور را توضیح می‌دهد.

---

## 🎯 روش 1: استفاده از Standalone Build (توصیه می‌شود) ⭐⭐⭐⭐⭐

این روش بهترین و ساده‌ترین راه است. Next.js یک build کامل با تمام dependencies ایجاد می‌کند.

### مراحل:

#### 1. Build پروژه روی کامپیوتر محلی (جایی که اینترنت دارید):

```bash
# در کامپیوتر محلی
cd /Users/alireza/Documents/OTIS_pro/my-app
npm install  # اگر قبلاً نصب نکرده‌اید
npm run build
```

بعد از build، یک فولدر `.next/standalone` ایجاد می‌شود که شامل تمام چیزهای لازم است.

#### 2. آماده‌سازی فایل‌ها برای انتقال:

```bash
# در کامپیوتر محلی
cd /Users/alireza/Documents/OTIS_pro/my-app

# ایجاد یک فولدر برای deploy
mkdir -p deploy-package
cd deploy-package

# کپی کردن فولدر standalone
cp -r ../.next/standalone ./

# کپی کردن فولدر public (اگر دارید)
cp -r ../public ./standalone/

# کپی کردن فایل‌های استاتیک دیگر
cp -r ../.next/static ./standalone/.next/

# کپی کردن فایل .env.local (یا ایجاد یک template)
cp ../.env.local ./standalone/.env.local

# ایجاد یک اسکریپت start
cat > ./standalone/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
node server.js
EOF

chmod +x ./standalone/start.sh

# ایجاد یک فایل README برای سرور
cat > ./DEPLOY_INSTRUCTIONS.txt << 'EOF'
مراحل نصب روی سرور:

1. نصب Node.js (اگر نصب نشده):
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

2. انتقال فایل‌ها به سرور:
   scp -r standalone user@server:/path/to/deploy/

3. روی سرور:
   cd /path/to/deploy/standalone
   chmod +x start.sh
   ./start.sh

4. یا با PM2:
   pm2 start server.js --name otis-app
   pm2 save
EOF

# فشرده‌سازی
cd ..
tar -czf otis-deploy.tar.gz deploy-package/
```

#### 3. انتقال به سرور:

```bash
# انتقال فایل فشرده به سرور
scp otis-deploy.tar.gz user@your-server-ip:/home/user/

# یا با استفاده از USB/هارد اکسترنال
# فایل otis-deploy.tar.gz را کپی کنید
```

#### 4. نصب روی سرور:

```bash
# روی سرور (SSH کنید)
cd /home/user
tar -xzf otis-deploy.tar.gz
cd deploy-package/standalone

# نصب Node.js (اگر نصب نشده - فقط یک بار)
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt install -y nodejs

# تنظیم .env.local
nano .env.local  # اطلاعات دیتابیس و تنظیمات را وارد کنید

# اجرا
chmod +x start.sh
./start.sh

# یا با PM2 (توصیه می‌شود)
pm2 start server.js --name otis-app
pm2 save
pm2 startup  # برای اجرای خودکار بعد از restart
```

---

## 🐳 روش 2: استفاده از Docker (برای محیط‌های حرفه‌ای)

این روش برای محیط‌های production و مدیریت بهتر مناسب است.

### مراحل:

#### 1. ایجاد Dockerfile (اگر ندارید):

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Build Docker Image روی کامپیوتر محلی:

```bash
# در کامپیوتر محلی
cd /Users/alireza/Documents/OTIS_pro/my-app

# Build image
docker build -t otis-app:latest .

# Save image به فایل
docker save otis-app:latest | gzip > otis-app-image.tar.gz
```

#### 3. انتقال و Load روی سرور:

```bash
# انتقال به سرور
scp otis-app-image.tar.gz user@your-server-ip:/home/user/

# روی سرور
# نصب Docker (اگر نصب نشده)
# sudo apt update
# sudo apt install docker.io -y
# sudo systemctl start docker
# sudo systemctl enable docker

# Load image
docker load < otis-app-image.tar.gz

# اجرا
docker run -d \
  --name otis-app \
  -p 3000:3000 \
  --env-file .env.local \
  --restart unless-stopped \
  otis-app:latest
```

---

## 📦 روش 3: کپی کامل پروژه با node_modules

این روش ساده است اما حجم بیشتری دارد.

### مراحل:

#### 1. Build و آماده‌سازی روی کامپیوتر محلی:

```bash
cd /Users/alireza/Documents/OTIS_pro/my-app

# نصب dependencies
npm install

# Build
npm run build

# ایجاد package برای انتقال
mkdir -p ../otis-deploy-full
cp -r . ../otis-deploy-full/
cd ../otis-deploy-full

# حذف فایل‌های غیرضروری
rm -rf .git
rm -rf node_modules/.cache
rm -rf .next/cache

# فشرده‌سازی
cd ..
tar -czf otis-deploy-full.tar.gz otis-deploy-full/
```

#### 2. انتقال و نصب روی سرور:

```bash
# انتقال
scp otis-deploy-full.tar.gz user@your-server-ip:/home/user/

# روی سرور
cd /home/user
tar -xzf otis-deploy-full.tar.gz
cd otis-deploy-full

# تنظیم .env.local
nano .env.local

# اجرا (بدون npm install - چون node_modules موجود است)
npm run start

# یا با PM2
pm2 start npm --name otis-app -- start
pm2 save
```

---

## 🚀 روش 4: استفاده از npm pack (برای پکیج‌های سفارشی)

اگر می‌خواهید یک پکیج کامل با تمام dependencies ایجاد کنید:

### مراحل:

#### 1. ایجاد پکیج محلی:

```bash
cd /Users/alireza/Documents/OTIS_pro/my-app

# نصب dependencies
npm install

# Build
npm run build

# ایجاد یک فولدر deploy
mkdir -p deploy-offline
cd deploy-offline

# کپی پروژه
cp -r ../. .
rm -rf .git node_modules/.cache .next/cache

# فشرده‌سازی
cd ..
tar -czf otis-offline.tar.gz deploy-offline/
```

#### 2. روی سرور:

```bash
# Extract
tar -xzf otis-offline.tar.gz
cd deploy-offline

# تنظیم .env.local
nano .env.local

# اجرا (node_modules از قبل موجود است)
npm run start
```

---

## 📋 مقایسه روش‌ها

| روش | حجم | پیچیدگی | سرعت | توصیه |
|-----|-----|---------|------|-------|
| Standalone | کم (~50-100MB) | ساده | سریع | ⭐⭐⭐⭐⭐ |
| Docker | متوسط (~200-300MB) | متوسط | سریع | ⭐⭐⭐⭐ |
| Full Copy | زیاد (~500MB+) | خیلی ساده | کند | ⭐⭐⭐ |

---

## ✅ چک‌لیست قبل از Deploy

- [ ] پروژه روی کامپیوتر محلی build شده است
- [ ] فایل `.env.local` آماده است (با اطلاعات دیتابیس سرور)
- [ ] Node.js روی سرور نصب است (یا در package قرار دارد)
- [ ] پورت 3000 روی سرور باز است
- [ ] اتصال به دیتابیس تست شده است
- [ ] فایل‌های استاتیک (public) کپی شده‌اند

---

## 🔧 تنظیمات مهم برای سرور

### 1. فایل `.env.local` روی سرور:

```env
# دیتابیس
DB_CLIENT=mysql
DB_HOST=your-mysql-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database
DB_POOL_LIMIT=10

# JWT
JWT_SECRET=your-secret-key-here

# URL
NEXT_PUBLIC_APP_URL=http://your-domain.com

# Multi-Tenant
DEFAULT_TENANT_ID=1
TENANT_RESOLUTION_MODE=header
TENANT_SUBDOMAIN_MAP={"client1":1,"client2":2}
```

### 2. استفاده از PM2 (توصیه می‌شود):

```bash
# نصب PM2 (یک بار)
npm install -g pm2

# اجرا
pm2 start server.js --name otis-app
pm2 save
pm2 startup  # برای اجرای خودکار
```

### 3. تنظیم Nginx (اگر دامنه دارید):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🆘 حل مشکلات

### مشکل: `Cannot find module` روی سرور

**راه حل:**
- مطمئن شوید که از روش Standalone استفاده می‌کنید
- یا مطمئن شوید که `node_modules` کامل کپی شده است

### مشکل: پورت 3000 در دسترس نیست

**راه حل:**
```bash
# بررسی پورت
sudo netstat -tulpn | grep 3000

# یا تغییر پورت در .env.local
PORT=3001
```

### مشکل: اتصال به دیتابیس برقرار نمی‌شود

**راه حل:**
- بررسی کنید که IP سرور در MySQL whitelist باشد
- بررسی کنید که پورت 3306 باز باشد
- اطلاعات `.env.local` را بررسی کنید

---

## 📝 اسکریپت خودکار برای Build و Package

می‌توانید این اسکریپت را در پروژه قرار دهید:

```bash
#!/bin/bash
# save as: scripts/build-for-offline.sh

echo "🔨 Building project..."
npm run build

echo "📦 Creating deployment package..."
mkdir -p deploy-package
cd deploy-package

# Copy standalone
cp -r ../.next/standalone ./
cp -r ../public ./standalone/ 2>/dev/null || true
cp -r ../.next/static ./standalone/.next/ 2>/dev/null || true

# Create start script
cat > ./standalone/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
node server.js
EOF
chmod +x ./standalone/start.sh

# Create package
cd ..
tar -czf otis-deploy-$(date +%Y%m%d-%H%M%S).tar.gz deploy-package/

echo "✅ Package created: otis-deploy-*.tar.gz"
echo "📤 Transfer to server and extract, then run: cd standalone && ./start.sh"
```

اجرا:
```bash
chmod +x scripts/build-for-offline.sh
./scripts/build-for-offline.sh
```

---

**موفق باشید! 🚀**





