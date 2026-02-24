import sql from 'mssql';
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
 * Get total count of payments from MSSQL
 */
export async function getPaymentsCountMSSQL(
  tableName: string,
  whereClause: string,
  memberId: number,
  fromDate: string | null,
  toDate: string | null
): Promise<number> {
  if (!pool.connected) {
    await pool.connect();
  }

  const countQuery = `SELECT COUNT(*) as total FROM ${tableName} WHERE ${whereClause}`;
  const countRequest = pool.request().input('memberId', sql.Int, memberId);

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

  const countResult = await countRequest.query(countQuery);
  return countResult.recordset[0]?.total || 0;
}

/**
 * Get paginated payments from MSSQL
 */
export async function getPaymentsMSSQL(
  columns: PaymentColumns,
  dateColumn: string,
  whereClause: string,
  memberId: number,
  fromDate: string | null,
  toDate: string | null,
  offset: number,
  limit: number
): Promise<any[]> {
  if (!pool.connected) {
    await pool.connect();
  }

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
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const dataRequest = pool
    .request()
    .input('memberId', sql.Int, memberId)
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

  const dataResult = await dataRequest.query(dataQuery);
  return dataResult.recordset.map((payment: any) => ({
    ...payment,
    PayType: translatePayType(payment.PayType),
  }));
}



