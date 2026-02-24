/**
 * Get database client type
 */
export function getDbClient(): 'mysql' | 'mssql' {
  return (process.env.DB_CLIENT || 'mysql').toLowerCase() as 'mysql' | 'mssql';
}

/**
 * Build date column expression for handling null PayDate
 */
export function buildDateColumn(
  dbClient: 'mysql' | 'mssql',
  payDateColumn: string,
  addDateColumn: string
): string {
  return dbClient === 'mssql'
    ? `ISNULL(${payDateColumn}, ${addDateColumn})`
    : `COALESCE(${payDateColumn}, ${addDateColumn})`;
}

/**
 * Format date for MySQL query
 */
export function formatDateForMySQL(dateString: string, isEndOfDay: boolean = false): string {
  const date = new Date(dateString);
  if (isEndOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Build WHERE clause conditions
 */
export function buildWhereClause(
  dbClient: 'mysql' | 'mssql',
  memberIdColumn: string,
  memberId: number,
  dateColumn: string,
  fromDate: string | null,
  toDate: string | null
): {
  whereClause: string;
  queryParams: any[];
} {
  const whereConditions: string[] = [];
  const queryParams: any[] = [];

  // Member ID condition
  if (dbClient === 'mssql') {
    whereConditions.push(`${memberIdColumn} = @memberId`);
  } else {
    whereConditions.push(`${memberIdColumn} = ?`);
    queryParams.push(memberId);
  }

  // Date filters
  if (fromDate) {
    if (dbClient === 'mssql') {
      whereConditions.push(`(${dateColumn} >= @fromDate)`);
    } else {
      whereConditions.push(`(${dateColumn} >= ?)`);
      queryParams.push(formatDateForMySQL(fromDate, false));
    }
  }

  if (toDate) {
    if (dbClient === 'mssql') {
      whereConditions.push(`(${dateColumn} <= @toDate)`);
    } else {
      whereConditions.push(`(${dateColumn} <= ?)`);
      queryParams.push(formatDateForMySQL(toDate, true));
    }
  }

  const whereClause =
    whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';

  return { whereClause, queryParams };
}



