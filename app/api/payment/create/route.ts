import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { requestPayment, getPaymentUrl } from '@/lib/payment';
import pool from '@/lib/db';
import sql from 'mssql';
import { z } from 'zod';

const createPaymentSchema = z.object({
  amount: z.number().min(1000, 'حداقل مبلغ ۱۰۰۰ تومان است'),
  bankId: z.string().min(1, 'انتخاب بانک الزامی است'),
  bankName: z.string().min(1, 'نام بانک الزامی است'),
  description: z.string().optional(),
});

/**
 * POST /api/payment/create
 * Create a new payment transaction and redirect to payment gateway
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'توکن نامعتبر یا منقضی شده است' },
        { status: 401 }
      );
    }

    // Get tenant info
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const tenantId = tenantInfo.tenantId;
    const userId = payload.userId;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Get database client type
    const dbClient = (process.env.DB_CLIENT || 'mysql').toLowerCase();
    let connection: any = null;
    let transactionId: number;
    let userPhone = '';

    try {
      // Create transaction record
      if (dbClient === 'mssql') {
        // MSSQL
        if (!pool.connected) {
          await pool.connect();
        }
        
        const insertResult = await pool.request()
          .input('tenant_id', sql.Int, tenantId)
          .input('user_id', sql.Int, userId)
          .input('amount', sql.Decimal(15, 2), validatedData.amount)
          .input('bank_id', sql.NVarChar(50), validatedData.bankId)
          .input('bank_name', sql.NVarChar(255), validatedData.bankName)
          .input('description', sql.NVarChar(sql.MAX), validatedData.description || 'شارژ حساب')
          .query(`
            INSERT INTO transactions 
            (tenant_id, user_id, amount, bank_id, bank_name, status, description) 
            OUTPUT INSERTED.id
            VALUES (@tenant_id, @user_id, @amount, @bank_id, @bank_name, 'pending', @description)
          `);
        
        transactionId = insertResult.recordset[0].id;

        // Get user info for payment gateway
        const userResult = await pool.request()
          .input('user_id', sql.Int, userId)
          .input('tenant_id', sql.Int, tenantId)
          .query('SELECT phone FROM users WHERE id = @user_id AND tenant_id = @tenant_id');
        
        userPhone = userResult.recordset[0]?.phone || '';
      } else {
        // MySQL
        connection = await pool.getConnection();
        
        const [result] = await connection.query(
          `INSERT INTO transactions 
          (tenant_id, user_id, amount, bank_id, bank_name, status, description) 
          VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
          [
            tenantId,
            userId,
            validatedData.amount,
            validatedData.bankId,
            validatedData.bankName,
            validatedData.description || 'شارژ حساب',
          ]
        ) as any[];

        transactionId = result.insertId;

        // Get user info for payment gateway
        const [users] = await connection.query(
          'SELECT phone FROM users WHERE id = ? AND tenant_id = ?',
          [userId, tenantId]
        ) as any[];

        userPhone = users[0]?.phone || '';
      }

      // Get callback URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';
      const callbackUrl = `${baseUrl}/api/payment/callback`;

      // Request payment from gateway
      const paymentResponse = await requestPayment({
        amount: validatedData.amount,
        description: validatedData.description || `شارژ حساب - تراکنش ${transactionId}`,
        callbackUrl,
        mobile: userPhone,
      });

      if (!paymentResponse.success || !paymentResponse.authority) {
        // Update transaction status to failed
        if (dbClient === 'mssql') {
          await pool.request()
            .input('id', sql.Int, transactionId)
            .input('gateway_response', sql.NVarChar(sql.MAX), JSON.stringify(paymentResponse))
            .query('UPDATE transactions SET status = \'failed\', gateway_response = @gateway_response WHERE id = @id');
        } else {
          await connection.query(
            'UPDATE transactions SET status = ?, gateway_response = ? WHERE id = ?',
            ['failed', JSON.stringify(paymentResponse), transactionId]
          );
          connection.release();
        }

        return NextResponse.json(
          {
            error: paymentResponse.message || 'خطا در ایجاد درخواست پرداخت',
            code: paymentResponse.code,
          },
          { status: 400 }
        );
      }

      // Update transaction with authority
      if (dbClient === 'mssql') {
        await pool.request()
          .input('id', sql.Int, transactionId)
          .input('authority', sql.NVarChar(255), paymentResponse.authority)
          .query('UPDATE transactions SET authority = @authority WHERE id = @id');
      } else {
        await connection.query(
          'UPDATE transactions SET authority = ? WHERE id = ?',
          [paymentResponse.authority, transactionId]
        );
        connection.release();
      }

      // Return payment URL and transaction info
      return NextResponse.json({
        success: true,
        transactionId,
        authority: paymentResponse.authority,
        paymentUrl: getPaymentUrl(paymentResponse.authority),
        message: 'درخواست پرداخت با موفقیت ایجاد شد',
      });
    } catch (dbError: any) {
      if (connection && typeof connection.release === 'function') {
        connection.release();
      }
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'خطا در ذخیره تراکنش' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Payment creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'داده‌های ورودی نامعتبر است',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در ایجاد تراکنش پرداخت' },
      { status: 500 }
    );
  }
}

