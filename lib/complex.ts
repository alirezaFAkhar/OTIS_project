import type { NextRequest } from 'next/server';
import pool from './db';
import { safeColumnName, getDbClient } from '@/app/api/members/login/utils/databaseHelpers';

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

/**
 * Resolve the complex a request belongs to, based on the request's own Host
 * header matched against Complexes.ComplexUrl. Unlike tenant resolution, this
 * never trusts a client-supplied header/query value.
 */
export async function getComplexIdFromHost(request: NextRequest): Promise<number | null> {
  const requestHost = normalizeHost(
    request.headers.get('x-forwarded-host') || request.headers.get('host')
  );
  if (!requestHost) return null;

  const dbClient = getDbClient();
  const complexesTable = safeColumnName(process.env.COMPLEXES_TABLE, 'Complexes');
  const idColumn = safeColumnName(process.env.COMPLEXES_ID_COLUMN, 'Id');
  const urlColumn = safeColumnName(process.env.COMPLEXES_URL_COLUMN, 'ComplexUrl');

  let rows: any[] = [];

  if (dbClient === 'mssql') {
    if (!pool.connected) {
      await pool.connect();
    }
    const result = await pool
      .request()
      .query(
        `SELECT ${idColumn} as id, ${urlColumn} as complexUrl FROM ${complexesTable} WHERE ${urlColumn} IS NOT NULL`
      );
    rows = result.recordset;
  } else {
    const connection = await pool.getConnection();
    try {
      const [dbRows] = (await connection.query(
        `SELECT ${idColumn} as id, ${urlColumn} as complexUrl FROM ${complexesTable} WHERE ${urlColumn} IS NOT NULL`
      )) as any[];
      rows = dbRows;
    } finally {
      connection.release();
    }
  }

  const match = rows.find((row) => normalizeHost(row.complexUrl) === requestHost);
  return match ? Number(match.id) : null;
}
