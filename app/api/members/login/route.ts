import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateToken } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import {
  safeColumnName,
  getDbClient,
  getMemberMSSQL,
  getMemberMySQL,
  handleDatabaseError,
} from './utils/databaseHelpers';
import { isMemberPasswordValid } from './utils/passwordValidation';

/**
 * Login request schema validation
 */
const loginSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

/**
 * Get column names from environment variables with safe defaults
 */
function getColumnNames() {
  return {
    tableName: safeColumnName(process.env.MEMBERS_TABLE, 'Members'),
    idColumn: safeColumnName(process.env.MEMBERS_ID_COLUMN, 'Id'),
    usernameColumn: safeColumnName(process.env.MEMBERS_USERNAME_COLUMN, 'Username'),
    passwordColumn: safeColumnName(process.env.MEMBERS_PASSWORD_COLUMN, 'Password'),
    phoneColumn: safeColumnName(process.env.MEMBERS_PHONE_COLUMN, 'PhoneNo'),
    isActiveColumn: safeColumnName(process.env.MEMBERS_ACTIVE_COLUMN, 'IsActive'),
  };
}

/**
 * Get member from database by username
 */
async function getMemberByUsername(
  username: string,
  tableName: string,
  usernameColumn: string
): Promise<any[]> {
  const dbClient = getDbClient();

  if (dbClient === 'mssql') {
    try {
      return await getMemberMSSQL(tableName, usernameColumn, username);
    } catch (connError: any) {
      console.error('MSSQL connection error:', connError);
      const dbError = handleDatabaseError(connError);
      if (dbError) throw dbError;
      throw connError;
    }
  } else {
    // MySQL
    try {
      return await getMemberMySQL(tableName, usernameColumn, username);
    } catch (connError: any) {
      console.error('MySQL connection error:', connError);
      const dbError = handleDatabaseError(connError);
      if (dbError) throw dbError;
      throw connError;
    }
  }
}

/**
 * Validate member account status
 */
function validateMemberAccount(
  member: any,
  passwordColumn: string,
  isActiveColumn: string
): { valid: false; error: NextResponse } | { valid: true; storedPassword: string } {
  const storedPassword = String(member[passwordColumn] ?? '');
  const activeRaw = member[isActiveColumn];
  const isActive = activeRaw === undefined || activeRaw === null ? true : Boolean(activeRaw);

  // Check if account is active
  if (!isActive) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'این حساب کاربری غیرفعال است' },
        { status: 403 }
      ),
    };
  }

  // Check if password exists
  if (!storedPassword) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'برای این حساب رمز عبور ثبت نشده است' },
        { status: 400 }
      ),
    };
  }

  return { valid: true, storedPassword };
}

/**
 * Create successful login response with token cookie
 */
function createLoginResponse(member: any, columnNames: ReturnType<typeof getColumnNames>) {
  const memberIdRaw = member[columnNames.idColumn];
  const memberId = Number(memberIdRaw);

  // Generate JWT token
  const token = generateToken({
    userId: Number.isFinite(memberId) ? memberId : 0,
    username: String(member[columnNames.usernameColumn] ?? ''),
    phone: String(member[columnNames.phoneColumn] ?? ''),
  });

  // Create response
  const response = NextResponse.json({
    message: 'ورود موفقیت‌آمیز',
    member: {
      id: member[columnNames.idColumn],
      username: member[columnNames.usernameColumn],
      phone: member[columnNames.phoneColumn] ?? null,
    },
  });

  // Set httpOnly cookie for security (token not exposed in response body)
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

/**
 * POST /api/members/login
 * 
 * Authenticate member and return JWT token
 * 
 * Request body:
 * - username: string (required)
 * - password: string (required)
 * 
 * Response:
 * - 200: Success with member data
 * - 400: Validation error or missing password
 * - 401: Invalid credentials
 * - 403: Account inactive
 * - 503: Database connection error
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    // Get tenant info
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    const tenantId = tenantInfo.tenantId;

    // Check if it's admin login (hardcoded credentials - not in database)
    // Admin credentials: username='admin', password='admin123'
    if (username === 'admin' && password === 'admin123') {
      // Generate admin token
      const token = generateToken({
        userId: 0, // No database ID for admin
        username: 'admin',
        phone: '',
        role: 'admin',
        tenantId: tenantId,
      });

      const response = NextResponse.json({
        message: 'ورود موفقیت‌آمیز',
        user: {
          id: 0,
          username: 'admin',
          email: null,
          phone: null,
        },
        role: 'admin',
        token,
      });

      // Set cookie for admin
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // If not admin, check if it's a member
    // Get column names from environment
    const columnNames = getColumnNames();

    // Get member from database
    const rows = await getMemberByUsername(
      username,
      columnNames.tableName,
      columnNames.usernameColumn
    );

    // Check if member exists
    if (!rows.length) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    const member = rows[0];

    // Validate member account (active status, password exists)
    const accountValidation = validateMemberAccount(
      member,
      columnNames.passwordColumn,
      columnNames.isActiveColumn
    );
    if (!accountValidation.valid) {
      return accountValidation.error;
    }

    // Validate password
    const validPassword = await isMemberPasswordValid(password, accountValidation.storedPassword);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Create and return success response with token
    const memberIdRaw = member[columnNames.idColumn];
    const memberId = Number(memberIdRaw);

    // Generate JWT token
    const token = generateToken({
      userId: Number.isFinite(memberId) ? memberId : 0,
      username: String(member[columnNames.usernameColumn] ?? ''),
      phone: String(member[columnNames.phoneColumn] ?? ''),
      role: 'user',
    });

    // Create response
    const response = NextResponse.json({
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: member[columnNames.idColumn],
        username: member[columnNames.usernameColumn],
        phone: member[columnNames.phoneColumn] ?? null,
      },
      role: 'user',
      token,
    });

    // Set httpOnly cookie for security
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND'
    ) {
      console.error('Database connection error:', error.message);
      return NextResponse.json(
        { error: 'خطا در اتصال به دیتابیس. لطفا تنظیمات دیتابیس را بررسی کنید.' },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Members login error:', error);
    return NextResponse.json(
      { error: 'خطا در ورود اعضا' },
      { status: 500 }
    );
  }
}
