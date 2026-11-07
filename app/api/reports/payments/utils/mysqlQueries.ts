import pool from '@/lib/db';
import { translatePayType } from './payTypeTranslator';

interface PaymentColumns {
  paymentsTable: string;
  paymentsMemberIdColumn: string;
  paymentsPayDateColumn: string;
  paymentsAddDateColumn: string;
  paymentsPayTypeColumn: string;
  paymentsTrackingNumberColumn: string;
  paymentsAmountColumn: string;
  paymentsCreditColumn: string;
  paymentsStatusColumn: string;
}

/**
 * Get total count of payments from MySQL
 */
export async function getPaymentsCountMySQL(
  tableName: string,
  whereClause: string,
  queryParams: any[]
): Promise<number> {
  const connection = await pool.getConnection();
  try {
    const countQuery = `SELECT COUNT(*) as total FROM ${tableName} WHERE ${whereClause}`;
    const [countResult] = (await connection.query(countQuery, queryParams)) as any[];
    return countResult[0]?.total || 0;
  } finally {
    connection.release();
  }
}

/**
 * Get paginated payments from MySQL
 */
export async function getPaymentsMySQL(
  columns: PaymentColumns,
  dateColumn: string,
  whereClause: string,
  queryParams: any[],
  limit: number,
  offset: number
): Promise<any[]> {
  const connection = await pool.getConnection();
  try {
    const dataQuery = `
      SELECT 
        Id,
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

    return dataResult.map((payment: any) => ({
      ...payment,
      PayType: translatePayType(payment.PayType),
    }));
  } finally {
    connection.release();
  }
}

/**
 * Get the member's most recent Payments row's tariff readings (P1-P4), ordered by Id DESC
 */
export async function getLatestPaymentReadingsMySQL(
  columns: PaymentColumns & {
    paymentsP1Column: string;
    paymentsP2Column: string;
    paymentsP3Column: string;
    paymentsP4Column: string;
  },
  memberId: number
): Promise<any | null> {
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT
        ${columns.paymentsP1Column} as P1,
        ${columns.paymentsP2Column} as P2,
        ${columns.paymentsP3Column} as P3,
        ${columns.paymentsP4Column} as P4,
        ${columns.paymentsPayDateColumn} as PayDate,
        ${columns.paymentsAddDateColumn} as AddDate
      FROM ${columns.paymentsTable}
      WHERE ${columns.paymentsMemberIdColumn} = ?
      ORDER BY Id DESC
      LIMIT 1
    `;

    const [result] = (await connection.query(query, [memberId])) as any[];
    return result[0] || null;
  } finally {
    connection.release();
  }
}


















