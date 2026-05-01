# 🖥️ نیازمندی‌های سرور برای Deploy بدون اینترنت

این راهنما دقیقاً مشخص می‌کند که سرور شما برای اجرای پروژه با روش **offline deployment** چه چیزهایی باید داشته باشد.

---

## ✅ چیزهایی که سرور **باید** داشته باشد (الزامی)

### 1. Node.js (فقط runtime - بدون npm install) ⭐

**مهم:** سرور فقط به **Node.js runtime** نیاز دارد، نه npm یا package manager!

- **نسخه:** Node.js 20.x یا بالاتر
- **نصب:** باید از قبل نصب شده باشد (قبل از قطع اینترنت)
- **بررسی:**
  ```bash
  node --version  # باید v20.x.x باشد
  ```

**⚠️ نکته مهم:** 
- اگر Node.js روی سرور نصب نیست، باید **قبل از قطع اینترنت** نصب کنید
- یا می‌توانید Node.js binary را هم در پکیج قرار دهید (در ادامه توضیح می‌دهم)

---

### 2. دسترسی به دیتابیس

سرور باید بتواند به دیتابیس متصل شود:

#### گزینه 1: MySQL خارجی (Remote)
- **نیازی به نصب MySQL روی سرور نیست**
- فقط باید IP سرور در MySQL whitelist باشد
- پورت 3306 باید باز باشد

#### گزینه 2: MSSQL خارجی (Remote)
- **نیازی به نصب SQL Server روی سرور نیست**
- فقط باید IP سرور به SQL Server دسترسی داشته باشد
- پورت 1433 باید باز باشد

---

### 3. فایل‌های پروژه (از پکیج)

بعد از extract کردن پکیج، این فایل‌ها باید موجود باشند:

```
standalone/
├── server.js          # فایل اصلی
├── node_modules/      # تمام dependencies (در پکیج است)
├── .next/            # فایل‌های build شده
├── public/           # فایل‌های استاتیک
└── .env.local        # تنظیمات (باید خودتان ایجاد کنید)
```

**✅ همه اینها در پکیج است - نیازی به دانلود نیست!**

---

## ❌ چیزهایی که سرور **نیازی ندارد** (با روش offline)

### 1. npm یا yarn
- ❌ نیازی به npm install نیست
- ❌ نیازی به package manager نیست
- ✅ همه node_modules در پکیج است

### 2. اینترنت
- ❌ نیازی به اتصال به npm registry نیست
- ❌ نیازی به دانلود پکیج نیست
- ✅ همه چیز در پکیج است

### 3. Git
- ❌ نیازی به git clone نیست
- ❌ نیازی به repository نیست

### 4. Build tools
- ❌ نیازی به npm run build نیست
- ❌ نیازی به TypeScript compiler نیست
- ✅ همه چیز از قبل build شده است

---

## 📋 چک‌لیست قبل از Deploy

### روی کامپیوتر محلی (با اینترنت):

- [ ] پروژه build شده است (`npm run build`)
- [ ] پکیج ایجاد شده است (`./scripts/build-for-offline.sh`)
- [ ] فایل `.tar.gz` آماده است

### روی سرور (بدون اینترنت):

- [ ] Node.js 20.x نصب است (`node --version`)
- [ ] پکیج extract شده است (`tar -xzf otis-deploy-*.tar.gz`)
- [ ] فایل `.env.local` ایجاد و تنظیم شده است
- [ ] دسترسی به دیتابیس برقرار است
- [ ] پورت 3000 باز است (یا پورت دیگری که استفاده می‌کنید)

---

## 🔧 مراحل دقیق روی سرور (بدون اینترنت)

### مرحله 1: بررسی Node.js

```bash
# بررسی وجود Node.js
node --version

# اگر نصب نیست، باید از قبل نصب کرده باشید
# یا از روش نصب offline استفاده کنید (در ادامه)
```

### مرحله 2: Extract پکیج

```bash
# انتقال پکیج به سرور (با USB/هارد/SCP)
# سپس extract
tar -xzf otis-deploy-*.tar.gz
cd deploy-package/standalone
```

### مرحله 3: تنظیم .env.local

```bash
# ایجاد فایل .env.local
nano .env.local
```

**محتوای .env.local:**
```env
# دیتابیس
DB_CLIENT=mysql
DB_HOST=your-mysql-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database

# JWT
JWT_SECRET=your-secret-key

# URL
NEXT_PUBLIC_APP_URL=http://your-domain.com

# Multi-Tenant (اگر استفاده می‌کنید)
DEFAULT_TENANT_ID=1
TENANT_RESOLUTION_MODE=header
TENANT_SUBDOMAIN_MAP={"client1":1,"client2":2}
```

### مرحله 4: اجرا

```bash
# روش 1: مستقیم
node server.js

# روش 2: با PM2 (توصیه می‌شود)
pm2 start server.js --name otis-app
pm2 save
```

---

## 🚨 اگر Node.js روی سرور نصب نیست

### راه حل 1: نصب Node.js قبل از قطع اینترنت

```bash
# روی سرور (قبل از قطع اینترنت)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # بررسی
```

### راه حل 2: استفاده از Node.js Binary (بدون نیاز به اینترنت)

می‌توانید Node.js binary را هم در پکیج قرار دهید:

#### روی کامپیوتر محلی:

```bash
# دانلود Node.js binary
wget https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz

# اضافه کردن به پکیج
# در اسکریپت build-for-offline.sh اضافه کنید
```

#### روی سرور:

```bash
# Extract Node.js
tar -xf node-v20.11.0-linux-x64.tar.xz

# استفاده از Node.js محلی
./node-v20.11.0-linux-x64/bin/node server.js
```

---

## 📊 خلاصه نیازمندی‌های سرور

| نیازمندی | الزامی | توضیح |
|---------|--------|-------|
| **Node.js Runtime** | ✅ بله | فقط runtime، نه npm |
| **npm/yarn** | ❌ خیر | همه dependencies در پکیج است |
| **اینترنت** | ❌ خیر | همه چیز در پکیج است |
| **Git** | ❌ خیر | نیازی نیست |
| **Build Tools** | ❌ خیر | از قبل build شده |
| **MySQL/SQL Server** | ⚠️ بستگی دارد | اگر خارجی است، فقط اتصال نیاز است |
| **دسترسی SSH** | ✅ بله | برای مدیریت |
| **پورت 3000** | ✅ بله | برای اجرای برنامه |

---

## 🎯 حداقل نیازمندی‌های سرور

### سخت‌افزار:
- **CPU:** 1 Core (کافی است)
- **RAM:** 512MB (حداقل) - 1GB (توصیه می‌شود)
- **Storage:** 5GB (برای پکیج + Node.js)

### نرم‌افزار:
- **OS:** Linux (Ubuntu/Debian)
- **Node.js:** v20.x (فقط runtime)
- **دسترسی:** SSH

---

## ✅ تست سریع روی سرور

بعد از extract و تنظیم `.env.local`:

```bash
cd deploy-package/standalone

# تست Node.js
node --version

# تست اجرا
node server.js

# باید ببینید:
# - Ready on http://localhost:3000
# - بدون خطا
```

---

## 🔍 عیب‌یابی

### مشکل: `node: command not found`

**راه حل:**
- Node.js نصب نیست
- باید از قبل نصب کنید یا از binary استفاده کنید

### مشکل: `Cannot find module`

**راه حل:**
- مطمئن شوید که `node_modules` در پکیج است
- از روش standalone استفاده کنید (که من آماده کردم)

### مشکل: `ECONNREFUSED` (اتصال به دیتابیس)

**راه حل:**
- بررسی `.env.local`
- بررسی دسترسی IP سرور به دیتابیس
- بررسی فایروال

---

## 📝 خلاصه نهایی

**برای اجرای پروژه با روش offline روی سرور، فقط نیاز دارید:**

1. ✅ **Node.js 20.x** (فقط runtime - بدون npm)
2. ✅ **پکیج extract شده** (که شامل همه چیز است)
3. ✅ **فایل .env.local** (با اطلاعات دیتابیس)
4. ✅ **دسترسی به دیتابیس** (MySQL یا MSSQL)

**نیازی نیست:**
- ❌ npm install
- ❌ اینترنت
- ❌ git clone
- ❌ build کردن

---

**موفق باشید! 🚀**





