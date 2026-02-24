/**
 * Payment Gateway Helper Functions
 * Supports Zarinpal payment gateway
 */

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || '';
const ZARINPAL_SANDBOX = process.env.ZARINPAL_SANDBOX === 'true';
const ZARINPAL_BASE_URL = ZARINPAL_SANDBOX
  ? 'https://sandbox.zarinpal.com/pg/v4'
  : 'https://api.zarinpal.com/pg/v4';

export interface PaymentRequest {
  amount: number; // Amount in Toman (IRR / 10)
  description?: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
}

export interface PaymentResponse {
  success: boolean;
  authority?: string;
  code?: number;
  message?: string;
  errors?: any;
}

export interface VerifyRequest {
  amount: number;
  authority: string;
}

export interface VerifyResponse {
  success: boolean;
  code?: number;
  message?: string;
  refId?: string;
  errors?: any;
}

/**
 * Request payment from Zarinpal gateway
 */
export async function requestPayment(
  data: PaymentRequest
): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${ZARINPAL_BASE_URL}/payment/request.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: data.amount,
        description: data.description || 'شارژ حساب',
        callback_url: data.callbackUrl,
        mobile: data.mobile,
        email: data.email,
      }),
    });

    const result = await response.json();

    if (result.data && result.data.code === 100) {
      return {
        success: true,
        authority: result.data.authority,
        code: result.data.code,
        message: 'درخواست پرداخت با موفقیت ایجاد شد',
      };
    }

    return {
      success: false,
      code: result.data?.code || result.errors?.code,
      message: result.data?.message || result.errors?.message || 'خطا در ایجاد درخواست پرداخت',
      errors: result.errors,
    };
  } catch (error: any) {
    console.error('Payment request error:', error);
    return {
      success: false,
      message: 'خطا در ارتباط با درگاه پرداخت',
      errors: { error: error.message },
    };
  }
}

/**
 * Verify payment with Zarinpal gateway
 */
export async function verifyPayment(
  data: VerifyRequest
): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${ZARINPAL_BASE_URL}/payment/verify.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount: data.amount,
        authority: data.authority,
      }),
    });

    const result = await response.json();

    if (result.data && result.data.code === 100) {
      return {
        success: true,
        code: result.data.code,
        refId: result.data.ref_id,
        message: 'پرداخت با موفقیت انجام شد',
      };
    }

    return {
      success: false,
      code: result.data?.code || result.errors?.code,
      message: result.data?.message || result.errors?.message || 'خطا در تایید پرداخت',
      errors: result.errors,
    };
  } catch (error: any) {
    console.error('Payment verify error:', error);
    return {
      success: false,
      message: 'خطا در ارتباط با درگاه پرداخت',
      errors: { error: error.message },
    };
  }
}

/**
 * Get payment gateway URL for redirect
 */
export function getPaymentUrl(authority: string): string {
  const baseUrl = ZARINPAL_SANDBOX
    ? 'https://sandbox.zarinpal.com/pg/StartPay'
    : 'https://www.zarinpal.com/pg/StartPay';
  return `${baseUrl}/${authority}`;
}

