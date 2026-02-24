import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { getPaymentColumns } from '@/app/api/reports/payments/utils/columnHelpers';
import { getDbClient, buildDateColumn, formatDateForMySQL } from '@/app/api/reports/payments/utils/queryBuilder';
import { getPaymentsCountMSSQL, getPaymentsMSSQL } from '@/app/api/reports/payments/utils/mssqlQueries';
import { getPaymentsCountMySQL, getPaymentsMySQL } from '@/app/api/reports/payments/utils/mysqlQueries';
import { translatePayType } from '@/app/api/reports/payments/utils/payTypeTranslator';
import sql from 'mssql';
import pool from '@/lib/db';

/**
 * GET /api/admin/payments
 * Fetch all payment records for admin (no memberId filter)
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

    // Check if user is admin (you may need to verify this from database)
    // For now, we'll assume the token verification is enough

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
    const trackingNumberFilter = searchParams.get('trackingNumber') || '';
    const statusFilter = searchParams.get('status') || '';
    const complexIdFilter = searchParams.get('complexId');

    // Get column names
    const columns = getPaymentColumns();
    const dbClient = getDbClient();

    // Build date column expression
    const dateColumn = buildDateColumn(
      dbClient,
      columns.paymentsPayDateColumn,
      columns.paymentsAddDateColumn
    );

    // Build WHERE clause for admin (no memberId filter, but may have complexId filter)
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    
    // Date filters
    if (fromDate) {
      if (dbClient === 'mssql') {
        whereConditions.push(`(${dateColumn} >= @fromDate)`);
      } else {
        whereConditions.push(`(${dateColumn} >= ?)`);
        queryParams.push(formatDateForMySQL(fromDate, false));
      }
    }

    if (toDate) {
      if (dbClient === 'mssql') {
        whereConditions.push(`(${dateColumn} <= @toDate)`);
      } else {
        whereConditions.push(`(${dateColumn} <= ?)`);
        queryParams.push(formatDateForMySQL(toDate, true));
      }
    }

    // Tracking number filter
    if (trackingNumberFilter) {
      if (dbClient === 'mssql') {
        whereConditions.push(`${columns.paymentsTrackingNumberColumn} LIKE @trackingNumber`);
      } else {
        whereConditions.push(`${columns.paymentsTrackingNumberColumn} LIKE ?`);
        queryParams.push(`%${trackingNumberFilter}%`);
      }
    }

    // Status filter
    if (statusFilter) {
      if (dbClient === 'mssql') {
        whereConditions.push(`${columns.paymentsStatusColumn} = @status`);
      } else {
        whereConditions.push(`${columns.paymentsStatusColumn} = ?`);
        queryParams.push(statusFilter);
      }
    }
    
    // ComplexId filter - directly from Payments table
    if (complexIdFilter) {
      if (dbClient === 'mssql') {
        whereConditions.push(`${columns.paymentsComplexIdColumn} = @complexId`);
      } else {
        whereConditions.push(`${columns.paymentsComplexIdColumn} = ?`);
        queryParams.push(parseInt(complexIdFilter));
      }
    }

    const whereClause =
      whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';

    // Execute queries based on database type
    let payments: any[] = [];
    let totalCount = 0;

    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }

        // Count query
        const countQuery = `SELECT COUNT(*) as total FROM ${columns.paymentsTable} WHERE ${whereClause}`;
        const countRequest = pool.request();

        if (fromDate) {
          const fromDateObj = new Date(fromDate);
          fromDateObj.setHours(0, 0, 0, 0);
          countRequest.input('fromDate', sql.DateTime, fromDateObj);
        }

        if (toDate) {
          const toDateObj = new Date(toDate);
          toDateObj.setHours(23, 59, 59, 999);
          countRequest.input('toDate', sql.DateTime, toDateObj);
        }

        if (trackingNumberFilter) {
          countRequest.input('trackingNumber', sql.NVarChar, `%${trackingNumberFilter}%`);
        }

        if (statusFilter) {
          countRequest.input('status', sql.NVarChar, statusFilter);
        }
        
        if (complexIdFilter) {
          countRequest.input('complexId', sql.Int, parseInt(complexIdFilter));
        }

        const countResult = await countRequest.query(countQuery);
        totalCount = countResult.recordset[0]?.total || 0;

        // Data query
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
          WHERE ${whereClause}
          ORDER BY ${dateColumn} DESC
          OFFSET @offset ROWS
          FETCH NEXT @limit ROWS ONLY
        `;

        const dataRequest = pool
          .request()
          .input('offset', sql.Int, offset)
          .input('limit', sql.Int, limit);

        if (fromDate) {
          const fromDateObj = new Date(fromDate);
          fromDateObj.setHours(0, 0, 0, 0);
          dataRequest.input('fromDate', sql.DateTime, fromDateObj);
        }

        if (toDate) {
          const toDateObj = new Date(toDate);
          toDateObj.setHours(23, 59, 59, 999);
          dataRequest.input('toDate', sql.DateTime, toDateObj);
        }

        if (trackingNumberFilter) {
          dataRequest.input('trackingNumber', sql.NVarChar, `%${trackingNumberFilter}%`);
        }

        if (statusFilter) {
          dataRequest.input('status', sql.NVarChar, statusFilter);
        }
        
        if (complexIdFilter) {
          dataRequest.input('complexId', sql.Int, parseInt(complexIdFilter));
        }

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

        // Count query
        const countQuery = `SELECT COUNT(*) as total FROM ${columns.paymentsTable} WHERE ${whereClause}`;
        const [countResult] = (await connection.query(countQuery, queryParams)) as any[];
        totalCount = countResult[0]?.total || 0;

        // Data query
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
          WHERE ${whereClause}
          ORDER BY ${dateColumn} DESC
          LIMIT ? OFFSET ?
        `;

        const dataParams = [...queryParams, limit, offset];
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

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total: totalCount,
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

