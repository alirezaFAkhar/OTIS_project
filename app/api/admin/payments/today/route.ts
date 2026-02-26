import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { getPaymentColumns } from '@/app/api/reports/payments/utils/columnHelpers';
import { getDbClient, buildDateColumn, formatDateForMySQL } from '@/app/api/reports/payments/utils/queryBuilder';
import { translatePayType } from '@/app/api/reports/payments/utils/payTypeTranslator';
import sql from 'mssql';
import pool from '@/lib/db';

/**
 * GET /api/admin/payments/today
 * Get today's payments for admin dashboard
 */
export async function GET(request: NextRequest) {
  let connection: any = null;

  try {
    // Authentication - verify admin
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Tenant validation
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get column names
    const columns = getPaymentColumns();
    const dbClient = getDbClient();

    // Build date column expression
    const dateColumn = buildDateColumn(
      dbClient,
      columns.paymentsPayDateColumn,
      columns.paymentsAddDateColumn
    );

    let payments: any[] = [];

    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }

        const dataQuery = `
          SELECT 
            Id,
            ${columns.paymentsMemberIdColumn} as MemberId,
            ${columns.paymentsPayDateColumn} as PayDate,
            ${columns.paymentsAddDateColumn} as AddDate,
            ${columns.paymentsPayTypeColumn} as PayType,
            ${columns.paymentsTrackingNumberColumn} as TrackingNumber,
            ${columns.paymentsAmountColumn} as Amount,
            ${columns.paymentsCreditColumn} as Credit,
            ${columns.paymentsStatusColumn} as Status
          FROM ${columns.paymentsTable}
          WHERE ${dateColumn} >= @todayStart AND ${dateColumn} <= @todayEnd
          ORDER BY ${dateColumn} DESC
        `;

        const dataRequest = pool
          .request()
          .input('todayStart', sql.DateTime, today)
          .input('todayEnd', sql.DateTime, todayEnd);

        const dataResult = await dataRequest.query(dataQuery);
        payments = dataResult.recordset.map((payment: any) => ({
          ...payment,
          PayType: translatePayType(payment.PayType),
        }));
      } catch (connError: any) {
        console.error('MSSQL connection error:', connError);
        return NextResponse.json(
          { error: 'خطا در اتصال به دیتابیس' },
          { status: 503 }
        );
      }
    } else {
      // MySQL
      try {
        connection = await pool.getConnection();

        const dataQuery = `
          SELECT 
            Id,
            ${columns.paymentsMemberIdColumn} as MemberId,
            ${columns.paymentsPayDateColumn} as PayDate,
            ${columns.paymentsAddDateColumn} as AddDate,
            ${columns.paymentsPayTypeColumn} as PayType,
            ${columns.paymentsTrackingNumberColumn} as TrackingNumber,
            ${columns.paymentsAmountColumn} as Amount,
            ${columns.paymentsCreditColumn} as Credit,
            ${columns.paymentsStatusColumn} as Status
          FROM ${columns.paymentsTable}
          WHERE ${dateColumn} >= ? AND ${dateColumn} <= ?
          ORDER BY ${dateColumn} DESC
        `;

        const dataParams = [
          formatDateForMySQL(today.toISOString().split('T')[0], false),
          formatDateForMySQL(today.toISOString().split('T')[0], true),
        ];
        const [dataResult] = (await connection.query(dataQuery, dataParams)) as any[];

        payments = dataResult.map((payment: any) => ({
          ...payment,
          PayType: translatePayType(payment.PayType),
        }));
      } catch (connError: any) {
        console.error('MySQL connection error:', connError);
        return NextResponse.json(
          { error: 'خطا در اتصال به دیتابیس' },
          { status: 503 }
        );
      } finally {
        if (connection && typeof connection.release === 'function') {
          connection.release();
        }
      }
    }

    return NextResponse.json({
      payments,
    });
  } catch (error: any) {
    console.error('Error fetching today payments:', error);
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
    return NextResponse.json(
      { error: 'خطا در دریافت داده‌ها' },
      { status: 500 }
    );
  }
}




