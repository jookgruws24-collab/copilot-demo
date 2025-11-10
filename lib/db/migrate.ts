import fs from 'fs';
import path from 'path';
import { getDatabase } from './client';

const MIGRATIONS_DIR = path.join(process.cwd(), 'lib', 'db', 'migrations');

export function runMigrations(): void {
  const db = getDatabase();

  // Check if schema_version table exists
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
    )
    .get();

  let currentVersion = 0;

  if (tableExists) {
    const result = db
      .prepare('SELECT MAX(version) as v FROM schema_version')
      .get() as { v: number | null };
    currentVersion = result?.v || 0;
  }

  console.log(`Current database schema version: ${currentVersion}`);

  // Get all migration files
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('No migrations directory found, skipping migrations');
    return;
  }

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('No migration files found');
    return;
  }

  // Run pending migrations
  for (const file of migrationFiles) {
    const version = parseInt(file.split('_')[0], 10);

    if (version > currentVersion) {
      console.log(`Applying migration ${file}...`);

      const migrationSQL = fs.readFileSync(
        path.join(MIGRATIONS_DIR, file),
        'utf-8'
      );

      try {
        // Execute migration in a transaction
        db.transaction(() => {
          db.exec(migrationSQL);
        })();

        console.log(`✓ Migration ${file} applied successfully`);
      } catch (error) {
        console.error(`✗ Migration ${file} failed:`, error);
        throw error;
      }
    }
  }

  // Get final version
  const finalResult = db
    .prepare('SELECT MAX(version) as v FROM schema_version')
    .get() as { v: number };

  console.log(`Database schema is now at version: ${finalResult.v}`);
}

// Function to check if database is initialized
export function isDatabaseInitialized(): boolean {
  const db = getDatabase();
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
    )
    .get();
  return !!tableExists;
}

// Auto-run migrations is disabled for build compatibility
// Run migrations manually with: npx tsx scripts/setup-db.ts
// Or call runMigrations() explicitly in your application code
