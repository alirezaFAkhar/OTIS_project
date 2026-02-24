import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import sql from 'mssql';
import { getDbClient } from '@/app/api/members/login/utils/databaseHelpers';
import { safeColumnName } from '@/app/api/members/login/utils/databaseHelpers';

/**
 * Get all complexes from database
 */
export async function GET(request: NextRequest) {
  try {
    const dbClient = getDbClient();
    const complexesTable = safeColumnName(process.env.COMPLEXES_TABLE, 'Complexes');
    const complexesIdColumn = safeColumnName(process.env.COMPLEXES_ID_COLUMN, 'Id');
    const complexesNameColumn = safeColumnName(process.env.COMPLEXES_NAME_COLUMN, 'Name');

    let complexes: any[] = [];

    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }
        const result = await pool
          .request()
          .query(`SELECT ${complexesIdColumn}, ${complexesNameColumn} FROM ${complexesTable} ORDER BY ${complexesNameColumn}`);
        complexes = result.recordset;
      } catch (error: any) {
        console.error('MSSQL error getting complexes:', error);
        return NextResponse.json(
          { error: 'خطا در دریافت لیست مجموعه‌ها' },
          { status: 500 }
        );
      }
    } else {
      // MySQL
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(
          `SELECT ${complexesIdColumn} as id, ${complexesNameColumn} as name FROM ${complexesTable} ORDER BY ${complexesNameColumn}`
        ) as any[];
        complexes = rows.map((row: any) => ({
          id: row.id,
          name: row.name,
        }));
      } catch (error: any) {
        console.error('MySQL error getting complexes:', error);
        return NextResponse.json(
          { error: 'خطا در دریافت لیست مجموعه‌ها' },
          { status: 500 }
        );
      } finally {
        connection.release();
      }
    }

    // Normalize data structure for both MSSQL and MySQL
    const normalizedComplexes = complexes.map((complex: any) => {
      // For MSSQL, column names are case-sensitive and match the actual column names
      // For MySQL, we already mapped them to id and name
      const id = complex[complexesIdColumn] || complex.id || complex.Id || complex.ID;
      const name = complex[complexesNameColumn] || complex.name || complex.Name || complex.NAME;
      return { id, name };
    }).filter((complex: any) => complex.id && complex.name); // Filter out invalid entries

    return NextResponse.json({ complexes: normalizedComplexes });
  } catch (error: any) {
    console.error('Error getting complexes:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست مجموعه‌ها' },
      { status: 500 }
    );
  }
}

