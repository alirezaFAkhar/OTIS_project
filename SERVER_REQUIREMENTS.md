# 📋 مشخصات سرور مورد نیاز برای پروژه OTIS

این راهنما مشخصات دقیق سرور مورد نیاز برای اجرای پروژه را توضیح می‌دهد.

---

## 🖥️ مشخصات سخت‌افزاری

### حداقل (Minimum) - برای تست و توسعه

| مشخصه | مقدار |
|------|-------|
| **CPU** | 1 Core (2.0 GHz+) |
| **RAM** | 1 GB |
| **Storage** | 10 GB SSD |
| **Bandwidth** | 100 Mbps |
| **قیمت تقریبی** | ~$5-10/ماه |

**⚠️ توجه:** این مشخصات فقط برای تست مناسب است و برای production توصیه نمی‌شود.

---

### پیشنهادی (Recommended) - برای Production

| مشخصه | مقدار |
|------|-------|
| **CPU** | 2-4 Cores (2.5 GHz+) |
| **RAM** | 2-4 GB |
| **Storage** | 20-40 GB SSD |
| **Bandwidth** | 1 Gbps |
| **قیمت تقریبی** | ~$20-40/ماه |

**✅ این مشخصات برای 1-5 مشتری مناسب است.**

---

### بهینه (Optimal) - برای چندین مشتری

| مشخصه | مقدار |
|------|-------|
| **CPU** | 4-8 Cores (3.0 GHz+) |
| **RAM** | 4-8 GB |
| **Storage** | 50-100 GB SSD |
| **Bandwidth** | 1 Gbps+ |
| **قیمت تقریبی** | ~$50-100/ماه |

**✅ این مشخصات برای 5-10 مشتری مناسب است.**

---

## 💻 سیستم عامل (OS)

### گزینه 1: Ubuntu Server (توصیه می‌شود) ⭐

- **نسخه:** Ubuntu 20.04 LTS یا 22.04 LTS
- **مزایا:**
  - پشتیبانی طولانی‌مدت
  - مستندات کامل
  - نصب آسان Node.js
  - امنیت بالا

### گزینه 2: Debian

- **نسخه:** Debian 11 (Bullseye) یا 12 (Bookworm)
- **مزایا:**
  - سبک و سریع
  - امنیت بالا
  - مناسب برای سرورهای کم‌منابع

### گزینه 3: CentOS/Rocky Linux

- **نسخه:** CentOS 8+ یا Rocky Linux 8+
- **مزایا:**
  - پایدار
  - مناسب برای enterprise

---

## 🔧 نرم‌افزارهای مورد نیاز

### 1. Node.js (الزامی)

- **نسخه:** Node.js 20.x یا بالاتر
- **نصب:**
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  ```
- **بررسی:**
  ```bash
  node --version  # باید v20.x.x باشد
  npm --version
  ```

### 2. PM2 (توصیه می‌شود)

- **برای مدیریت process:**
  ```bash
  sudo npm install -g pm2
  ```
- **مزایا:**
  - Restart خودکار در صورت crash
  - Log management
  - اجرای خودکار بعد از restart سرور

### 3. Nginx (اختیاری - برای دامنه)

- **برای reverse proxy:**
  ```bash
  sudo apt install nginx -y
  ```
- **مزایا:**
  - SSL/TLS (HTTPS)
  - Load balancing
  - Static file serving

### 4. Docker (اختیاری - برای روش Docker)

- **نصب:**
  ```bash
  sudo apt update
  sudo apt install docker.io -y
  sudo systemctl start docker
  sudo systemctl enable docker
  ```

---

## 🗄️ دیتابیس

### گزینه 1: MySQL خارجی (Remote MySQL) ⭐

**نیازی به نصب MySQL روی سرور نیست!**

- **مزایا:**
  - مصرف RAM کمتر روی سرور
  - مدیریت مرکزی
  - مناسب برای چندین سرور

**نیازمندی‌ها:**
- دسترسی به MySQL Server از طریق اینترنت
- IP سرور در MySQL whitelist باشد
- پورت 3306 باز باشد

### گزینه 2: MySQL محلی

- **نصب:**
  ```bash
  sudo apt install mysql-server -y
  ```
- **نیازمندی RAM اضافی:** ~500MB-1GB

### گزینه 3: Microsoft SQL Server

- **برای MSSQL:**
  - می‌تواند خارجی باشد (Remote)
  - یا روی سرور Windows نصب شود

---

## 🌐 شبکه و پورت‌ها

### پورت‌های مورد نیاز:

| پورت | پروتکل | استفاده |
|------|--------|---------|
| **3000** | TCP | Next.js Application |
| **80** | TCP | HTTP (برای Nginx) |
| **443** | TCP | HTTPS (برای Nginx) |
| **22** | TCP | SSH (برای مدیریت) |

### تنظیمات Firewall:

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Next.js (اگر مستقیم استفاده می‌کنید)
sudo ufw enable
```

---

## 📊 مصرف منابع (Resource Usage)

### در حالت Idle (بدون ترافیک):

- **RAM:** ~200-300 MB
- **CPU:** ~1-2%
- **Storage:** ~500MB-1GB (بعد از build)

### در حالت Normal (ترافیک متوسط):

- **RAM:** ~400-600 MB
- **CPU:** ~10-20%
- **Storage:** ~1-2 GB

### در حالت Peak (ترافیک بالا):

- **RAM:** ~800MB-1.5GB
- **CPU:** ~30-50%
- **Storage:** ~2-3 GB

---

## 🏢 پیشنهادات برای سرویس‌دهندگان ایرانی

### گزینه 1: سرورهای VPS ایرانی

| سرویس‌دهنده | حداقل پلن | قیمت تقریبی |
|------------|----------|------------|
| **آریا سرور** | 2 Core, 2GB RAM | ~500,000 تومان/ماه |
| **ایران سرور** | 2 Core, 2GB RAM | ~400,000 تومان/ماه |
| **پارس سرور** | 2 Core, 2GB RAM | ~450,000 تومان/ماه |

### گزینه 2: سرورهای خارجی (با VPN/Proxy)

| سرویس‌دهنده | حداقل پلن | قیمت تقریبی |
|------------|----------|------------|
| **DigitalOcean** | 2GB RAM, 1 vCPU | ~$12/ماه |
| **Vultr** | 2GB RAM, 1 vCPU | ~$12/ماه |
| **Linode** | 2GB RAM, 1 vCPU | ~$12/ماه |
| **Hetzner** | 2GB RAM, 1 vCPU | ~$5-8/ماه |

---

## ✅ چک‌لیست قبل از خرید سرور

- [ ] حداقل 2GB RAM
- [ ] حداقل 2 CPU Core
- [ ] 20GB+ Storage (SSD بهتر است)
- [ ] Ubuntu 20.04+ یا Debian 11+
- [ ] دسترسی Root/SSH
- [ ] پورت 22 (SSH) باز باشد
- [ ] امکان نصب Node.js وجود دارد
- [ ] دسترسی به MySQL خارجی (یا امکان نصب MySQL)

---

## 🚀 مراحل راه‌اندازی سرور

### 1. نصب سیستم عامل

```bash
# بعد از دریافت سرور، SSH کنید
ssh root@your-server-ip
```

### 2. به‌روزرسانی سیستم

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. نصب Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # بررسی
```

### 4. نصب PM2

```bash
sudo npm install -g pm2
```

### 5. نصب Nginx (اختیاری)

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

### 6. تنظیم Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📝 مثال: سرور پیشنهادی برای 5 مشتری

```
CPU: 4 Cores
RAM: 4 GB
Storage: 40 GB SSD
OS: Ubuntu 22.04 LTS
Bandwidth: 1 TB/Month
قیمت: ~$30-40/ماه یا ~1,200,000 تومان/ماه
```

**این سرور می‌تواند:**
- ✅ 5-10 مشتری را پشتیبانی کند
- ✅ تا 1000 کاربر همزمان
- ✅ ترافیک متوسط تا بالا

---

## ⚠️ نکات مهم

1. **SSD بهتر از HDD است** - سرعت بالاتر
2. **RAM مهم‌تر از CPU است** - برای Node.js
3. **Bandwidth نامحدود بهتر است** - برای ترافیک بالا
4. **Backup روزانه** - برای امنیت داده‌ها
5. **Monitoring** - برای بررسی وضعیت سرور

---

## 🔍 تست سرور قبل از خرید

می‌توانید از سرورهای تست رایگان استفاده کنید:

- **Oracle Cloud Free Tier:** 2 Core, 1GB RAM (همیشه رایگان)
- **Google Cloud Free Trial:** $300 اعتبار
- **AWS Free Tier:** 1 سال رایگان

---

## 📞 سوالات متداول

### سوال: آیا می‌توانم روی سرور اشتراکی (Shared Hosting) اجرا کنم؟

**پاسخ:** خیر. پروژه Next.js نیاز به Node.js دارد که معمولاً روی shared hosting در دسترس نیست. باید VPS یا Dedicated Server داشته باشید.

### سوال: آیا می‌توانم از سرور Windows استفاده کنم؟

**پاسخ:** بله، اما Linux توصیه می‌شود چون:
- مصرف منابع کمتر
- امنیت بیشتر
- پشتیبانی بهتر از Node.js

### سوال: حداقل سرور برای یک مشتری چقدر است؟

**پاسخ:** 
- **تست:** 1 Core, 1GB RAM (~$5/ماه)
- **Production:** 2 Core, 2GB RAM (~$12-20/ماه)

---

**موفق باشید! 🚀**





