import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getDbClient, safeColumnName } from '@/app/api/members/login/utils/databaseHelpers';

export async function GET(_req: NextRequest) {
  const dbClient = getDbClient();
  const table = safeColumnName(process.env.COMPLEXES_TABLE, 'Complexes');

  try {
    if (dbClient === 'mssql') {
      if (!pool.connected) await pool.connect();
      const result = await pool.request().query(`SELECT TOP 5 * FROM ${table}`);
      return NextResponse.json({ rows: result.recordset });
    } else {
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.query(`SELECT * FROM \`${table}\` LIMIT 5`) as any[];
        return NextResponse.json({ rows });
      } finally {
        conn.release();
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
