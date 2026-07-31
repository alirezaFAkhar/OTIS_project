import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sql from 'mssql';
import pool from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';
import { getDbClient, safeColumnName } from '@/app/api/battery/data/utils/databaseHelpers';

function getColumnNames() {
  return {
    table: safeColumnName(process.env.COMPLEXES_TABLE, 'Complexes'),
    idColumn: safeColumnName(process.env.COMPLEXES_ID_COLUMN, 'Id'),
    nameColumn: safeColumnName(process.env.COMPLEXES_NAME_COLUMN, 'Name'),
    urlColumn: safeColumnName(process.env.COMPLEXES_URL_COLUMN, 'ComplexUrl'),
    enamadColumn: safeColumnName(process.env.COMPLEXES_ENAMAD_COLUMN, 'ENamad'),
    rahaPalColumn: safeColumnName(process.env.COMPLEXES_RAHAPAL_COLUMN, 'RahaPalBearer'),
    paymentKeyColumn: safeColumnName(process.env.COMPLEXES_PAYMENTKEY_COLUMN, 'PaymentKey'),
  };
}

const updateComplexSchema = z.object({
  name: z.string().min(1, 'نام مجموعه الزامی است'),
  complexUrl: z.string().nullable().optional(),
  enamad: z.string().nullable().optional(),
  rahaPalBearer: z.string().nullable().optional(),
  paymentKey: z.string().nullable().optional(),
});

function emptyToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'شناسه نامعتبر است' }, { status: 400 });
  }

  const { table, idColumn, nameColumn, urlColumn, enamadColumn, rahaPalColumn, paymentKeyColumn } =
    getColumnNames();

  try {
    const dbClient = getDbClient();
    let row: any = null;

    if (dbClient === 'mssql') {
      if (!pool.connected) {
        await pool.connect();
      }
      const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query(
          `SELECT ${idColumn} as id, ${nameColumn} as name, ${urlColumn} as complexUrl, ${enamadColumn} as enamad, ${rahaPalColumn} as rahaPalBearer, ${paymentKeyColumn} as paymentKey FROM ${table} WHERE ${idColumn} = @id`
        );
      row = result.recordset[0] ?? null;
    } else {
      const connection = await pool.getConnection();
      try {
        const [rows] = (await connection.query(
          `SELECT ${idColumn} as id, ${nameColumn} as name, ${urlColumn} as complexUrl, ${enamadColumn} as enamad, ${rahaPalColumn} as rahaPalBearer, ${paymentKeyColumn} as paymentKey FROM ${table} WHERE ${idColumn} = ?`,
          [id]
        )) as any[];
        row = rows[0] ?? null;
      } finally {
        connection.release();
      }
    }

    if (!row) {
      return NextResponse.json({ error: 'مجموعه پیدا نشد' }, { status: 404 });
    }

    return NextResponse.json({ complex: row });
  } catch (error: any) {
    console.error('Error fetching complex:', error);
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات مجموعه' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'شناسه نامعتبر است' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data = updateComplexSchema.parse(body);

    const name = data.name.trim();
    const complexUrl = emptyToNull(data.complexUrl);
    const enamad = emptyToNull(data.enamad);
    const rahaPalBearer = emptyToNull(data.rahaPalBearer);
    const paymentKey = emptyToNull(data.paymentKey);

    const { table, idColumn, nameColumn, urlColumn, enamadColumn, rahaPalColumn, paymentKeyColumn } =
      getColumnNames();

    const dbClient = getDbClient();

    if (dbClient === 'mssql') {
      if (!pool.connected) {
        await pool.connect();
      }
      await pool
        .request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('complexUrl', sql.VarChar, complexUrl)
        .input('enamad', sql.NVarChar(sql.MAX), enamad)
        .input('rahaPalBearer', sql.NVarChar(sql.MAX), rahaPalBearer)
        .input('paymentKey', sql.VarChar, paymentKey)
        .query(
          `UPDATE ${table} SET ${nameColumn} = @name, ${urlColumn} = @complexUrl, ${enamadColumn} = @enamad, ${rahaPalColumn} = @rahaPalBearer, ${paymentKeyColumn} = @paymentKey WHERE ${idColumn} = @id`
        );
    } else {
      const connection = await pool.getConnection();
      try {
        await connection.query(
          `UPDATE ${table} SET ${nameColumn} = ?, ${urlColumn} = ?, ${enamadColumn} = ?, ${rahaPalColumn} = ?, ${paymentKeyColumn} = ? WHERE ${idColumn} = ?`,
          [name, complexUrl, enamad, rahaPalBearer, paymentKey, id]
        );
      } finally {
        connection.release();
      }
    }

    return NextResponse.json({
      complex: { id, name, complexUrl, enamad, rahaPalBearer, paymentKey },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error('Error updating complex:', error);
    return NextResponse.json({ error: 'خطا در ذخیره اطلاعات مجموعه' }, { status: 500 });
  }
}
