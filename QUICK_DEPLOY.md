# 🚀 راهنمای سریع Deploy بدون اینترنت

## روش پیشنهادی: Standalone Build

### روی کامپیوتر محلی (با اینترنت):

```bash
# 1. Build و Package
./scripts/build-for-offline.sh

# یا دستی:
npm run build
mkdir -p deploy-package
cp -r .next/standalone deploy-package/
cp -r public deploy-package/standalone/
cp -r .next/static deploy-package/standalone/.next/
cd deploy-package
tar -czf ../otis-deploy.tar.gz .
```

### انتقال به سرور:

```bash
# با SCP
scp otis-deploy-*.tar.gz user@server-ip:/home/user/

# یا با USB/هارد اکسترنال
```

### روی سرور (بدون اینترنت):

```bash
# 1. Extract
tar -xzf otis-deploy-*.tar.gz
cd deploy-package/standalone

# 2. تنظیم .env.local
nano .env.local
# اطلاعات دیتابیس را وارد کنید

# 3. اجرا
node server.js

# یا با PM2
pm2 start server.js --name otis-app
pm2 save
pm2 startup
```

---

## روش جایگزین: Docker

### روی کامپیوتر محلی:

```bash
./scripts/docker-build-offline.sh
```

### روی سرور:

```bash
docker load < otis-app-image-*.tar.gz
docker run -d --name otis-app -p 3000:3000 --env-file .env.local otis-app:latest
```

---

## ⚠️ نکات مهم:

1. ✅ مطمئن شوید Node.js روی سرور نصب است (حداقل v20)
2. ✅ فایل `.env.local` را با اطلاعات صحیح تنظیم کنید
3. ✅ پورت 3000 را در فایروال باز کنید
4. ✅ اتصال به دیتابیس را تست کنید

---

## 📞 در صورت مشکل:

- فایل `OFFLINE_DEPLOYMENT_GUIDE.md` را مطالعه کنید
- مطمئن شوید که `output: 'standalone'` در `next.config.ts` فعال است





