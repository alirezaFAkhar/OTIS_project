import { loadEnvConfig } from '@next/env';

// Load .env* files before importing db module so DB_CLIENT/DB_* are applied.
loadEnvConfig(process.cwd());

async function main() {
  try {
    const { initDatabase } = await import('../lib/db');
    await initDatabase();
    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();




