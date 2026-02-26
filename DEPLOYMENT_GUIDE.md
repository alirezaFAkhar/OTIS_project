# راهنمای نصب و راه‌اندازی پروژه OTIS

این راهنما به سوالات مهم درباره نصب و راه‌اندازی پروژه پاسخ می‌دهد.

---

## ❓ سوال 1: آیا باید MySQL روی سرور نصب شود؟

### پاسخ: **خیر، نیازی نیست!**

پروژه می‌تواند به یک **MySQL خارجی** (Remote MySQL) متصل شود. شما فقط باید:

1. **آدرس MySQL خود را در فایل `.env.local` تنظیم کنید**
2. **اطمینان حاصل کنید که سرور شما به MySQL خارجی دسترسی دارد**

### تنظیمات برای MySQL خارجی

در فایل `.env.local`:

```env
# اتصال به MySQL خارجی
DB_CLIENT=mysql
DB_HOST=آدرس_سرور_MySQL_شما  # مثلاً: mysql.example.com یا 192.168.1.100
DB_USER=نام_کاربری_MySQL
DB_PASSWORD=رمز_عبور_MySQL
DB_NAME=نام_دیتابیس
DB_POOL_LIMIT=10
```

**مثال:**
```env
DB_CLIENT=mysql
DB_HOST=mysql.yourcompany.com
DB_USER=otis_user
DB_PASSWORD=MySecurePassword123
DB_NAME=otis_production_db
```

### نکات مهم:

1. **فایروال**: مطمئن شوید که پورت 3306 MySQL از سرور شما قابل دسترسی است
2. **دسترسی کاربر**: کاربر MySQL باید از IP سرور شما دسترسی داشته باشد
3. **امنیت**: بهتر است از SSL برای اتصال استفاده کنید

### چه زمانی باید MySQL روی سرور نصب شود؟

فقط در این موارد:
- ✅ می‌خواهید از Docker Compose استفاده کنید (که MySQL را به صورت container اجرا می‌کند)
- ✅ می‌خواهید یک MySQL محلی برای تست داشته باشید
- ✅ MySQL خارجی ندارید و می‌خواهید روی همان سرور نصب کنید

---

## ❓ سوال 2: آیا می‌توان چندین مشتری را روی یک سرور اجرا کرد؟

### پاسخ: **بله، دو روش وجود دارد!**

### روش 1: استفاده از Multi-Tenant (توصیه می‌شود) ⭐

**این روش بهترین است!** پروژه از معماری Multi-Tenant پشتیبانی می‌کند، یعنی:

- ✅ **یک instance** از پروژه را اجرا می‌کنید
- ✅ **همه مشتری‌ها** از همان instance استفاده می‌کنند
- ✅ **داده‌ها جدا** هستند (با استفاده از `tenant_id`)
- ✅ **مدیریت ساده‌تر** و **مصرف منابع کمتر**

#### نحوه راه‌اندازی:

**1. تنظیم فایل `.env.local`:**

```env
# تنظیمات دیتابیس (مشترک برای همه)
DB_CLIENT=mysql
DB_HOST=mysql.yourcompany.com
DB_USER=otis_user
DB_PASSWORD=password
DB_NAME=otis_db

# تنظیمات Multi-Tenant
DEFAULT_TENANT_ID=1
TENANT_RESOLUTION_MODE=header

# نقشه‌برداری دامنه/ساب‌دامنه به Tenant ID
TENANT_SUBDOMAIN_MAP={"client1":1,"client2":2,"client3":3,"client4":4,"client5":5,"client6":6,"client7":7,"client8":8}
TENANT_DOMAIN_MAP={"client1.com":1,"client2.com":2,"client3.com":3}
```

**2. تنظیم DNS:**

برای هر مشتری یک subdomain یا domain تنظیم کنید:
- `client1.yourdomain.com` → Tenant ID: 1
- `client2.yourdomain.com` → Tenant ID: 2
- `client1.com` → Tenant ID: 1
- و غیره...

**3. تنظیم Nginx:**

```nginx
# برای subdomain
server {
    listen 80;
    server_name client1.yourdomain.com client2.yourdomain.com client3.yourdomain.com;

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

**4. اجرای پروژه:**

```bash
npm run build
pm2 start npm --name "otis-app" -- start
```

**5. ایجاد Tenantها در دیتابیس:**

در MySQL، برای هر مشتری یک رکورد در جدول `tenants` ایجاد کنید:

```sql
INSERT INTO tenants (id, name, subdomain, domain, is_active) VALUES
(1, 'مشتری 1', 'client1', 'client1.com', TRUE),
(2, 'مشتری 2', 'client2', 'client2.com', TRUE),
(3, 'مشتری 3', 'client3', 'client3.com', TRUE),
-- ... برای 8 مشتری
(8, 'مشتری 8', 'client8', 'client8.com', TRUE);
```

**مزایای این روش:**
- ✅ یک instance، مدیریت ساده
- ✅ مصرف منابع کمتر
- ✅ به‌روزرسانی راحت‌تر
- ✅ داده‌ها به صورت خودکار جدا هستند

---

### روش 2: اجرای چندین Instance جداگانه

اگر می‌خواهید هر مشتری یک instance جداگانه داشته باشد:

#### با استفاده از PM2 و پورت‌های مختلف:

**1. ایجاد فولدرهای جداگانه:**

```bash
cd ~
mkdir otis-client1 otis-client2 otis-client3 ... otis-client8
```

**2. کپی کردن پروژه در هر فولدر:**

```bash
cd otis-client1
git clone <repository-url> .
npm install
```

**3. تنظیم `.env.local` برای هر instance:**

**برای client1:**
```env
DB_CLIENT=mysql
DB_HOST=mysql.yourcompany.com
DB_USER=otis_user
DB_PASSWORD=password
DB_NAME=otis_db
DEFAULT_TENANT_ID=1
PORT=3001
NEXT_PUBLIC_APP_URL=http://client1.yourdomain.com
```

**برای client2:**
```env
DB_CLIENT=mysql
DB_HOST=mysql.yourcompany.com
DB_USER=otis_user
DB_PASSWORD=password
DB_NAME=otis_db
DEFAULT_TENANT_ID=2
PORT=3002
NEXT_PUBLIC_APP_URL=http://client2.yourdomain.com
```

**4. Build و اجرا:**

```bash
# برای client1
cd ~/otis-client1
npm run build
pm2 start npm --name "otis-client1" -- start -- --port 3001

# برای client2
cd ~/otis-client2
npm run build
pm2 start npm --name "otis-client2" -- start -- --port 3002

# و غیره...
```

**5. تنظیم Nginx:**

```nginx
# Client 1
server {
    listen 80;
    server_name client1.yourdomain.com;
    location / {
        proxy_pass http://localhost:3001;
        # ... بقیه تنظیمات proxy
    }
}

# Client 2
server {
    listen 80;
    server_name client2.yourdomain.com;
    location / {
        proxy_pass http://localhost:3002;
        # ... بقیه تنظیمات proxy
    }
}
```

#### با استفاده از Docker Compose:

**1. ایجاد فولدر برای هر مشتری:**

```bash
mkdir ~/otis-deployments
cd ~/otis-deployments
mkdir client1 client2 client3 ... client8
```

**2. کپی `docker-compose.yml` در هر فولدر:**

```bash
cp docker-compose.yml client1/
cp docker-compose.yml client2/
# ...
```

**3. ویرایش `docker-compose.yml` برای هر مشتری:**

**client1/docker-compose.yml:**
```yaml
services:
  app:
    ports:
      - "3001:3000"  # پورت متفاوت
    environment:
      - DEFAULT_TENANT_ID=1
      - NEXT_PUBLIC_APP_URL=http://client1.yourdomain.com
      # ... بقیه تنظیمات
```

**4. اجرا:**

```bash
cd client1
docker-compose up -d

cd ../client2
docker-compose up -d
# ...
```

**مزایا:**
- ✅ جداسازی کامل
- ✅ می‌توانید هر instance را جداگانه restart کنید

**معایب:**
- ❌ مصرف منابع بیشتر
- ❌ مدیریت پیچیده‌تر
- ❌ به‌روزرسانی سخت‌تر

---

## 📊 مقایسه دو روش

| ویژگی | Multi-Tenant (روش 1) | چند Instance (روش 2) |
|-------|---------------------|---------------------|
| مصرف RAM | کم (~500MB) | زیاد (~4GB برای 8 مشتری) |
| مصرف CPU | کم | زیاد |
| مدیریت | ساده | پیچیده |
| به‌روزرسانی | آسان (یک بار) | سخت (8 بار) |
| جداسازی داده | ✅ (با tenant_id) | ✅ (کامل) |
| جداسازی کد | ❌ | ✅ |
| توصیه | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## 🎯 توصیه نهایی

**برای 8 مشتری، حتماً از روش Multi-Tenant استفاده کنید!**

دلایل:
1. ✅ مصرف منابع کمتر (یک instance به جای 8)
2. ✅ مدیریت ساده‌تر
3. ✅ به‌روزرسانی راحت‌تر
4. ✅ پروژه از ابتدا برای Multi-Tenant طراحی شده
5. ✅ داده‌ها به صورت خودکار با `tenant_id` جدا هستند

---

## 📝 خلاصه مراحل نصب (با MySQL خارجی)

### 1. نصب نیازمندی‌ها (بدون MySQL):

```bash
# به‌روزرسانی سیستم
sudo apt update && sudo apt upgrade -y

# نصب Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# نصب Git
sudo apt install git -y

# نصب PM2
sudo npm install -g pm2

# نصب Nginx (اختیاری)
sudo apt install nginx -y
```

### 2. دریافت و نصب پروژه:

```bash
cd ~
git clone <repository-url> otis-project
cd otis-project
npm install
```

### 3. تنظیم `.env.local`:

```env
# اتصال به MySQL خارجی
DB_CLIENT=mysql
DB_HOST=آدرس_MySQL_شما
DB_USER=نام_کاربری
DB_PASSWORD=رمز_عبور
DB_NAME=نام_دیتابیس

# JWT
JWT_SECRET=یک_رشته_قوی_اینجا

# URL
NEXT_PUBLIC_APP_URL=http://yourdomain.com

# Multi-Tenant برای 8 مشتری
DEFAULT_TENANT_ID=1
TENANT_RESOLUTION_MODE=header
TENANT_SUBDOMAIN_MAP={"client1":1,"client2":2,"client3":3,"client4":4,"client5":5,"client6":6,"client7":7,"client8":8}
```

### 4. راه‌اندازی جداول (فقط یک بار):

```bash
npm run init-db
```

این دستور فقط جداول مربوط به سیستم (tenants, users, otp_codes, transactions) را ایجاد می‌کند. جداول شما (مثل Members, Payments) باید از قبل وجود داشته باشند.

### 5. Build و اجرا:

```bash
npm run build
pm2 start npm --name "otis-app" -- start
pm2 save
pm2 startup
```

### 6. تنظیم Nginx (اگر دامنه دارید):

```nginx
server {
    listen 80;
    server_name client1.yourdomain.com client2.yourdomain.com ... client8.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 7. ایجاد Tenantها در دیتابیس:

```sql
-- در MySQL خود
INSERT INTO tenants (id, name, subdomain, is_active) VALUES
(1, 'مشتری 1', 'client1', TRUE),
(2, 'مشتری 2', 'client2', TRUE),
(3, 'مشتری 3', 'client3', TRUE),
(4, 'مشتری 4', 'client4', TRUE),
(5, 'مشتری 5', 'client5', TRUE),
(6, 'مشتری 6', 'client6', TRUE),
(7, 'مشتری 7', 'client7', TRUE),
(8, 'مشتری 8', 'client8', TRUE);
```

---

## ✅ بررسی نهایی

بعد از راه‌اندازی:

1. ✅ پروژه در حال اجرا است: `pm2 status`
2. ✅ می‌توانید به `http://your-server-ip:3000` دسترسی داشته باشید
3. ✅ هر subdomain به tenant مربوطه متصل می‌شود
4. ✅ داده‌های هر مشتری جدا هستند

---

## 🔧 مشکلات احتمالی

### مشکل: نمی‌توانم به MySQL خارجی متصل شوم

**راه حل:**
1. بررسی کنید که IP سرور شما در MySQL whitelist باشد
2. بررسی کنید که پورت 3306 باز باشد
3. بررسی کنید که اطلاعات اتصال در `.env.local` صحیح باشد

### مشکل: داده‌های مشتری‌ها با هم قاطی می‌شوند

**راه حل:**
1. مطمئن شوید که `tenant_id` در تمام جداول وجود دارد
2. بررسی کنید که middleware به درستی tenant ID را تشخیص می‌دهد
3. بررسی کنید که `TENANT_SUBDOMAIN_MAP` صحیح است

---

**موفق باشید! 🚀**


