import pool from '@/lib/db';
import { translatePayType } from './payTypeTranslator';

interface PaymentColumns {
  paymentsTable: string;
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






