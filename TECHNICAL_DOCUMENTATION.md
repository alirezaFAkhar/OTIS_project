# مستند فنی پروژه OTIS

## 📋 فهرست مطالب

1. [معرفی پروژه](#معرفی-پروژه)
2. [معماری و سبک کدنویسی](#معماری-و-سبک-کدنویسی)
3. [نیازمندی‌های سرور](#نیازمندی‌های-سرور)
4. [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
5. [ساختار پروژه](#ساختار-پروژه)
6. [API Endpoints](#api-endpoints)
7. [تنظیمات محیطی](#تنظیمات-محیطی)
8. [Multi-Tenant Architecture](#multi-tenant-architecture)
9. [امنیت](#امنیت)
10. [Deployment با Docker](#deployment-با-docker)
11. [توسعه و نگهداری](#توسعه-و-نگهداری)

---

## معرفی پروژه

**OTIS** یک سیستم مدیریت انرژی و شارژ باتری است که با **Next.js 16** و **TypeScript** توسعه یافته است. این پروژه شامل:

- ✅ سیستم احراز هویت کامل با OTP
- ✅ مدیریت چند-مستاجری (Multi-Tenant)
- ✅ پنل مدیریت ادمین
- ✅ داشبورد کاربر
- ✅ سیستم پرداخت آنلاین (زرین‌پال)
- ✅ گزارش‌گیری و آمار
- ✅ مدیریت اطلاعات باتری و مصرف انرژی

### تکنولوژی‌های استفاده شده

- **Frontend Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Database**: MySQL 8.0+ یا Microsoft SQL Server
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## معماری و سبک کدنویسی

### معماری کلی

پروژه از معماری **Next.js App Router** استفاده می‌کند که شامل:

1. **Server Components**: برای رندر سمت سرور
2. **Client Components**: برای تعاملات سمت کلاینت (`'use client'`)
3. **API Routes**: برای endpointهای backend
4. **Middleware**: برای مدیریت tenant و authentication

### ساختار فولدرها

```
my-app/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Route Group برای پنل ادمین
│   │   ├── admin-dashboard/      # داشبورد ادمین
│   │   ├── admin-reports/        # گزارش‌های ادمین
│   │   ├── complexes/            # مدیریت مجتمع‌ها
│   │   ├── users/                # مدیریت کاربران
│   │   └── components/           # کامپوننت‌های ادمین
│   ├── (auth)/                   # Route Group برای احراز هویت
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-otp/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Route Group برای داشبورد کاربر
│   │   ├── dashboard/            # صفحه اصلی کاربر
│   │   ├── charge/               # صفحه شارژ
│   │   ├── reports/               # گزارش‌های کاربر
│   │   ├── change-password/      # تغییر رمز عبور
│   │   └── components/           # کامپوننت‌های داشبورد
│   ├── api/                      # API Routes
│   │   ├── admin/                # APIهای ادمین
│   │   ├── auth/                 # APIهای احراز هویت
│   │   ├── battery/              # APIهای اطلاعات باتری
│   │   ├── members/              # APIهای اعضا
│   │   ├── payment/               # APIهای پرداخت
│   │   ├── reports/              # APIهای گزارش
│   │   └── tenant/               # APIهای tenant
│   ├── assets/                   # Route برای فایل‌های استاتیک
│   ├── layout.tsx                # Root Layout
│   ├── page.tsx                  # صفحه اصلی (redirect به login)
│   └── globals.css               # استایل‌های全局
├── components/                   # کامپوننت‌های مشترک
│   ├── ui/                       # کامپوننت‌های shadcn/ui
│   ├── PaymentFilters.tsx
│   ├── PersianDatePicker.tsx
│   └── theme-provider.tsx
├── contexts/                     # React Contexts
│   └── BatteryContext.tsx        # Context برای اطلاعات باتری
├── lib/                          # کتابخانه‌های مشترک
│   ├── api.ts                    # توابع API کلاینت
│   ├── auth.ts                   # توابع احراز هویت
│   ├── db.ts                     # اتصال به دیتابیس
│   ├── payment.ts                # توابع پرداخت
│   ├── tenant.ts                 # توابع tenant
│   ├── tenant-middleware.ts      # Middleware برای tenant
│   └── utils.ts                  # توابع کمکی
├── scripts/                      # اسکریپت‌های کمکی
│   ├── init-db.ts                # راه‌اندازی دیتابیس
│   └── init-admin.ts             # ایجاد ادمین اولیه
├── public/                       # فایل‌های استاتیک
├── middleware.ts                 # Next.js Middleware
├── next.config.ts                # تنظیمات Next.js
├── tailwind.config.ts            # تنظیمات Tailwind
└── tsconfig.json                 # تنظیمات TypeScript
```

### سبک کدنویسی

1. **TypeScript**: تمام کدها با TypeScript نوشته شده‌اند
2. **RTL Support**: پشتیبانی کامل از راست‌به‌چپ برای فارسی
3. **Component Structure**: کامپوننت‌ها به صورت modular و reusable
4. **Error Handling**: مدیریت خطا در تمام API routes
5. **Validation**: استفاده از Zod برای validation
6. **Type Safety**: تعریف انواع برای تمام داده‌ها

---

## نیازمندی‌های سرور

### حداقل نیازمندی‌ها

#### برای Development:
- **Node.js**: 18.x یا بالاتر
- **npm**: 9.x یا بالاتر
- **RAM**: حداقل 4GB
- **Disk Space**: حداقل 2GB فضای خالی

#### برای Production:
- **Node.js**: 20.x یا بالاتر (توصیه می‌شود)
- **RAM**: حداقل 8GB (توصیه: 16GB)
- **CPU**: حداقل 2 Core (توصیه: 4 Core)
- **Disk Space**: حداقل 20GB SSD
- **Database**: MySQL 8.0+ یا SQL Server 2019+

### نیازمندی‌های دیتابیس

#### MySQL:
- نسخه: 8.0 یا بالاتر
- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Max Connections: حداقل 100

#### SQL Server:
- نسخه: 2019 یا بالاتر
- Collation: `SQL_Latin1_General_CP1_CI_AS` یا `Persian_100_CI_AS`
- Max Connections: حداقل 100

### نیازمندی‌های شبکه

- **Port 3000**: برای Next.js application (قابل تغییر)
- **Port 3306**: برای MySQL (در صورت استفاده)
- **Port 1433**: برای SQL Server (در صورت استفاده)
- **HTTPS**: برای production (توصیه می‌شود)

---

## نصب و راه‌اندازی

### مرحله 1: کلون کردن پروژه

```bash
git clone <repository-url>
cd my-app
```

### مرحله 2: نصب وابستگی‌ها

```bash
npm install
```

### مرحله 3: تنظیم متغیرهای محیطی

فایل `.env.local` را در ریشه پروژه ایجاد کنید:

#### برای MySQL:

```env
# Database Configuration
DB_CLIENT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=otis_db
DB_POOL_LIMIT=10

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Tenant Configuration
DEFAULT_TENANT_ID=1
TENANT_RESOLUTION_MODE=header
TENANT_SUBDOMAIN_MAP={"client1":1,"client2":2}
TENANT_DOMAIN_MAP={"client1.com":1,"client2.com":2}

# Members Table Configuration (Optional)
MEMBERS_TABLE=Members
MEMBERS_ID_COLUMN=Id
MEMBERS_USERNAME_COLUMN=Username
MEMBERS_PASSWORD_COLUMN=Password
MEMBERS_PHONE_COLUMN=PhoneNo
MEMBERS_ACTIVE_COLUMN=IsActive

# Payments Table Configuration (Optional)
PAYMENTS_TABLE=Payments
PAYMENTS_DATE_COLUMN=Date
PAYMENTS_AMOUNT_COLUMN=Amount
PAYMENTS_BALANCE_COLUMN=BalanceAfterCharge
PAYMENTS_MEMBER_ID_COLUMN=MemberId

# Payment Gateway (Zarinpal)
ZARINPAL_MERCHANT_ID=your_merchant_id
ZARINPAL_SANDBOX=true
```

#### برای SQL Server:

```env
# Database Configuration
DB_CLIENT=mssql
DB_SERVER=your-server.database.windows.net
DB_LOGIN_NAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Tenant Configuration
DEFAULT_TENANT_ID=1
TENANT_RESOLUTION_MODE=header

# ... (بقیه تنظیمات مشابه MySQL)
```

### مرحله 4: راه‌اندازی دیتابیس

```bash
npm run init-db
```

این دستور جداول زیر را ایجاد می‌کند:
- `tenants`: اطلاعات tenantها
- `tenant_configs`: تنظیمات هر tenant
- `tenant_admins`: ادمین‌های هر tenant
- `users`: کاربران
- `otp_codes`: کدهای OTP
- `transactions`: تراکنش‌های پرداخت

### مرحله 5: اضافه کردن فایل پس‌زمینه

یک فایل تصویر با نام `background.jpg` در پوشه `public` قرار دهید. این تصویر به عنوان پس‌زمینه صفحه لاگین استفاده می‌شود.

### مرحله 6: اجرای پروژه

#### Development Mode:

```bash
npm run dev
```

پروژه در آدرس `http://localhost:3000` در دسترس خواهد بود.

#### Production Build:

```bash
npm run build
npm start
```

---

## ساختار پروژه

### Route Groups

پروژه از **Route Groups** در Next.js استفاده می‌کند:

- `(admin)`: تمام routeهای مربوط به پنل ادمین
- `(auth)`: تمام routeهای مربوط به احراز هویت
- `(dashboard)`: تمام routeهای مربوط به داشبورد کاربر

### API Routes Structure

```
app/api/
├── admin/              # APIهای ادمین
│   ├── complexes/      # مدیریت مجتمع‌ها
│   ├── init/           # راه‌اندازی اولیه
│   ├── login/          # لاگین ادمین
│   ├── members/        # مدیریت اعضا
│   ├── payments/       # مدیریت پرداخت‌ها
│   ├── stats/          # آمار
│   ├── tenants/        # مدیریت tenantها
│   └── verify/         # بررسی اعتبار ادمین
├── auth/               # APIهای احراز هویت
│   ├── change-password/
│   ├── forgot-password/
│   ├── login/
│   ├── register/
│   ├── reset-password/
│   ├── verify/
│   └── verify-otp/
├── battery/            # APIهای اطلاعات باتری
│   └── data/
├── members/            # APIهای اعضا
│   └── login/
├── payment/            # APIهای پرداخت
│   ├── callback/       # Callback از درگاه
│   └── create/         # ایجاد تراکنش
├── reports/            # APIهای گزارش
│   └── payments/
└── tenant/             # APIهای tenant
    ├── config/
    ├── info/
    └── upload/
```

### Component Structure

کامپوننت‌ها به صورت modular و reusable طراحی شده‌اند:

- **UI Components**: در `components/ui/` (shadcn/ui)
- **Shared Components**: در `components/` (مثل PaymentFilters, PersianDatePicker)
- **Page-specific Components**: در همان فولدر صفحه (مثل `dashboard/components/`)

---

## API Endpoints

### Authentication APIs

#### POST `/api/auth/register`
ثبت نام کاربر جدید

**Request:**
```json
{
  "username": "user123",
  "phone": "09123456789"
}
```

**Response:**
```json
{
  "message": "کد تایید ارسال شد",
  "otp": "123456"
}
```

#### POST `/api/members/login`
ورود کاربر از جدول Members

**Request:**
```json
{
  "username": "member_user",
  "password": "secret"
}
```

**Response:**
```json
{
  "message": "ورود موفقیت‌آمیز",
  "user": {
    "id": 123,
    "username": "member_user",
    "phone": "09123456789"
  },
  "role": "user"
}
```

**نکته**: توکن به صورت httpOnly cookie ست می‌شود.

#### POST `/api/auth/verify-otp`
تایید کد OTP

**Request:**
```json
{
  "phone": "09123456789",
  "code": "123456"
}
```

#### POST `/api/auth/forgot-password`
درخواست بازیابی رمز عبور

**Request:**
```json
{
  "username": "user123",
  "phone": "09123456789"
}
```

#### POST `/api/auth/reset-password`
تغییر رمز عبور

**Request:**
```json
{
  "phone": "09123456789",
  "code": "123456",
  "password": "newpassword"
}
```

#### GET `/api/auth/verify`
بررسی اعتبار توکن

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 123,
    "username": "member_user",
    "phone": "09123456789"
  },
  "role": "user"
}
```

### Admin APIs

#### POST `/api/admin/login`
لاگین ادمین

**Request:**
```json
{
  "username": "admin",
  "password": "admin_password"
}
```

#### GET `/api/admin/stats`
دریافت آمار کلی

#### GET `/api/admin/payments`
دریافت لیست پرداخت‌ها

#### GET `/api/admin/payments/today`
دریافت پرداخت‌های امروز

#### GET `/api/admin/members`
دریافت لیست اعضا

#### GET `/api/admin/complexes`
دریافت لیست مجتمع‌ها

### Payment APIs

#### POST `/api/payment/create`
ایجاد تراکنش پرداخت

**Request:**
```json
{
  "amount": 100000,
  "bankId": "melat",
  "bankName": "بانک ملت",
  "description": "شارژ حساب"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": 123,
  "authority": "A00000000000000000000000000000000000",
  "paymentUrl": "https://www.zarinpal.com/pg/StartPay/..."
}
```

#### GET `/api/payment/callback`
Callback از درگاه پرداخت

**Query Parameters:**
- `Authority`: کد authority
- `Status`: وضعیت پرداخت (OK/NOK)

### Battery APIs

#### GET `/api/battery/data`
دریافت اطلاعات باتری کاربر

**Response:**
```json
{
  "lastChargeDate": "1403/09/15 - 14:30",
  "lastChargeAmount": 500000,
  "balanceAfterCharge": 2000000,
  "currentBalance": 360000,
  "maxCapacity": 2000000,
  "memberName": "علی احمدی",
  "memberPhone": "09123456789",
  "memberSerialNumber": "12345",
  "complexName": "مجتمع نمونه",
  "totalCharge": 5000000,
  "lastReadDate": "1403/09/20",
  "voltage": 220,
  "amper": 10,
  "isActive": true,
  "tariffs": [...]
}
```

### Reports APIs

#### GET `/api/reports/payments`
دریافت گزارش پرداخت‌ها

**Query Parameters:**
- `fromDate`: تاریخ شروع (YYYY-MM-DD)
- `toDate`: تاریخ پایان (YYYY-MM-DD)
- `page`: شماره صفحه
- `limit`: تعداد ردیف در هر صفحه

---

## تنظیمات محیطی

### متغیرهای ضروری

| متغیر | توضیح | مثال |
|------|-------|------|
| `DB_CLIENT` | نوع دیتابیس | `mysql` یا `mssql` |
| `DB_HOST` | آدرس دیتابیس (MySQL) | `localhost` |
| `DB_SERVER` | آدرس سرور (SQL Server) | `server.database.windows.net` |
| `DB_USER` | نام کاربری دیتابیس | `root` |
| `DB_PASSWORD` | رمز عبور دیتابیس | `password123` |
| `DB_NAME` | نام دیتابیس | `otis_db` |
| `JWT_SECRET` | کلید مخفی JWT | `your-secret-key` |
| `NEXT_PUBLIC_APP_URL` | URL اصلی برنامه | `http://localhost:3000` |

### متغیرهای اختیاری

| متغیر | توضیح | پیش‌فرض |
|------|-------|---------|
| `DEFAULT_TENANT_ID` | ID پیش‌فرض tenant | `1` |
| `TENANT_RESOLUTION_MODE` | روش تشخیص tenant | `header` |
| `TENANT_SUBDOMAIN_MAP` | نقشه subdomain به tenant ID | `{}` |
| `TENANT_DOMAIN_MAP` | نقشه domain به tenant ID | `{}` |
| `MEMBERS_TABLE` | نام جدول اعضا | `Members` |
| `MEMBERS_ID_COLUMN` | نام ستون ID | `Id` |
| `MEMBERS_USERNAME_COLUMN` | نام ستون username | `Username` |
| `MEMBERS_PASSWORD_COLUMN` | نام ستون password | `Password` |
| `MEMBERS_PHONE_COLUMN` | نام ستون phone | `PhoneNo` |
| `ZARINPAL_MERCHANT_ID` | Merchant ID زرین‌پال | - |
| `ZARINPAL_SANDBOX` | استفاده از sandbox | `true` |

---

## Multi-Tenant Architecture

پروژه از معماری **Multi-Tenant** پشتیبانی می‌کند که به چند روش قابل پیاده‌سازی است:

### روش 1: Header-based (پیش‌فرض)

در این روش، tenant ID از header `x-tenant-id` خوانده می‌شود یا از subdomain/domain تشخیص داده می‌شود.

**تنظیمات:**
```env
TENANT_RESOLUTION_MODE=header
DEFAULT_TENANT_ID=1
TENANT_SUBDOMAIN_MAP={"client1":1,"client2":2}
TENANT_DOMAIN_MAP={"client1.com":1,"client2.com":2}
```

### روش 2: Database-based

در این روش، tenant از جدول `tenants` خوانده می‌شود.

**تنظیمات:**
```env
TENANT_RESOLUTION_MODE=subdomain
# یا
TENANT_RESOLUTION_MODE=domain
```

### Middleware

`middleware.ts` به صورت خودکار tenant ID را از:
1. Header `x-tenant-id`
2. Subdomain (مثل `client1.example.com`)
3. Domain (مثل `client1.com`)
4. Default tenant ID

تشخیص می‌دهد و در header `x-tenant-id` قرار می‌دهد.

### جداول Multi-Tenant

تمام جداول دارای ستون `tenant_id` هستند:
- `users.tenant_id`
- `otp_codes.tenant_id`
- `transactions.tenant_id`
- `tenant_admins.tenant_id`

---

## امنیت

### Authentication

1. **JWT Tokens**: استفاده از JWT برای authentication
2. **httpOnly Cookies**: توکن‌ها در httpOnly cookie ذخیره می‌شوند
3. **Password Hashing**: استفاده از bcrypt با salt rounds 10
4. **Token Expiration**: توکن‌ها بعد از 7 روز منقضی می‌شوند

### Validation

- استفاده از **Zod** برای validation تمام inputها
- Sanitization داده‌های ورودی
- بررسی صحت tenant ID در تمام درخواست‌ها

### Database Security

- استفاده از **Prepared Statements** برای جلوگیری از SQL Injection
- Connection Pooling برای مدیریت اتصالات
- محدود کردن دسترسی دیتابیس به IPهای خاص

### Best Practices

1. **Environment Variables**: تمام اطلاعات حساس در `.env.local`
2. **HTTPS**: استفاده از HTTPS در production
3. **CORS**: تنظیم صحیح CORS
4. **Rate Limiting**: محدود کردن تعداد درخواست‌ها (TODO)

---

## Deployment با Docker

### استفاده از Docker Compose

1. فایل `docker-compose.yml` را ویرایش کنید:

```yaml
services:
  app:
    environment:
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=rootpassword
      - DB_NAME=otis_db
      - JWT_SECRET=your-secret-key
```

2. اجرای با Docker:

```bash
docker-compose up -d
```

### Build Docker Image

```bash
docker build -t otis-app .
docker run -p 3000:3000 --env-file .env.local otis-app
```

### تنظیمات Production

1. تغییر `NODE_ENV=production`
2. تنظیم `JWT_SECRET` قوی
3. استفاده از HTTPS
4. تنظیم Reverse Proxy (Nginx)
5. تنظیم SSL Certificate

---

## توسعه و نگهداری

### ساختار کد

- **TypeScript**: تمام کدها type-safe هستند
- **ESLint**: برای بررسی کیفیت کد
- **Modular Components**: کامپوننت‌ها قابل استفاده مجدد
- **Error Handling**: مدیریت خطا در تمام لایه‌ها

### افزودن Feature جدید

1. ایجاد route در `app/`
2. ایجاد API route در `app/api/`
3. ایجاد کامپوننت در `components/` یا فولدر صفحه
4. اضافه کردن validation با Zod
5. تست کردن feature

### Debugging

- استفاده از `console.log` برای debugging
- بررسی logs در production
- استفاده از Next.js DevTools

### Performance Optimization

- استفاده از Server Components
- Caching در API routes
- Image Optimization با Next.js Image
- Code Splitting خودکار

---

## نکات مهم

1. **SMS Service**: در حال حاضر OTP در console نمایش داده می‌شود. برای production باید سرویس SMS اضافه شود.

2. **Payment Gateway**: تنظیمات زرین‌پال باید در production تغییر کند.

3. **Database Backup**: باید backup منظم از دیتابیس گرفته شود.

4. **Monitoring**: استفاده از monitoring tools برای بررسی performance و errors.

5. **Logging**: پیاده‌سازی سیستم logging برای production.

---

## پشتیبانی

برای سوالات و مشکلات:
- بررسی مستندات
- بررسی Issues در repository
- تماس با تیم توسعه

---

**نسخه مستند**: 1.0.0  
**آخرین به‌روزرسانی**: 1403/09/20


