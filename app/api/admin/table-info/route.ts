import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import sql from 'mssql';
import { getDbClient, safeColumnName } from '@/app/api/members/login/utils/databaseHelpers';
import { getColumnNames } from '@/app/api/battery/data/utils/databaseHelpers';

/**
 * Get table column information for debugging
 * Query params: table (table name)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table') || 'Payments';
    
    const dbClient = getDbClient();
    const columnNames = getColumnNames();
    
    let columns: any[] = [];

    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }
        
        // Get column information from INFORMATION_SCHEMA
        const query = `
          SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_DEFAULT
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = @tableName
          ORDER BY ORDINAL_POSITION
        `;
        
        const result = await pool
          .request()
          .input('tableName', sql.NVarChar, tableName)
          .query(query);
        
        columns = result.recordset;
      } catch (error: any) {
        console.error('MSSQL error getting table info:', error);
        return NextResponse.json(
          { error: 'خطا در دریافت اطلاعات جدول', details: error.message },
          { status: 500 }
        );
      }
    } else {
      // MySQL
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(
          `SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_DEFAULT
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION`,
          [tableName]
        ) as any[];
        
        columns = rows;
      } catch (error: any) {
        console.error('MySQL error getting table info:', error);
        return NextResponse.json(
          { error: 'خطا در دریافت اطلاعات جدول', details: error.message },
          { status: 500 }
        );
      } finally {
        connection.release();
      }
    }

    // Also get environment variable values
    const envVars = {
      PAYMENTS_TABLE: process.env.PAYMENTS_TABLE || 'Payments',
      PAYMENTS_DATE_COLUMN: process.env.PAYMENTS_DATE_COLUMN || 'Date',
      PAYMENTS_AMOUNT_COLUMN: process.env.PAYMENTS_AMOUNT_COLUMN || 'Amount',
      PAYMENTS_BALANCE_COLUMN: process.env.PAYMENTS_BALANCE_COLUMN || 'BalanceAfterCharge',
      PAYMENTS_MEMBER_ID_COLUMN: process.env.PAYMENTS_MEMBER_ID_COLUMN || '',
    };

    return NextResponse.json({
      tableName,
      columns,
      envVars,
      columnNames: {
        paymentsTable: columnNames.paymentsTable,
        paymentsDateColumn: columnNames.paymentsDateColumn,
        paymentsAmountColumn: columnNames.paymentsAmountColumn,
        paymentsBalanceColumn: columnNames.paymentsBalanceColumn,
        paymentsMemberIdColumn: columnNames.paymentsMemberIdColumn,
      },
    });
  } catch (error: any) {
    console.error('Error getting table info:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات جدول', details: error.message },
      { status: 500 }
    );
  }
}


