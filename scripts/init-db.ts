import { runMigrations } from '../lib/db/migrate';
import { getDatabase } from '../lib/db/client';
import { hashPasswordSync } from '../lib/auth/password';

console.log('🔄 Initializing database for production...\n');

try {
  console.log('Running migrations...');
  runMigrations();
  
  // Create default admin user
  console.log('\nCreating default admin user...');
  const db = getDatabase();
  
  // Check if admin already exists
  const existingAdmin = db
    .prepare('SELECT id FROM employees WHERE email = ?')
    .get('admin@company.com');
  
  if (!existingAdmin) {
    db.prepare(
      `INSERT INTO employees (employee_id, name, email, password_hash, contact, address, role, diamond_balance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      'ADMIN001',
      'System Administrator',
      'admin@company.com',
      hashPasswordSync('admin123'),
      '+1-555-0100',
      'Admin Office',
      'admin',
      0
    );
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  IMPORTANT: Change this password after first login!');
  } else {
    console.log('ℹ️  Admin user already exists, skipping creation');
  }
  
  console.log('\n✅ Database initialized successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Database initialization failed:', error);
  process.exit(1);
}
