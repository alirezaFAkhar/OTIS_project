import mysql from 'mysql2/promise';
import sql from 'mssql';

// Determine which database client to use
const dbClient = (process.env.DB_CLIENT || 'mysql').toLowerCase();

let pool: any;

if (dbClient === 'mssql') {
  // MSSQL Connection Pool
  const mssqlConfig: sql.config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'otis_db',
    user: process.env.DB_LOGIN_NAME || 'sa',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  pool = new sql.ConnectionPool(mssqlConfig);
  
  // Connect to MSSQL - ensure connection is established
  (async () => {
    try {
      await pool.connect();
      console.log('MSSQL connection pool established');
    } catch (err: any) {
      console.error('MSSQL Connection Error:', err);
    }
  })();
} else {
  // MySQL Connection Pool
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'otis_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_LIMIT || '10'),
    queueLimit: 0,
  });
}

// Initialize database tables
export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create tenants table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        domain VARCHAR(255) UNIQUE,
        background_image_url VARCHAR(500),
        logo_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_subdomain (subdomain),
        INDEX idx_domain (domain)
      )
    `);

    // Create tenant_configs table for storing tenant-specific configurations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tenant_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        config_key VARCHAR(100) NOT NULL,
        config_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_tenant_config (tenant_id, config_key),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        INDEX idx_tenant_id (tenant_id)
      )
    `);

    // Create tenant_admins table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tenant_admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_tenant_admin (tenant_id, username),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        INDEX idx_tenant_id (tenant_id)
      )
    `);

    // Create users table with tenant_id
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        username VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_tenant_user (tenant_id, username),
        UNIQUE KEY unique_tenant_phone (tenant_id, phone),
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_username (username),
        INDEX idx_phone (phone)
      )
    `);

    // Create otp_codes table with tenant_id
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_phone (phone),
        INDEX idx_code (code),
        INDEX idx_expires_at (expires_at)
      )
    `);

    // Create transactions table for payment transactions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        bank_id VARCHAR(50),
        bank_name VARCHAR(255),
        status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
        authority VARCHAR(255),
        ref_id VARCHAR(255),
        gateway_response TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_tenant_id (tenant_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_authority (authority),
        INDEX idx_ref_id (ref_id),
        INDEX idx_created_at (created_at)
      )
    `);

    connection.release();
    console.log('Database initialized successfully with multi-tenant support');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export default pool;



