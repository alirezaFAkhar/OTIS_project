# معماری Multi-Tenant - OTIS

این پروژه با معماری Multi-Tenant پیاده‌سازی شده است که امکان می‌دهد چندین مشتری روی یک سرور و دیتابیس مشترک کار کنند.

## ویژگی‌های Multi-Tenant

### 1. جداسازی داده‌ها
- هر tenant داده‌های مستقل خود را دارد
- تمام جداول دارای `tenant_id` هستند
- داده‌های هر tenant از طریق `tenant_id` فیلتر می‌شوند

### 2. کانفیگ‌های مستقل
- هر tenant می‌تواند کانفیگ‌های خاص خود را داشته باشد
- عکس پس‌زمینه و لوگو برای هر tenant قابل تنظیم است
- کانفیگ‌ها از طریق پنل ادمین قابل مدیریت هستند

### 3. تشخیص Tenant
- تشخیص از طریق **Subdomain** (مثال: `client1.example.com`)
- تشخیص از طریق **Domain** (مثال: `client1.com`)
- استفاده از **Header** برای توسعه (X-Tenant-ID)

### 4. پنل ادمین
- هر tenant یک پنل ادمین دارد
- امکان آپلود عکس پس‌زمینه و لوگو
- مدیریت کانفیگ‌های سفارشی

## ساختار دیتابیس

### جداول جدید:
- `tenants`: اطلاعات مشتری‌ها
- `tenant_configs`: کانفیگ‌های هر tenant
- `tenant_admins`: ادمین‌های هر tenant

### جداول به‌روزرسانی شده:
- `users`: اضافه شدن `tenant_id`
- `otp_codes`: اضافه شدن `tenant_id`

## راه‌اندازی

### 1. راه‌اندازی با Docker

```bash
# Build و اجرای containers
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف
docker-compose down
```

### 2. راه‌اندازی دستی

```bash
# نصب وابستگی‌ها
npm install

# تنظیم متغیرهای محیطی
cp .env.example .env.local

# راه‌اندازی دیتابیس
npm run init-db

# اجرای پروژه
npm run dev
```

## ایجاد Tenant جدید

برای ایجاد یک tenant جدید، از API زیر استفاده کنید:

```bash
POST /api/admin/tenants
Content-Type: application/json

{
  "name": "نام مشتری",
  "subdomain": "client1",
  "domain": "client1.com", // اختیاری
  "admin_username": "admin",
  "admin_password": "password123",
  "admin_email": "admin@example.com", // اختیاری
  "admin_phone": "09123456789" // اختیاری
}
```

## استفاده از Tenant

### در Development:
برای تست در محیط توسعه، می‌توانید از header استفاده کنید:

```bash
curl -H "X-Tenant-ID: 1" http://localhost:3000/api/auth/login
```

### در Production:
در production، از subdomain یا domain استفاده کنید:

- `client1.yourdomain.com` → Tenant با subdomain "client1"
- `client1.com` → Tenant با domain "client1.com"

## API Endpoints

### Tenant Management
- `GET /api/tenant/info` - دریافت اطلاعات tenant
- `GET /api/tenant/config?key=...` - دریافت کانفیگ
- `POST /api/tenant/config` - ذخیره کانفیگ
- `POST /api/tenant/upload` - آپلود فایل (background/logo)

### Admin
- `GET /api/admin/tenants` - لیست تمام tenant‌ها
- `POST /api/admin/tenants` - ایجاد tenant جدید

## پنل ادمین

هر tenant می‌تواند از پنل ادمین استفاده کند:

- آدرس: `/admin`
- نیاز به احراز هویت دارد
- امکان آپلود عکس پس‌زمینه و لوگو
- مدیریت کانفیگ‌ها

## فایل‌های مهم

- `lib/tenant.ts` - توابع کمکی برای کار با tenant
- `middleware.ts` - تشخیص tenant از درخواست
- `lib/db.ts` - ساختار دیتابیس multi-tenant
- `app/api/tenant/*` - API‌های مربوط به tenant
- `app/admin/page.tsx` - پنل ادمین

## نکات مهم

1. **امنیت**: تمام API‌ها باید tenant_id را بررسی کنند
2. **فایل‌ها**: فایل‌های هر tenant در `/public/uploads/tenant-{id}/` ذخیره می‌شوند
3. **Docker**: Volume برای فایل‌ها در `docker-compose.yml` تنظیم شده است
4. **Database**: تمام query‌ها باید شامل `tenant_id` باشند

## مثال استفاده

```typescript
// در API route
const tenantId = request.headers.get('x-tenant-id');

// در query
const [users] = await connection.query(
  'SELECT * FROM users WHERE tenant_id = ? AND username = ?',
  [tenantId, username]
);
```







