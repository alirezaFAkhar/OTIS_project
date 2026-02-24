import { NextRequest, NextResponse } from 'next/server';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { verifyPayment } from '@/lib/payment';
import pool from '@/lib/db';
import sql from 'mssql';

/**
 * GET /api/payment/callback
 * Handle payment callback from gateway
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get('Authority');
    const status = searchParams.get('Status');

    if (!authority) {
      return NextResponse.redirect(
        new URL('/charge?error=missing_authority', request.url)
      );
    }

    // Get tenant info
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.redirect(
        new URL('/charge?error=tenant_not_found', request.url)
      );
    }

    const tenantId = tenantInfo.tenantId;
    
    // Get database client type
    const dbClient = (process.env.DB_CLIENT || 'mysql').toLowerCase();
    let connection: any = null;
    let transaction: any;

    try {
      // Find transaction by authority
      if (dbClient === 'mssql') {
        // MSSQL
        if (!pool.connected) {
          await pool.connect();
        }
        
        const transactionResult = await pool.request()
          .input('authority', sql.NVarChar(255), authority)
          .input('tenant_id', sql.Int, tenantId)
          .query(`
            SELECT * FROM transactions 
            WHERE authority = @authority AND tenant_id = @tenant_id AND status = 'pending'
          `);
        
        if (transactionResult.recordset.length === 0) {
          return NextResponse.redirect(
            new URL('/charge?error=transaction_not_found', request.url)
          );
        }
        
        transaction = transactionResult.recordset[0];
      } else {
        // MySQL
        connection = await pool.getConnection();
        
        const [transactions] = await connection.query(
          `SELECT * FROM transactions 
          WHERE authority = ? AND tenant_id = ? AND status = 'pending'`,
          [authority, tenantId]
        ) as any[];

        if (transactions.length === 0) {
          connection.release();
          return NextResponse.redirect(
            new URL('/charge?error=transaction_not_found', request.url)
          );
        }

        transaction = transactions[0];
      }

      // Check if user cancelled payment
      if (status === 'NOK' || status === 'CANCEL') {
        if (dbClient === 'mssql') {
          await pool.request()
            .input('id', sql.Int, transaction.id)
            .query('UPDATE transactions SET status = \'cancelled\' WHERE id = @id');
        } else {
          await connection.query(
            'UPDATE transactions SET status = ? WHERE id = ?',
            ['cancelled', transaction.id]
          );
          connection.release();
        }
        
        return NextResponse.redirect(
          new URL('/charge?error=payment_cancelled', request.url)
        );
      }

      // Verify payment with gateway
      const verifyResponse = await verifyPayment({
        amount: Number(transaction.amount),
        authority: authority,
      });

      // Update transaction based on verification result
      if (verifyResponse.success && verifyResponse.refId) {
        // Payment successful
        if (dbClient === 'mssql') {
          await pool.request()
            .input('id', sql.Int, transaction.id)
            .input('ref_id', sql.NVarChar(255), verifyResponse.refId)
            .input('gateway_response', sql.NVarChar(sql.MAX), JSON.stringify(verifyResponse))
            .query(`
              UPDATE transactions 
              SET status = 'success', ref_id = @ref_id, gateway_response = @gateway_response, updated_at = GETDATE()
              WHERE id = @id
            `);
        } else {
          await connection.query(
            `UPDATE transactions 
            SET status = 'success', ref_id = ?, gateway_response = ?, updated_at = NOW()
            WHERE id = ?`,
            [
              verifyResponse.refId,
              JSON.stringify(verifyResponse),
              transaction.id,
            ]
          );
          connection.release();
        }

        // TODO: Update user balance here
        // Example for MySQL:
        // await connection.query(
        //   'UPDATE users SET balance = balance + ? WHERE id = ?',
        //   [transaction.amount, transaction.user_id]
        // );
        // Example for MSSQL:
        // await pool.request()
        //   .input('amount', sql.Decimal(15, 2), transaction.amount)
        //   .input('user_id', sql.Int, transaction.user_id)
        //   .query('UPDATE users SET balance = balance + @amount WHERE id = @user_id');

        // Redirect to success page
        return NextResponse.redirect(
          new URL(
            `/charge?success=true&transactionId=${transaction.id}&refId=${verifyResponse.refId}`,
            request.url
          )
        );
      } else {
        // Payment verification failed
        if (dbClient === 'mssql') {
          await pool.request()
            .input('id', sql.Int, transaction.id)
            .input('gateway_response', sql.NVarChar(sql.MAX), JSON.stringify(verifyResponse))
            .query(`
              UPDATE transactions 
              SET status = 'failed', gateway_response = @gateway_response, updated_at = GETDATE()
              WHERE id = @id
            `);
        } else {
          await connection.query(
            `UPDATE transactions 
            SET status = 'failed', gateway_response = ?, updated_at = NOW()
            WHERE id = ?`,
            [JSON.stringify(verifyResponse), transaction.id]
          );
          connection.release();
        }

        return NextResponse.redirect(
          new URL(
            `/charge?error=payment_failed&message=${encodeURIComponent(verifyResponse.message || 'خطا در تایید پرداخت')}`,
            request.url
          )
        );
      }
    } catch (dbError: any) {
      if (connection && typeof connection.release === 'function') {
        connection.release();
      }
      console.error('Database error in callback:', dbError);
      return NextResponse.redirect(
        new URL('/charge?error=database_error', request.url)
      );
    }
  } catch (error: any) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      new URL('/charge?error=callback_error', request.url)
    );
  }
}

