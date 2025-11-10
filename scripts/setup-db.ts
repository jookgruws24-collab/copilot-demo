import { runMigrations } from '../lib/db/migrate';
import { seedDatabase } from '../lib/db/seed';

console.log('🚀 Setting up database...\n');

try {
  console.log('Running migrations...');
  runMigrations();
  
  console.log('\n');
  seedDatabase();
  
  console.log('\n✅ Database setup complete!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Database setup failed:', error);
  process.exit(1);
}
