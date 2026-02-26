# راهنمای کامل نصب پروژه OTIS روی سرور

این راهنما به شما کمک می‌کند که پروژه OTIS را روی یک سرور لینوکس نصب و راه‌اندازی کنید. حتی اگر تجربه قبلی ندارید، با دنبال کردن این مراحل می‌توانید پروژه را راه‌اندازی کنید.

---

## 📋 فهرست مطالب

1. [انتخاب سرور](#انتخاب-سرور)
2. [نیازمندی‌های سرور](#نیازمندی‌های-سرور)
3. [نصب نیازمندی‌ها روی سرور](#نصب-نیازمندی‌ها-روی-سرور)
4. [آماده‌سازی پروژه](#آماده-سازی-پروژه)
5. [تنظیم دیتابیس](#تنظیم-دیتابیس)
6. [تنظیم فایل‌های پروژه](#تنظیم-فایل-های-پروژه)
7. [راه‌اندازی پروژه](#راه-اندازی-پروژه)
8. [تنظیم Nginx (اختیاری)](#تنظیم-nginx-اختیاری)
9. [راه‌اندازی با Docker (ساده‌تر)](#راه-اندازی-با-docker-ساده-تر)
10. [مشکلات رایج و راه حل](#مشکلات-رایج-و-راه-حل)

---

## انتخاب سرور

### گزینه 1: سرور ابری (توصیه می‌شود)

**برای شروع:**
- **DigitalOcean**: از 5 دلار در ماه
- **Linode**: از 5 دلار در ماه
- **Vultr**: از 2.5 دلار در ماه
- **AWS Lightsail**: از 3.5 دلار در ماه
- **Hetzner**: از 4 یورو در ماه

**ویژگی‌های مورد نیاز:**
- سیستم عامل: Ubuntu 22.04 LTS (توصیه می‌شود)
- RAM: حداقل 2GB (توصیه: 4GB)
- CPU: حداقل 1 Core (توصیه: 2 Core)
- Disk: حداقل 20GB SSD

### گزینه 2: سرور اختصاصی

اگر سرور اختصاصی دارید، باید:
- سیستم عامل Ubuntu 22.04 LTS نصب باشد
- دسترسی root یا sudo داشته باشید

---

## نیازمندی‌های سرور

پروژه به موارد زیر نیاز دارد:

1. **Node.js** نسخه 20 یا بالاتر
2. **npm** (با نصب Node.js به صورت خودکار نصب می‌شود)
3. **MySQL** نسخه 8.0 یا بالاتر (یا SQL Server)
4. **Git** (برای دریافت کد پروژه)
5. **PM2** (برای اجرای دائمی پروژه - اختیاری اما توصیه می‌شود)

---

## نصب نیازمندی‌ها روی سرور

### مرحله 1: اتصال به سرور

با استفاده از SSH به سرور متصل شوید:

```bash
ssh root@your-server-ip
```

یا اگر از کاربر دیگری استفاده می‌کنید:

```bash
ssh username@your-server-ip
```

### مرحله 2: به‌روزرسانی سیستم

ابتدا سیستم را به‌روزرسانی کنید:

```bash
sudo apt update
sudo apt upgrade -y
```

### مرحله 3: نصب Node.js

برای نصب Node.js نسخه 20:

```bash
# نصب curl (اگر نصب نیست)
sudo apt install curl -y

# اضافه کردن repository Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# نصب Node.js
sudo apt install -y nodejs

# بررسی نسخه نصب شده
node --version
npm --version
```

باید خروجی مشابه زیر را ببینید:
```
v20.x.x
10.x.x
```

### مرحله 4: نصب MySQL

```bash
# نصب MySQL Server
sudo apt install mysql-server -y

# راه‌اندازی MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# تنظیم امنیت MySQL
sudo mysql_secure_installation
```

در هنگام اجرای `mysql_secure_installation`:
- برای "VALIDATE PASSWORD PLUGIN" می‌توانید `No` بزنید
- یک رمز قوی برای root انتخاب کنید و آن را یادداشت کنید
- به سوالات دیگر `Yes` بزنید

### مرحله 5: نصب Git

```bash
sudo apt install git -y
```

### مرحله 6: نصب PM2 (برای اجرای دائمی)

```bash
sudo npm install -g pm2
```

PM2 به شما کمک می‌کند که پروژه همیشه در حال اجرا باشد و در صورت خطا یا restart سرور، خودکار دوباره راه‌اندازی شود.

---

## آماده‌سازی پروژه

### مرحله 1: ایجاد دایرکتوری پروژه

```bash
# رفتن به دایرکتوری home
cd ~

# ایجاد دایرکتوری برای پروژه
mkdir otis-project
cd otis-project
```

### مرحله 2: دریافت کد پروژه

#### اگر پروژه در Git است:

```bash
git clone <آدرس-repository-شما> .
```

مثال:
```bash
git clone https://github.com/your-username/otis-project.git .
```

#### اگر پروژه را به صورت فایل ZIP دارید:

```bash
# آپلود فایل ZIP به سرور (با استفاده از scp یا sftp)
# سپس:
unzip otis-project.zip
cd otis-project
```

### مرحله 3: نصب وابستگی‌های پروژه

```bash
npm install
```

این کار ممکن است چند دقیقه طول بکشد. صبر کنید تا تمام شود.

---

## تنظیم دیتابیس

### مرحله 1: ورود به MySQL

```bash
sudo mysql -u root -p
```

رمز عبور root که در مرحله قبل تنظیم کردید را وارد کنید.

### مرحله 2: ایجاد دیتابیس

در MySQL، دستورات زیر را اجرا کنید:

```sql
-- ایجاد دیتابیس
CREATE DATABASE otis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد کاربر برای پروژه (اختیاری اما توصیه می‌شود)
CREATE USER 'otis_user'@'localhost' IDENTIFIED BY 'یک_رمز_قوی_اینجا_بنویسید';

-- دادن دسترسی به کاربر
GRANT ALL PRIVILEGES ON otis_db.* TO 'otis_user'@'localhost';

-- اعمال تغییرات
FLUSH PRIVILEGES;

-- خروج از MySQL
EXIT;
```

**نکته مهم**: رمز عبور `otis_user` را یادداشت کنید، بعداً به آن نیاز دارید.

### مرحله 3: راه‌اندازی جداول دیتابیس

بازگشت به دایرکتوری پروژه:

```bash
cd ~/otis-project
```

ایجاد فایل `.env.local`:

```bash
nano .env.local
```

محتوای زیر را در فایل قرار دهید (مقادیر را با اطلاعات خود جایگزین کنید):

```env
# Database Configuration
DB_CLIENT=mysql
DB_HOST=localhost
DB_USER=otis_user
DB_PASSWORD=رمز_عبور_که_در_مرحله_قبل_نوشتید
DB_NAME=otis_db
DB_POOL_LIMIT=10

# JWT Configuration (یک رشته تصادفی قوی بنویسید)
JWT_SECRET=یک_رشته_تصادفی_خیلی_قوی_اینجا_بنویسید_مثلا_abc123xyz789

# Application URL (آدرس سرور خود را بنویسید)
NEXT_PUBLIC_APP_URL=http://your-server-ip:3000

# Tenant Configuration
DEFAULT_TENANT_ID=1
TENANT_RESOLUTION_MODE=header

# Payment Gateway (اگر دارید)
ZARINPAL_MERCHANT_ID=your_merchant_id
ZARINPAL_SANDBOX=true
```

برای ذخیره فایل:
- `Ctrl + O` (ذخیره)
- `Enter` (تایید)
- `Ctrl + X` (خروج)

### مرحله 4: ایجاد جداول دیتابیس

```bash
npm run init-db
```

اگر همه چیز درست باشد، باید پیام زیر را ببینید:
```
✅ Database initialized successfully!
```

---

## تنظیم فایل‌های پروژه

### اضافه کردن فایل پس‌زمینه

یک فایل تصویر با نام `background.jpg` در پوشه `public` قرار دهید:

```bash
# اگر فایل را در کامپیوتر خود دارید، با scp آپلود کنید:
# از کامپیوتر خود:
scp background.jpg root@your-server-ip:~/otis-project/public/

# یا با استفاده از sftp
```

---

## راه‌اندازی پروژه

### روش 1: اجرای مستقیم (برای تست)

```bash
npm run build
npm start
```

پروژه در پورت 3000 اجرا می‌شود. می‌توانید با آدرس `http://your-server-ip:3000` به آن دسترسی داشته باشید.

**نکته**: این روش فقط برای تست است. اگر terminal را ببندید، پروژه متوقف می‌شود.

### روش 2: اجرا با PM2 (توصیه می‌شود)

PM2 پروژه را به صورت دائمی اجرا می‌کند:

```bash
# Build پروژه
npm run build

# اجرا با PM2
pm2 start npm --name "otis-app" -- start

# ذخیره تنظیمات PM2 (برای restart خودکار بعد از reboot)
pm2 save
pm2 startup
```

دستور آخر یک دستور را به شما می‌دهد که باید آن را اجرا کنید (مثلاً `sudo env PATH=...`).

**دستورات مفید PM2:**

```bash
# مشاهده وضعیت
pm2 status

# مشاهده لاگ‌ها
pm2 logs otis-app

# متوقف کردن
pm2 stop otis-app

# راه‌اندازی مجدد
pm2 restart otis-app

# حذف از PM2
pm2 delete otis-app
```

---

## تنظیم Nginx (اختیاری)

اگر می‌خواهید پروژه را با دامنه (مثل `https://yourdomain.com`) اجرا کنید، باید Nginx نصب کنید.

### نصب Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### تنظیم Nginx

```bash
sudo nano /etc/nginx/sites-available/otis
```

محتوای زیر را اضافه کنید:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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

فایل را ذخیره کنید و لینک symbolic ایجاد کنید:

```bash
sudo ln -s /etc/nginx/sites-available/otis /etc/nginx/sites-enabled/
```

بررسی تنظیمات:

```bash
sudo nginx -t
```

اگر همه چیز درست باشد، Nginx را restart کنید:

```bash
sudo systemctl restart nginx
```

### تنظیم SSL با Let's Encrypt (برای HTTPS)

```bash
# نصب Certbot
sudo apt install certbot python3-certbot-nginx -y

# دریافت گواهینامه SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

بعد از این، پروژه شما با HTTPS در دسترس خواهد بود.

**نکته**: در فایل `.env.local` باید `NEXT_PUBLIC_APP_URL` را به `https://yourdomain.com` تغییر دهید.

---

## راه‌اندازی با Docker (ساده‌تر)

اگر می‌خواهید از Docker استفاده کنید (ساده‌تر و سریع‌تر):

### نصب Docker

```bash
# نصب Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# اضافه کردن کاربر به گروه docker
sudo usermod -aG docker $USER

# نصب Docker Compose
sudo apt install docker-compose -y
```

بعد از نصب، باید از سرور خارج شوید و دوباره وارد شوید:

```bash
exit
# دوباره SSH کنید
```

### تنظیم Docker Compose

در دایرکتوری پروژه، فایل `docker-compose.yml` را ویرایش کنید:

```bash
cd ~/otis-project
nano docker-compose.yml
```

مقادیر environment را با اطلاعات خود تنظیم کنید.

### اجرا با Docker

```bash
# Build و اجرا
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# متوقف کردن
docker-compose down
```

---

## مشکلات رایج و راه حل

### مشکل 1: خطای "Port 3000 already in use"

**راه حل:**
```bash
# پیدا کردن پروسه که از پورت 3000 استفاده می‌کند
sudo lsof -i :3000

# متوقف کردن آن
sudo kill -9 <PID>
```

یا پورت را در `.env.local` تغییر دهید و در `next.config.ts` تنظیم کنید.

### مشکل 2: خطای اتصال به دیتابیس

**بررسی کنید:**
1. MySQL در حال اجرا است: `sudo systemctl status mysql`
2. اطلاعات دیتابیس در `.env.local` صحیح است
3. کاربر دیتابیس دسترسی دارد

**راه حل:**
```bash
# ورود به MySQL
sudo mysql -u root -p

# بررسی کاربر
SELECT user, host FROM mysql.user WHERE user='otis_user';

# اگر کاربر وجود ندارد، دوباره ایجاد کنید
```

### مشکل 3: خطای "Permission denied"

**راه حل:**
```bash
# دادن دسترسی به فولدر پروژه
sudo chown -R $USER:$USER ~/otis-project
chmod -R 755 ~/otis-project
```

### مشکل 4: پروژه بعد از بستن terminal متوقف می‌شود

**راه حل:** از PM2 استفاده کنید (بخش "راه‌اندازی پروژه - روش 2")

### مشکل 5: خطای Build

**راه حل:**
```bash
# پاک کردن cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### مشکل 6: پروژه کند است

**راه حل:**
1. بررسی RAM: `free -h`
2. اگر RAM کم است، از swap استفاده کنید
3. بررسی CPU: `top`
4. بررسی لاگ‌ها: `pm2 logs` یا `docker-compose logs`

---

## بررسی نهایی

بعد از راه‌اندازی، این موارد را بررسی کنید:

1. ✅ پروژه در حال اجرا است: `pm2 status` یا `docker-compose ps`
2. ✅ می‌توانید به آدرس دسترسی داشته باشید
3. ✅ صفحه لاگین نمایش داده می‌شود
4. ✅ لاگ‌ها خطایی نشان نمی‌دهند

---

## نکات مهم

1. **امنیت:**
   - حتماً `JWT_SECRET` را به یک رشته قوی تغییر دهید
   - رمز عبور دیتابیس را قوی انتخاب کنید
   - از HTTPS استفاده کنید (با Let's Encrypt)

2. **Backup:**
   - به صورت منظم از دیتابیس backup بگیرید:
   ```bash
   mysqldump -u otis_user -p otis_db > backup_$(date +%Y%m%d).sql
   ```

3. **به‌روزرسانی:**
   - به صورت منظم سیستم را به‌روزرسانی کنید:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **مانیتورینگ:**
   - از PM2 برای مانیتورینگ استفاده کنید
   - لاگ‌ها را به صورت منظم بررسی کنید

---

## پشتیبانی

اگر مشکلی پیش آمد:
1. لاگ‌ها را بررسی کنید
2. این راهنما را دوباره بخوانید
3. با تیم توسعه تماس بگیرید

---

**موفق باشید! 🚀**


