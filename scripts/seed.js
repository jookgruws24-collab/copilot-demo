const { seedDatabase } = require('./lib/db/seed');

console.log('Starting database seed...\n');

try {
  seedDatabase();
  process.exit(0);
} catch (error) {
  console.error('Seed failed:', error);
  process.exit(1);
}
