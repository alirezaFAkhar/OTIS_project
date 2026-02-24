import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { getPaymentColumns } from './utils/columnHelpers';
import { getDbClient, buildDateColumn, buildWhereClause } from './utils/queryBuilder';
import { getPaymentsCountMSSQL, getPaymentsMSSQL } from './utils/mssqlQueries';
import { getPaymentsCountMySQL, getPaymentsMySQL } from './utils/mysqlQueries';

/**
 * GET /api/reports/payments
 * Fetch paginated payment records for the authenticated user
 */
export async function GET(request: NextRequest) {
  let connection: any = null;

  try {
    // Authentication
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

    const memberId = payload.userId;

    // Tenant validation
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get column names
    const columns = getPaymentColumns();
    const dbClient = getDbClient();

    // Build date column expression
    const dateColumn = buildDateColumn(
      dbClient,
      columns.paymentsPayDateColumn,
      columns.paymentsAddDateColumn
    );

    // Build WHERE clause
    const { whereClause, queryParams } = buildWhereClause(
      dbClient,
      columns.paymentsMemberIdColumn,
      memberId,
      dateColumn,
      fromDate,
      toDate
    );

    // Execute queries based on database type
    let payments: any[] = [];
    let totalCount = 0;

    if (dbClient === 'mssql') {
      try {
        totalCount = await getPaymentsCountMSSQL(
          columns.paymentsTable,
          whereClause,
          memberId,
          fromDate,
          toDate
        );

        payments = await getPaymentsMSSQL(
          columns,
          dateColumn,
          whereClause,
          memberId,
          fromDate,
          toDate,
          offset,
          limit
        );
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
        totalCount = await getPaymentsCountMySQL(
          columns.paymentsTable,
          whereClause,
          queryParams
        );

        payments = await getPaymentsMySQL(
          columns,
          dateColumn,
          whereClause,
          queryParams,
          limit,
          offset
        );
      } catch (connError: any) {
        console.error('MySQL connection error:', connError);
        if (connection && typeof connection.release === 'function') {
          connection.release();
        }
        return NextResponse.json(
          { error: 'خطا در اتصال به دیتابیس' },
          { status: 503 }
        );
      }
    }

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
    return NextResponse.json(
      { error: 'خطا در دریافت داده‌ها' },
      { status: 500 }
    );
  }
}
