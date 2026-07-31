import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getDbClient, safeColumnName } from '@/app/api/battery/data/utils/databaseHelpers';

function normalizeHost(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
    .split(':')[0];
}

export async function GET(request: NextRequest) {
  const empty = NextResponse.json({ name: null, enamad: null });

  try {
    const requestHost = normalizeHost(request.headers.get('host'));
    if (!requestHost) {
      return empty;
    }

    const dbClient = getDbClient();
    const complexesTable = safeColumnName(process.env.COMPLEXES_TABLE, 'Complexes');
    const idColumn = safeColumnName(process.env.COMPLEXES_ID_COLUMN, 'Id');
    const nameColumn = safeColumnName(process.env.COMPLEXES_NAME_COLUMN, 'Name');
    const urlColumn = safeColumnName(process.env.COMPLEXES_URL_COLUMN, 'ComplexUrl');
    const enamadColumn = safeColumnName(process.env.COMPLEXES_ENAMAD_COLUMN, 'ENamad');

    let rows: any[] = [];

    if (dbClient === 'mssql') {
      if (!pool.connected) {
        await pool.connect();
      }
      const result = await pool
        .request()
        .query(
          `SELECT ${idColumn} as id, ${nameColumn} as name, ${urlColumn} as complexUrl, ${enamadColumn} as enamad FROM ${complexesTable} WHERE ${urlColumn} IS NOT NULL`
        );
      rows = result.recordset;
    } else {
      const connection = await pool.getConnection();
      try {
        const [dbRows] = (await connection.query(
          `SELECT ${idColumn} as id, ${nameColumn} as name, ${urlColumn} as complexUrl, ${enamadColumn} as enamad FROM ${complexesTable} WHERE ${urlColumn} IS NOT NULL`
        )) as any[];
        rows = dbRows;
      } finally {
        connection.release();
      }
    }

    const match = rows.find((row) => normalizeHost(row.complexUrl) === requestHost);
    if (!match) {
      return empty;
    }

    return NextResponse.json({
      name: match.name ?? null,
      enamad: match.enamad ?? null,
    });
  } catch (error: any) {
    console.error('Error resolving complex public info:', error);
    return empty;
  }
}
