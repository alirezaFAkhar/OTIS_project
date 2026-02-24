import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { getColumnNames, safeColumnName, getDbClient } from '@/app/api/battery/data/utils/databaseHelpers';
import { getPaymentColumns } from '@/app/api/reports/payments/utils/columnHelpers';
import { buildDateColumn, formatDateForMySQL } from '@/app/api/reports/payments/utils/queryBuilder';
import sql from 'mssql';
import pool from '@/lib/db';

/**
 * GET /api/admin/stats
 * Get dashboard statistics for admin
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

    const dbClient = getDbClient();
    const columnNames = getColumnNames();
    const paymentColumns = getPaymentColumns();

    // Get column names for Members table
    const membersTable = columnNames.membersTable;
    const membersIdColumn = columnNames.membersIdColumn;
    const isActiveColumn = safeColumnName(process.env.MEMBERS_ACTIVE_COLUMN, 'IsActive');
    
    // Get column names for Complexes table
    const complexesTable = columnNames.complexesTable;
    const complexesIdColumn = columnNames.complexesIdColumn;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Build date column expression for payments
    const dateColumn = buildDateColumn(
      dbClient,
      paymentColumns.paymentsPayDateColumn,
      paymentColumns.paymentsAddDateColumn
    );

    let totalMembers = 0;
    let inactiveMembers = 0;
    let todayPaymentsCount = 0;
    let totalComplexes = 0;

    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }

        // Get total members count
        const totalQuery = `SELECT COUNT(*) as total FROM ${membersTable}`;
        const totalResult = await pool.request().query(totalQuery);
        totalMembers = totalResult.recordset[0]?.total || 0;

        // Get inactive members count (0 or NULL)
        const inactiveQuery = `SELECT COUNT(*) as total FROM ${membersTable} WHERE ${isActiveColumn} = 0 OR ${isActiveColumn} IS NULL`;
        const inactiveResult = await pool.request().query(inactiveQuery);
        inactiveMembers = inactiveResult.recordset[0]?.total || 0;

        // Get today's payments count
        const todayPaymentsQuery = `SELECT COUNT(*) as total FROM ${paymentColumns.paymentsTable} WHERE ${dateColumn} >= @todayStart AND ${dateColumn} <= @todayEnd`;
        const todayPaymentsRequest = pool.request();
        todayPaymentsRequest.input('todayStart', sql.DateTime, today);
        todayPaymentsRequest.input('todayEnd', sql.DateTime, todayEnd);
        const todayPaymentsResult = await todayPaymentsRequest.query(todayPaymentsQuery);
        todayPaymentsCount = todayPaymentsResult.recordset[0]?.total || 0;

        // Get total complexes count
        const complexesQuery = `SELECT COUNT(*) as total FROM ${complexesTable}`;
        const complexesResult = await pool.request().query(complexesQuery);
        totalComplexes = complexesResult.recordset[0]?.total || 0;
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

        // Get total members count
        const totalQuery = `SELECT COUNT(*) as total FROM ${membersTable}`;
        const [totalResult] = (await connection.query(totalQuery)) as any[];
        totalMembers = totalResult[0]?.total || 0;

        // Get inactive members count
        const inactiveQuery = `SELECT COUNT(*) as total FROM ${membersTable} WHERE ${isActiveColumn} = 0 OR ${isActiveColumn} IS NULL`;
        const [inactiveResult] = (await connection.query(inactiveQuery)) as any[];
        inactiveMembers = inactiveResult[0]?.total || 0;

        // Get today's payments count
        const todayPaymentsQuery = `SELECT COUNT(*) as total FROM ${paymentColumns.paymentsTable} WHERE ${dateColumn} >= ? AND ${dateColumn} <= ?`;
        const [todayPaymentsResult] = (await connection.query(todayPaymentsQuery, [
          formatDateForMySQL(today.toISOString().split('T')[0], false),
          formatDateForMySQL(today.toISOString().split('T')[0], true),
        ])) as any[];
        todayPaymentsCount = todayPaymentsResult[0]?.total || 0;

        // Get total complexes count
        const complexesQuery = `SELECT COUNT(*) as total FROM ${complexesTable}`;
        const [complexesResult] = (await connection.query(complexesQuery)) as any[];
        totalComplexes = complexesResult[0]?.total || 0;
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
      totalMembers,
      inactiveMembers,
      activeMembers: totalMembers - inactiveMembers,
      todayPaymentsCount,
      totalComplexes,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
    return NextResponse.json(
      { error: 'خطا در دریافت داده‌ها' },
      { status: 500 }
    );
  }
}

