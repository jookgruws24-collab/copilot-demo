import { runMigrations } from '../lib/db/migrate';

console.log('🔄 Initializing database for production...\n');

try {
  console.log('Running migrations...');
  runMigrations();
  
  console.log('\n✅ Database initialized successfully!');
  console.log('ℹ️  To seed with test data, run: npm run db:seed');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Database initialization failed:', error);
  process.exit(1);
}
