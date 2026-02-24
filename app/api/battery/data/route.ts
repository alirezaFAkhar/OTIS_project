import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  getDbClient,
  getColumnNames,
  getMemberMSSQL,
  getMemberMySQL,
  getComplexMSSQL,
  getComplexMySQL,
  handleDatabaseError,
} from './utils/databaseHelpers';
import { transformMemberToBatteryData } from './utils/dataTransformers';

/**
 * Validate and extract user ID from token
 */
function getUserIdFromToken(request: NextRequest): { userId: number } | NextResponse {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = typeof payload.userId === 'number' 
    ? payload.userId 
    : parseInt(String(payload.userId), 10);

  if (isNaN(userId) || userId <= 0) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  return { userId };
}

/**
 * Get member data from database
 */
async function getMemberData(userId: number) {
  const columnNames = getColumnNames();
  const dbClient = getDbClient();

  let member: any;

  if (dbClient === 'mssql') {
    member = await getMemberMSSQL(
      columnNames.membersTable,
      columnNames.membersIdColumn,
      userId
    );
  } else {
    member = await getMemberMySQL(
      columnNames.membersTable,
      columnNames.membersIdColumn,
      userId
    );
  }

  if (!member) {
    return null;
  }

  return member;
}

/**
 * Get complex data from database
 */
async function getComplexData(complexId: number | null | undefined): Promise<string> {
  if (!complexId) {
    return '';
  }

  const columnNames = getColumnNames();
  const dbClient = getDbClient();

  let complex: any;

  if (dbClient === 'mssql') {
    complex = await getComplexMSSQL(
      columnNames.complexesTable,
      columnNames.complexesIdColumn,
      columnNames.complexesNameColumn,
      complexId
    );
  } else {
    complex = await getComplexMySQL(
      columnNames.complexesTable,
      columnNames.complexesIdColumn,
      columnNames.complexesNameColumn,
      complexId
    );
  }

  if (!complex) {
    return '';
  }

  return complex[columnNames.complexesNameColumn] || '';
}

/**
 * GET /api/battery/data
 * 
 * Get battery data for the authenticated member
 * 
 * Headers:
 * - Cookie: token (JWT)
 * 
 * Response:
 * - 200: Battery data object
 * - 401: Unauthorized (no token or invalid token)
 * - 400: Invalid user ID
 * - 404: Member not found
 * - 503: Database connection error
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Validate token and get user ID
    const userIdResult = getUserIdFromToken(request);
    if (userIdResult instanceof NextResponse) {
      return userIdResult;
    }
    const { userId } = userIdResult;

    // Get member data from database
    const member = await getMemberData(userId);

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Get complex data if ComplexId exists
    const columnNames = getColumnNames();
    const complexId = member[columnNames.membersComplexIdColumn];
    const complexName = await getComplexData(complexId);

    // Transform member data to battery data format
    const batteryData = transformMemberToBatteryData(member, complexName);

    return NextResponse.json(batteryData);
  } catch (error: any) {
    // Handle database connection errors
    const dbError = handleDatabaseError(error);
    if (dbError) {
      return dbError;
    }

    // Handle other errors
    console.error('Battery data API error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات باتری' },
      { status: 500 }
    );
  }
}
