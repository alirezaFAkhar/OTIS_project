# راهنمای Dark Mode و Theme

## ✅ چه کارهایی انجام شده:

1. ✅ ایجاد `ThemeProvider` برای مدیریت تم
2. ✅ پشتیبانی از تم سیستم (system theme)
3. ✅ ذخیره تم در localStorage
4. ✅ به‌روزرسانی `globals.css` برای dark mode
5. ✅ اضافه کردن transition برای تغییرات نرم

## 🎨 نحوه کار

### تم سیستم (System Theme)
به صورت پیش‌فرض، برنامه از تم سیستم کاربر استفاده می‌کند:
- اگر سیستم کاربر dark mode باشد → برنامه dark می‌شود
- اگر سیستم کاربر light mode باشد → برنامه light می‌شود

### تغییر تم به صورت دستی
می‌توانید یک دکمه toggle برای تغییر تم اضافه کنید:

```tsx
'use client';

import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      variant="outline"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </Button>
  );
}
```

## 🎯 استفاده در کامپوننت‌ها

### استفاده از رنگ‌های Theme
تمام کامپوننت‌های shadcn/ui به صورت خودکار از تم استفاده می‌کنند:

```tsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// این کامپوننت‌ها به صورت خودکار با تم تغییر می‌کنند
<Card>
  <Button>کلیک کنید</Button>
</Card>
```

### استفاده از کلاس‌های Dark Mode
می‌توانید از کلاس‌های `dark:` برای استایل‌های خاص استفاده کنید:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  متن که در dark mode سفید می‌شود
</div>
```

## 🔧 سفارشی‌سازی رنگ‌ها

رنگ‌ها در `app/globals.css` تعریف شده‌اند:

```css
@theme {
  /* Light mode colors */
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);
  /* ... */
}

.dark {
  /* Dark mode colors */
  --color-background: hsl(222.2 84% 4.9%);
  --color-foreground: hsl(210 40% 98%);
  /* ... */
}
```

## 📝 مثال: اضافه کردن Theme Toggle به صفحه لاگین

```tsx
'use client';

import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      {/* Theme Toggle Button */}
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          variant="ghost"
          size="icon"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </Button>
      </div>
      
      {/* Rest of your login form */}
    </div>
  );
}
```

## 🎨 رنگ‌های موجود

تمام رنگ‌های زیر به صورت خودکار با تم تغییر می‌کنند:

- `background` - پس‌زمینه اصلی
- `foreground` - متن اصلی
- `card` - پس‌زمینه کارت
- `card-foreground` - متن کارت
- `primary` - رنگ اصلی
- `primary-foreground` - متن روی رنگ اصلی
- `secondary` - رنگ ثانویه
- `muted` - رنگ muted
- `accent` - رنگ accent
- `destructive` - رنگ خطا
- `border` - رنگ border
- `input` - رنگ border input
- `ring` - رنگ focus ring

## 💡 نکات مهم

1. **تم سیستم**: به صورت پیش‌فرض از تم سیستم استفاده می‌شود
2. **ذخیره خودکار**: تم انتخاب شده در localStorage ذخیره می‌شود
3. **Transition نرم**: تغییرات تم با transition نرم انجام می‌شود
4. **سازگاری**: تمام کامپوننت‌های shadcn/ui به صورت خودکار از تم استفاده می‌کنند

## 🚀 تست

برای تست dark mode:
1. تنظیمات سیستم خود را به dark mode تغییر دهید
2. صفحه را refresh کنید
3. باید برنامه به صورت خودکار dark شود

یا می‌توانید یک دکمه toggle اضافه کنید و به صورت دستی تم را تغییر دهید.





