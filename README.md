# سیستم احراز هویت OTIS

یک سیستم کامل احراز هویت با Next.js، دیتابیس (MySQL یا SQL Server) و OTP

## ویژگی‌ها

- ✅ صفحه لاگین زیبا با پس‌زمینه عکس
- ✅ صفحه ثبت نام با دریافت نام کاربری و شماره تلفن
- ✅ ارسال کد OTP برای تایید
- ✅ صفحه تایید OTP
- ✅ صفحه فراموشی رمز عبور
- ✅ امنیت با JWT و bcrypt
- ✅ رابط کاربری مدرن و ریسپانسیو

## پیش‌نیازها

- Node.js 18+ 
- MySQL 8.0+ یا Microsoft SQL Server
- npm یا yarn

## نصب و راه‌اندازی

### 1. نصب وابستگی‌ها

```bash
npm install
```

### 2. تنظیم دیتابیس

یک دیتابیس MySQL ایجاد کنید:

```sql
CREATE DATABASE otis_db;
```

### 3. تنظیم متغیرهای محیطی

فایل `.env.local` را در ریشه پروژه ایجاد کنید:

```env
DB_CLIENT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=otis_db
JWT_SECRET=your-secret-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

یا برای SQL Server:

```env
DB_CLIENT=mssql
DB_SERVER=mssql.lifelink.ir
DB_LOGIN_NAME=lifelink
DB_PASSWORD=your_password
DB_DATABASE=lifelink
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
JWT_SECRET=your-secret-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. راه‌اندازی جداول دیتابیس

```bash
npm run init-db
```

### 5. اضافه کردن عکس پس‌زمینه

یک فایل تصویر با نام `background.jpg` در پوشه `public` قرار دهید. این عکس به عنوان پس‌زمینه صفحه لاگین استفاده می‌شود.

### 6. اجرای پروژه

```bash
npm run dev
```

پروژه در آدرس [http://localhost:3000](http://localhost:3000) در دسترس خواهد بود.

## ساختار پروژه

```
my-app/
├── app/
│   ├── api/
│   │   └── auth/          # API routes برای احراز هویت
│   ├── login/              # صفحه لاگین
│   ├── register/           # صفحه ثبت نام
│   ├── verify-otp/         # صفحه تایید OTP
│   ├── forgot-password/    # صفحه فراموشی رمز عبور
│   └── dashboard/          # صفحه داشبورد
├── lib/
│   ├── db.ts               # اتصال به دیتابیس
│   ├── auth.ts             # توابع احراز هویت
│   └── api.ts              # توابع API کلاینت
└── scripts/
    └── init-db.ts          # اسکریپت راه‌اندازی دیتابیس
```

## API Endpoints

### POST /api/auth/register
ثبت نام کاربر جدید
```json
{
  "username": "user123",
  "phone": "09123456789"
}
```

### POST /api/auth/login
ورود کاربر
```json
{
  "phone": "09123456789"
}
```

### POST /api/members/login
ورود کاربر از جدول `Members`
```json
{
  "username": "member_user",
  "password": "secret"
}
```
**نکته**: توکن به صورت httpOnly cookie ست می‌شود و در response body برنمی‌گردد.

### GET /api/auth/verify
بررسی اعتبار توکن (از httpOnly cookie خوانده می‌شود)
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  --cookie "token=YOUR_TOKEN"
```

**Response موفق:**
```json
{
  "valid": true,
  "user": {
    "id": 123,
    "username": "member_user",
    "phone": "09123456789"
  }
}
```

**Response نامعتبر:**
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

### POST /api/auth/verify-otp
تایید کد OTP
```json
{
  "phone": "09123456789",
  "code": "123456"
}
```

### POST /api/auth/forgot-password
درخواست بازیابی رمز عبور
```json
{
  "phone": "09123456789"
}
```

### POST /api/auth/reset-password
تغییر رمز عبور
```json
{
  "phone": "09123456789",
  "code": "123456",
  "password": "newpassword"
}
```

## نکات مهم

1. **ارسال SMS**: در حال حاضر کد OTP در کنسول نمایش داده می‌شود. برای استفاده در production، باید یک سرویس SMS (مثل کاوه نگار، پیامک، ...) را اضافه کنید.

2. **امنیت**: حتماً `JWT_SECRET` را در production تغییر دهید.

3. **دیتابیس**: مطمئن شوید که اطلاعات اتصال به دیتابیس در `.env.local` صحیح است.

4. **توکن httpOnly**: توکن به صورت httpOnly cookie ست می‌شود و به صورت خودکار با درخواست‌های فرانت ارسال می‌شود. برای بررسی اعتبار توکن از `GET /api/auth/verify` استفاده کنید:
```typescript
import { verifyToken } from '@/lib/api';

// بررسی اعتبار توکن
const result = await verifyToken();
if (result.valid) {
  console.log('User:', result.user);
} else {
  console.error('Token invalid:', result.error);
}
```

4. **Members Login**: اگر نام جدول یا ستون‌های جدول اعضا متفاوت است، می‌توانید با env آن‌ها را تنظیم کنید:
```env
MEMBERS_TABLE=Members
MEMBERS_ID_COLUMN=Id
MEMBERS_USERNAME_COLUMN=Username
MEMBERS_PASSWORD_COLUMN=Password
MEMBERS_PHONE_COLUMN=PhoneNo
MEMBERS_ACTIVE_COLUMN=IsActive
```

5. **Multi-domain tenant resolution (بدون جدول tenants)**:
```env
TENANT_RESOLUTION_MODE=header
DEFAULT_TENANT_ID=1
TENANT_SUBDOMAIN_MAP={"client1":1,"client2":2}
TENANT_DOMAIN_MAP={"client1.com":1,"client2.com":2}
```
در این حالت، tenant به صورت خودکار از دامنه/ساب‌دامنه در middleware تشخیص داده می‌شود و کاربر نیازی به وارد کردن tenant id ندارد.

## توسعه

برای توسعه بیشتر می‌توانید:
- سرویس SMS را اضافه کنید
- صفحه داشبورد را کامل‌تر کنید
- مدیریت پروفایل کاربر را اضافه کنید
- سیستم لاگ و مانیتورینگ اضافه کنید

## مجوز

این پروژه برای استفاده شخصی و تجاری آزاد است.
