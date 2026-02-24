# راهنمای سریع راه‌اندازی

## مراحل راه‌اندازی

### 1. نصب پکیج‌ها
```bash
npm install
```

### 2. ایجاد دیتابیس MySQL
```sql
CREATE DATABASE otis_db;
```

### 3. ایجاد فایل `.env.local`
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=otis_db
JWT_SECRET=your-secret-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. راه‌اندازی جداول
```bash
npm run init-db
```

### 5. اضافه کردن عکس پس‌زمینه
یک فایل `background.jpg` در پوشه `public` قرار دهید.

### 6. اجرای پروژه
```bash
npm run dev
```

## تست سیستم

1. به آدرس `http://localhost:3000` بروید (به صورت خودکار به `/login` هدایت می‌شوید)
2. برای ثبت نام:
   - روی "ثبت نام کنید" کلیک کنید
   - نام کاربری و شماره تلفن وارد کنید
   - کد OTP را از کنسول سرور کپی کنید (در production از SMS ارسال می‌شود)
   - کد را در صفحه تایید وارد کنید
3. برای لاگین:
   - شماره تلفن را وارد کنید
   - کد OTP را وارد کنید
4. برای فراموشی رمز عبور:
   - شماره تلفن را وارد کنید
   - کد OTP را وارد کنید
   - رمز عبور جدید را تنظیم کنید

## نکات مهم

- کدهای OTP در حال حاضر در کنسول سرور نمایش داده می‌شوند
- برای production باید سرویس SMS اضافه شود
- JWT_SECRET را حتماً تغییر دهید
- دیتابیس باید قبل از استفاده راه‌اندازی شود









