import fs from 'fs';
import path from 'path';

/**
 * Helper script to create a new migration file
 * 
 * Usage:
 * node -r esm app/services/create-migration.js migration_name
 * 
 * Example:
 * node -r esm app/services/create-migration.js add_settings_table
 */

function createMigration() {
  // Get migration name from command line
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Error: Migration name is required');
    console.log('Usage: node -r esm app/services/create-migration.js migration_name');
    process.exit(1);
  }
  
  const migrationName = args[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const migrationsPath = path.join(__dirname, 'migrations');
  
  // Make sure migrations directory exists
  if (!fs.existsSync(migrationsPath)) {
    fs.mkdirSync(migrationsPath, { recursive: true });
  }
  
  // Get existing migration files to determine next number
  const existingFiles = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  let nextNumber = 1;
  if (existingFiles.length > 0) {
    const lastFile = existingFiles[existingFiles.length - 1];
    const lastNumber = parseInt(lastFile.split('_')[0], 10);
    nextNumber = lastNumber + 1;
  }
  
  // Format the number with leading zeros
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  const filename = `${paddedNumber}_${migrationName}.sql`;
  const filepath = path.join(migrationsPath, filename);
  
  // Create migration file template
  const template = `-- Migration: ${paddedNumber}_${migrationName}
-- Description: [Add description here]

-- Write your SQL statements here

-- Record this migration
INSERT INTO migrations (name) VALUES ('${paddedNumber}_${migrationName}');`;
  
  // Write the file
  fs.writeFileSync(filepath, template);
  
  console.log(`Created new migration file: ${filename}`);
}

createMigration(); 