import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import sql from 'mssql';
import { getDbClient, safeColumnName } from '@/app/api/members/login/utils/databaseHelpers';
import { getColumnNames } from '@/app/api/battery/data/utils/databaseHelpers';

/**
 * Get all members with pagination
 * Query params: page (default: 1), limit (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const usernameFilter = searchParams.get('username') || '';
    const phoneFilter = searchParams.get('phone') || '';
    const nameFilter = searchParams.get('name') || '';
    const isActiveFilter = searchParams.get('isActive'); // 'true', 'false', or null
    const complexIdFilter = searchParams.get('complexId'); // Complex ID filter

    const dbClient = getDbClient();
    const columnNames = getColumnNames();
    
    // Get column names for Members table
    const membersTable = columnNames.membersTable;
    const membersIdColumn = columnNames.membersIdColumn;
    const usernameColumn = safeColumnName(process.env.MEMBERS_USERNAME_COLUMN, 'Username');
    const passwordColumn = safeColumnName(process.env.MEMBERS_PASSWORD_COLUMN, 'Password');
    const phoneColumn = safeColumnName(process.env.MEMBERS_PHONE_COLUMN, 'PhoneNo');
    const isActiveColumn = safeColumnName(process.env.MEMBERS_ACTIVE_COLUMN, 'IsActive');
    const nameColumn = safeColumnName(process.env.MEMBERS_NAME_COLUMN, 'Name');
    const complexIdColumn = safeColumnName(process.env.MEMBERS_COMPLEX_ID_COLUMN, 'ComplexId');
    
    // Get column names for Payments table
    // Use actual column names from database or fallback to environment variables
    const paymentsTable = columnNames.paymentsTable;
    // MemberId is the actual column name in Payments table
    const paymentsMemberIdColumn = safeColumnName(process.env.PAYMENTS_MEMBER_ID_COLUMN, 'MemberId');
    // PayedPrice is the actual column name for amount
    const paymentsAmountColumn = safeColumnName(process.env.PAYMENTS_AMOUNT_COLUMN, 'PayedPrice');
    // Credit is the actual column name for balance
    const paymentsBalanceColumn = safeColumnName(process.env.PAYMENTS_BALANCE_COLUMN, 'Credit');
    // Date column can vary across schemas; support legacy and explicit env names
    const paymentsPayDateColumn = safeColumnName(process.env.PAYMENTS_PAY_DATE_COLUMN, 'PayDate');
    const paymentsAddDateColumn = safeColumnName(process.env.PAYMENTS_ADD_DATE_COLUMN, 'AddDate');
    const paymentsDateColumn = safeColumnName(
      process.env.PAYMENTS_DATE_COLUMN,
      paymentsAddDateColumn
    );
    const paymentDateCandidates = Array.from(
      new Set([paymentsDateColumn, paymentsPayDateColumn, paymentsAddDateColumn])
    );
    const paymentMemberIdCandidates = Array.from(
      new Set([paymentsMemberIdColumn, membersIdColumn, 'MemberId'])
    );
    const paymentAmountCandidates = Array.from(
      new Set([paymentsAmountColumn, 'PayedPrice', 'Amount'])
    );
    const paymentBalanceCandidates = Array.from(
      new Set([paymentsBalanceColumn, 'Credit', 'BalanceAfterCharge'])
    );

    let members: any[] = [];
    let totalCount = 0;

    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }

        // Build WHERE clause for filters
        const whereConditions: string[] = [];
        const filterParams: any = {};
        
        if (usernameFilter) {
          whereConditions.push(`${usernameColumn} LIKE @usernameFilter`);
          filterParams.usernameFilter = `%${usernameFilter}%`;
        }
        if (phoneFilter) {
          whereConditions.push(`${phoneColumn} LIKE @phoneFilter`);
          filterParams.phoneFilter = `%${phoneFilter}%`;
        }
        if (nameFilter) {
          whereConditions.push(`${nameColumn} LIKE @nameFilter`);
          filterParams.nameFilter = `%${nameFilter}%`;
        }
        if (isActiveFilter !== null && isActiveFilter !== '') {
          whereConditions.push(`${isActiveColumn} = @isActiveFilter`);
          filterParams.isActiveFilter = isActiveFilter === 'true' ? 1 : 0;
        }
        if (complexIdFilter) {
          whereConditions.push(`${complexIdColumn} = @complexIdFilter`);
          filterParams.complexIdFilter = parseInt(complexIdFilter);
        }
        
        const whereClause = whereConditions.length > 0 
          ? `WHERE ${whereConditions.join(' AND ')}` 
          : '';

        // Get total count with filters
        let countQuery = `SELECT COUNT(*) as total FROM ${membersTable} ${whereClause}`;
        const countRequest = pool.request();
        Object.keys(filterParams).forEach(key => {
          if (key === 'isActiveFilter') {
            countRequest.input(key, sql.Bit, filterParams[key]);
          } else if (key === 'complexIdFilter') {
            countRequest.input(key, sql.Int, filterParams[key]);
          } else {
            countRequest.input(key, sql.NVarChar, filterParams[key]);
          }
        });
        const countResult = await countRequest.query(countQuery);
        totalCount = countResult.recordset[0].total || 0;

        // Try to get members with payment data, if fails, get without payment data
        let query = '';
        try {
          // First, check if Payments table exists and has the required columns
          const checkTableQuery = `
            SELECT COUNT(*) as tableCount
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = @tableName
          `;
          const tableCheck = await pool
            .request()
            .input('tableName', sql.NVarChar, paymentsTable)
            .query(checkTableQuery);
          
          if (tableCheck.recordset[0].tableCount > 0) {
            // Pick the first available date column among configured candidates
            const columnsQuery = `
              SELECT COLUMN_NAME
              FROM INFORMATION_SCHEMA.COLUMNS
              WHERE TABLE_NAME = @tableName
            `;
            const columnsResult = await pool
              .request()
              .input('tableName', sql.NVarChar, paymentsTable)
              .query(columnsQuery);
            const existingColumns = new Set(
              columnsResult.recordset.map((col: any) => col.COLUMN_NAME)
            );
            const resolvedMemberIdColumn = paymentMemberIdCandidates.find((col) =>
              existingColumns.has(col)
            );
            const resolvedAmountColumn = paymentAmountCandidates.find((col) =>
              existingColumns.has(col)
            );
            const resolvedBalanceColumn = paymentBalanceCandidates.find((col) =>
              existingColumns.has(col)
            );
            const resolvedDateColumn = paymentDateCandidates.find((col) =>
              existingColumns.has(col)
            );

            if (
              resolvedDateColumn &&
              resolvedMemberIdColumn &&
              resolvedAmountColumn &&
              resolvedBalanceColumn
            ) {
              // Get members with latest payment data
              query = `
                SELECT 
                  m.${membersIdColumn} as id,
                  m.${usernameColumn} as username,
                  m.${passwordColumn} as password,
                  m.${phoneColumn} as phone,
                  m.${isActiveColumn} as isActive,
                  m.${nameColumn} as name,
                  p.${resolvedBalanceColumn} as balanceAfterCharge,
                  p.${resolvedAmountColumn} as amount
                FROM ${membersTable} m
                LEFT JOIN (
                  SELECT 
                    ${resolvedMemberIdColumn},
                    ${resolvedBalanceColumn},
                    ${resolvedAmountColumn},
                    ROW_NUMBER() OVER (PARTITION BY ${resolvedMemberIdColumn} ORDER BY ${resolvedDateColumn} DESC) as rn
                  FROM ${paymentsTable}
                ) p ON m.${membersIdColumn} = p.${resolvedMemberIdColumn} AND p.rn = 1
                ${whereClause}
                ORDER BY m.${membersIdColumn}
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY
              `;
            }
          }
        } catch (checkError: any) {
          console.log('Payment table check failed, using members only:', checkError.message);
        }

        // If query is empty, get members without payment data
        if (!query) {
          query = `
            SELECT 
              ${membersIdColumn} as id,
              ${usernameColumn} as username,
              ${passwordColumn} as password,
              ${phoneColumn} as phone,
              ${isActiveColumn} as isActive,
              ${nameColumn} as name,
              NULL as balanceAfterCharge,
              NULL as amount
            FROM ${membersTable}
            ${whereClause}
            ORDER BY ${membersIdColumn}
            OFFSET ${offset} ROWS
            FETCH NEXT ${limit} ROWS ONLY
          `;
        }

        // Apply filters to query
        const resultRequest = pool.request();
        Object.keys(filterParams).forEach(key => {
          if (key === 'isActiveFilter') {
            resultRequest.input(key, sql.Bit, filterParams[key]);
          } else if (key === 'complexIdFilter') {
            resultRequest.input(key, sql.Int, filterParams[key]);
          } else {
            resultRequest.input(key, sql.NVarChar, filterParams[key]);
          }
        });
        const result = await resultRequest.query(query);
        members = result.recordset;
      } catch (error: any) {
        console.error('MSSQL error getting members:', error);
        return NextResponse.json(
          { error: 'خطا در دریافت لیست کاربران' },
          { status: 500 }
        );
      }
    } else {
      // MySQL
      const connection = await pool.getConnection();
      try {
        // Build WHERE clause for filters
        const whereConditions: string[] = [];
        const filterParams: any[] = [];
        
        if (usernameFilter) {
          whereConditions.push(`${usernameColumn} LIKE ?`);
          filterParams.push(`%${usernameFilter}%`);
        }
        if (phoneFilter) {
          whereConditions.push(`${phoneColumn} LIKE ?`);
          filterParams.push(`%${phoneFilter}%`);
        }
        if (nameFilter) {
          whereConditions.push(`${nameColumn} LIKE ?`);
          filterParams.push(`%${nameFilter}%`);
        }
        if (isActiveFilter !== null && isActiveFilter !== '') {
          whereConditions.push(`${isActiveColumn} = ?`);
          filterParams.push(isActiveFilter === 'true' ? 1 : 0);
        }
        if (complexIdFilter) {
          whereConditions.push(`${complexIdColumn} = ?`);
          filterParams.push(parseInt(complexIdFilter));
        }
        
        const whereClause = whereConditions.length > 0 
          ? `WHERE ${whereConditions.join(' AND ')}` 
          : '';

        // Get total count with filters
        const countQuery = `SELECT COUNT(*) as total FROM ${membersTable} ${whereClause}`;
        const [countRows] = await connection.query(countQuery, filterParams) as any[];
        totalCount = countRows[0]?.total || 0;

        // Try to get members with payment data, if fails, get without payment data
        let query = '';
        try {
          // Check if Payments table exists
          const [tableCheck] = await connection.query(
            `SELECT COUNT(*) as tableCount
             FROM INFORMATION_SCHEMA.TABLES 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
            [paymentsTable]
          ) as any[];
          
          if (tableCheck[0]?.tableCount > 0) {
            // Pick the first available date column among configured candidates
            const [columnRows] = await connection.query(
              `SELECT COLUMN_NAME
               FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = ?`,
              [paymentsTable]
            ) as any[];
            const existingColumns = new Set(
              (columnRows || []).map((col: any) => col.COLUMN_NAME)
            );
            const resolvedMemberIdColumn = paymentMemberIdCandidates.find((col) =>
              existingColumns.has(col)
            );
            const resolvedAmountColumn = paymentAmountCandidates.find((col) =>
              existingColumns.has(col)
            );
            const resolvedBalanceColumn = paymentBalanceCandidates.find((col) =>
              existingColumns.has(col)
            );
            const resolvedDateColumn = paymentDateCandidates.find((col) =>
              existingColumns.has(col)
            );

            if (
              resolvedDateColumn &&
              resolvedMemberIdColumn &&
              resolvedAmountColumn &&
              resolvedBalanceColumn
            ) {
              // Get members with latest payment data
              query = `
                SELECT 
                  m.${membersIdColumn} as id,
                  m.${usernameColumn} as username,
                  m.${passwordColumn} as password,
                  m.${phoneColumn} as phone,
                  m.${isActiveColumn} as isActive,
                  m.${nameColumn} as name,
                  p.${resolvedBalanceColumn} as balanceAfterCharge,
                  p.${resolvedAmountColumn} as amount
                FROM ${membersTable} m
                LEFT JOIN (
                  SELECT 
                    p1.${resolvedMemberIdColumn},
                    p1.${resolvedBalanceColumn},
                    p1.${resolvedAmountColumn}
                  FROM ${paymentsTable} p1
                  INNER JOIN (
                    SELECT 
                      ${resolvedMemberIdColumn},
                      MAX(${resolvedDateColumn}) as maxDate
                    FROM ${paymentsTable}
                    GROUP BY ${resolvedMemberIdColumn}
                  ) p2 ON p1.${resolvedMemberIdColumn} = p2.${resolvedMemberIdColumn}
                  AND p1.${resolvedDateColumn} = p2.maxDate
                ) p ON m.${membersIdColumn} = p.${resolvedMemberIdColumn}
                ${whereClause}
                ORDER BY m.${membersIdColumn}
                LIMIT ? OFFSET ?
              `;
            }
          }
        } catch (checkError: any) {
          console.log('Payment table check failed, using members only:', checkError.message);
        }

        // If query is empty, get members without payment data
        if (!query) {
          query = `
            SELECT 
              ${membersIdColumn} as id,
              ${usernameColumn} as username,
              ${passwordColumn} as password,
              ${phoneColumn} as phone,
              ${isActiveColumn} as isActive,
              ${nameColumn} as name,
              NULL as balanceAfterCharge,
              NULL as amount
            FROM ${membersTable}
            ${whereClause}
            ORDER BY ${membersIdColumn}
            LIMIT ? OFFSET ?
          `;
        }

        // Combine filter params with limit and offset
        const queryParams = [...filterParams, limit, offset];
        const [rows] = await connection.query(query, queryParams) as any[];
        members = rows;
      } catch (error: any) {
        console.error('MySQL error getting members:', error);
        return NextResponse.json(
          { error: 'خطا در دریافت لیست کاربران' },
          { status: 500 }
        );
      } finally {
        connection.release();
      }
    }

    // Normalize data structure
    const normalizedMembers = members.map((member: any) => ({
      id: member.id || member[membersIdColumn],
      username: member.username || member[usernameColumn] || '',
      password: member.password || member[passwordColumn] || '',
      phone: member.phone || member[phoneColumn] || '',
      isActive: member.isActive !== undefined ? Boolean(member.isActive) : (member[isActiveColumn] !== undefined ? Boolean(member[isActiveColumn]) : true),
      name: member.name || member[nameColumn] || '',
      balanceAfterCharge:
        member.balanceAfterCharge ?? member[paymentsBalanceColumn] ?? 0,
      amount: member.amount ?? member[paymentsAmountColumn] ?? 0,
    }));

    return NextResponse.json({
      members: normalizedMembers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error getting members:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست کاربران' },
      { status: 500 }
    );
  }
}

