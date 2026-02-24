# راهنمای نصب و استفاده از shadcn/ui

## ✅ چه کارهایی انجام شده:

1. ✅ فایل `components.json` برای تنظیمات shadcn/ui
2. ✅ فایل `lib/utils.ts` با تابع `cn` برای merge کردن کلاس‌های Tailwind
3. ✅ کامپوننت‌های UI پایه:
   - `components/ui/button.tsx`
   - `components/ui/input.tsx`
   - `components/ui/card.tsx`
   - `components/ui/label.tsx`
4. ✅ به‌روزرسانی `globals.css` با CSS variables برای shadcn/ui
5. ✅ بازنویسی صفحه لاگین با استفاده از کامپوننت‌های shadcn/ui
6. ✅ به‌روزرسانی `package.json` با dependencies لازم

## 📦 نصب Dependencies

برای نصب dependencies لازم، دستور زیر را اجرا کنید:

```bash
npm install
```

یا اگر قبلاً نصب کرده‌اید:

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
```

## 🎨 کامپوننت‌های موجود

### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="default">کلیک کنید</Button>
<Button variant="outline" size="lg">دکمه بزرگ</Button>
<Button variant="ghost" disabled>غیرفعال</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="متن را وارد کنید" />
<Input type="password" disabled />
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>عنوان</CardTitle>
    <CardDescription>توضیحات</CardDescription>
  </CardHeader>
  <CardContent>
    محتوا
  </CardContent>
</Card>
```

### Label
```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="input-id">برچسب</Label>
```

## ➕ اضافه کردن کامپوننت‌های بیشتر

برای اضافه کردن کامپوننت‌های بیشتر از shadcn/ui، می‌توانید از CLI استفاده کنید:

```bash
npx shadcn@latest add [component-name]
```

مثال:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
```

یا می‌توانید کامپوننت‌ها را به صورت دستی از [shadcn/ui website](https://ui.shadcn.com/docs/components) کپی کنید.

## 🎯 مزایای استفاده از shadcn/ui

1. **Copy-Paste Components**: کامپوننت‌ها در پروژه شما هستند، نه dependency
2. **قابل سفارشی‌سازی کامل**: می‌توانید هر کامپوننت را به دلخواه تغییر دهید
3. **سازگار با Tailwind**: از Tailwind CSS استفاده می‌کند
4. **RTL Support**: پشتیبانی از راست به چپ
5. **Accessible**: کامپوننت‌ها با استانداردهای accessibility ساخته شده‌اند
6. **TypeScript**: پشتیبانی کامل از TypeScript

## 🔧 سفارشی‌سازی

### تغییر رنگ‌ها
رنگ‌ها در `app/globals.css` در بخش `:root` تعریف شده‌اند. می‌توانید آن‌ها را تغییر دهید:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* رنگ اصلی */
  --secondary: 210 40% 96.1%; /* رنگ ثانویه */
  /* ... */
}
```

### تغییر اندازه border radius
```css
:root {
  --radius: 0.5rem; /* تغییر اندازه گوشه‌های گرد */
}
```

## 📝 مثال استفاده در صفحات دیگر

می‌توانید صفحات دیگر را هم با همین کامپوننت‌ها بازنویسی کنید:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>عنوان</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="متن" />
        <Button>ارسال</Button>
      </CardContent>
    </Card>
  );
}
```

## 🚀 نکات مهم

1. همیشه از `cn()` برای merge کردن کلاس‌های Tailwind استفاده کنید
2. کامپوننت‌ها را می‌توانید مستقیماً در `components/ui` ویرایش کنید
3. برای اضافه کردن کامپوننت جدید، از CLI استفاده کنید یا از سایت کپی کنید
4. تمام کامپوننت‌ها از `@/lib/utils` برای `cn` استفاده می‌کنند

## 📚 منابع

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Components List](https://ui.shadcn.com/docs/components)
- [Themes](https://ui.shadcn.com/themes)





