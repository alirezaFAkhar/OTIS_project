import pool from './db';

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  domain: string | null;
  background_image_url: string | null;
  logo_url: string | null;
  is_active: boolean;
}

export interface TenantConfig {
  id: number;
  tenant_id: number;
  config_key: string;
  config_value: string | null;
}

/**
 * Get tenant by subdomain
 */
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  try {
    const connection = await pool.getConnection();
    const [tenants] = await connection.query(
      'SELECT * FROM tenants WHERE subdomain = ? AND is_active = TRUE',
      [subdomain]
    ) as Tenant[];
    connection.release();
    return tenants.length > 0 ? tenants[0] : null;
  } catch (error) {
    console.error('Error getting tenant by subdomain:', error);
    return null;
  }
}

/**
 * Get tenant by domain
 */
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  try {
    const connection = await pool.getConnection();
    const [tenants] = await connection.query(
      'SELECT * FROM tenants WHERE domain = ? AND is_active = TRUE',
      [domain]
    ) as Tenant[];
    connection.release();
    return tenants.length > 0 ? tenants[0] : null;
  } catch (error) {
    console.error('Error getting tenant by domain:', error);
    return null;
  }
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: number): Promise<Tenant | null> {
  try {
    const connection = await pool.getConnection();
    const [tenants] = await connection.query(
      'SELECT * FROM tenants WHERE id = ? AND is_active = TRUE',
      [tenantId]
    ) as Tenant[];
    connection.release();
    return tenants.length > 0 ? tenants[0] : null;
  } catch (error) {
    console.error('Error getting tenant by ID:', error);
    return null;
  }
}

/**
 * Get tenant from request (by subdomain or domain)
 */
export async function getTenantFromRequest(host: string): Promise<Tenant | null> {
  // Extract subdomain or domain from host
  const parts = host.split('.');
  
  // If it's localhost or IP, return default tenant (you can modify this)
  if (host.includes('localhost') || host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    // For development, you might want to use a default tenant
    // Or you can use a header like X-Tenant-ID
    return null;
  }

  // Try subdomain first (e.g., client1.example.com -> client1)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const tenant = await getTenantBySubdomain(subdomain);
    if (tenant) return tenant;
  }

  // Try full domain
  const tenant = await getTenantByDomain(host);
  if (tenant) return tenant;

  return null;
}

/**
 * Get tenant config value
 */
export async function getTenantConfig(
  tenantId: number,
  configKey: string
): Promise<string | null> {
  try {
    const connection = await pool.getConnection();
    const [configs] = await connection.query(
      'SELECT config_value FROM tenant_configs WHERE tenant_id = ? AND config_key = ?',
      [tenantId, configKey]
    ) as TenantConfig[];
    connection.release();
    return configs.length > 0 ? configs[0].config_value : null;
  } catch (error) {
    console.error('Error getting tenant config:', error);
    return null;
  }
}

/**
 * Set tenant config value
 */
export async function setTenantConfig(
  tenantId: number,
  configKey: string,
  configValue: string
): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    if ((process.env.DB_CLIENT || 'mysql').toLowerCase() === 'mssql') {
      await connection.query(
        `MERGE tenant_configs AS target
         USING (SELECT ? AS tenant_id, ? AS config_key, ? AS config_value) AS source
         ON target.tenant_id = source.tenant_id AND target.config_key = source.config_key
         WHEN MATCHED THEN
           UPDATE SET config_value = source.config_value, updated_at = GETDATE()
         WHEN NOT MATCHED THEN
           INSERT (tenant_id, config_key, config_value) VALUES (source.tenant_id, source.config_key, source.config_value);`,
        [tenantId, configKey, configValue]
      );
    } else {
      await connection.query(
        `INSERT INTO tenant_configs (tenant_id, config_key, config_value) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_at = CURRENT_TIMESTAMP`,
        [tenantId, configKey, configValue]
      );
    }
    connection.release();
    return true;
  } catch (error) {
    console.error('Error setting tenant config:', error);
    return false;
  }
}

/**
 * Get all tenant configs
 */
export async function getAllTenantConfigs(tenantId: number): Promise<Record<string, string>> {
  try {
    const connection = await pool.getConnection();
    const [configs] = await connection.query(
      'SELECT config_key, config_value FROM tenant_configs WHERE tenant_id = ?',
      [tenantId]
    ) as TenantConfig[];
    connection.release();
    
    const result: Record<string, string> = {};
    configs.forEach(config => {
      result[config.config_key] = config.config_value || '';
    });
    return result;
  } catch (error) {
    console.error('Error getting all tenant configs:', error);
    return {};
  }
}

