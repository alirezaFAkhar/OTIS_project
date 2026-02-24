import pool from '../lib/db';
import { hashPassword } from '../lib/auth';

/**
 * Initialize default admin user
 * 
 * Usage: npx tsx scripts/init-admin.ts
 * 
 * Environment variables:
 * - DEFAULT_ADMIN_USERNAME (default: 'admin')
 * - DEFAULT_ADMIN_PASSWORD (default: 'admin123')
 * - DEFAULT_TENANT_ID (default: 1)
 */
async function initAdmin() {
  try {
    const connection = await pool.getConnection();

    const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const tenantId = parseInt(process.env.DEFAULT_TENANT_ID || '1');

    // Check if admin already exists
    const [existingAdmins] = await connection.query(
      'SELECT * FROM tenant_admins WHERE username = ? AND tenant_id = ?',
      [defaultUsername, tenantId]
    ) as any[];

    if (existingAdmins.length > 0) {
      console.log(`Admin user "${defaultUsername}" already exists for tenant ${tenantId}`);
      connection.release();
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(defaultPassword);

    // Create admin
    await connection.query(
      `INSERT INTO tenant_admins (tenant_id, username, password, email, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, defaultUsername, hashedPassword, null, true]
    );

    console.log('✅ Default admin created successfully!');
    console.log(`   Username: ${defaultUsername}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(`   Tenant ID: ${tenantId}`);
    console.log('\n⚠️  Please change the default password after first login!');

    connection.release();
  } catch (error: any) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initAdmin()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default initAdmin;


