# Payment API Documentation

API برای مدیریت پرداخت‌ها و اتصال به درگاه پرداخت زرین‌پال

## Endpoints

### POST /api/payment/create

ایجاد تراکنش جدید و دریافت لینک پرداخت از درگاه

**Authentication:** Required (JWT Token in Cookie)

**Request Body:**
```json
{
  "amount": 100000,
  "bankId": "melat",
  "bankName": "بانک ملت",
  "description": "شارژ حساب" // Optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": 123,
  "authority": "A00000000000000000000000000000000000",
  "paymentUrl": "https://www.zarinpal.com/pg/StartPay/A00000000000000000000000000000000000",
  "message": "درخواست پرداخت با موفقیت ایجاد شد"
}
```

**Response (Error):**
```json
{
  "error": "خطا در ایجاد درخواست پرداخت",
  "code": 9
}
```

### GET /api/payment/callback

Callback از درگاه پرداخت (این endpoint توسط درگاه فراخوانی می‌شود)

**Query Parameters:**
- `Authority`: کد authority از درگاه
- `Status`: وضعیت پرداخت (OK/NOK)

**Response:**
Redirect به صفحه `/charge` با query parameters:
- `success=true&transactionId=123&refId=123456789` (موفق)
- `error=payment_cancelled` (لغو شده)
- `error=payment_failed&message=...` (ناموفق)

## Environment Variables

```env
# Zarinpal Configuration
ZARINPAL_MERCHANT_ID=your_merchant_id
ZARINPAL_SANDBOX=true  # برای تست از sandbox استفاده کنید
NEXT_PUBLIC_APP_URL=http://localhost:3000  # URL اصلی برای callback
```

## Database Schema

جدول `transactions` به صورت خودکار در `initDatabase` ایجاد می‌شود:

```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  bank_id VARCHAR(50),
  bank_name VARCHAR(255),
  status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
  authority VARCHAR(255),
  ref_id VARCHAR(255),
  gateway_response TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Usage Example

```typescript
// در کامپوننت React
const handleCharge = async () => {
  const response = await fetch('/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      amount: 100000,
      bankId: 'melat',
      bankName: 'بانک ملت',
    }),
  });

  const data = await response.json();
  if (data.success) {
    window.location.href = data.paymentUrl;
  }
};
```

## نکات مهم

1. **Multi-Tenant Support**: تمام تراکنش‌ها با `tenant_id` ذخیره می‌شوند
2. **User Authentication**: کاربر باید لاگین باشد (JWT token در cookie)
3. **Payment Gateway**: از زرین‌پال استفاده می‌شود
4. **Callback URL**: باید در تنظیمات زرین‌پال ثبت شود
5. **Balance Update**: بعد از موفقیت پرداخت، باید موجودی کاربر به‌روزرسانی شود (TODO در callback)


