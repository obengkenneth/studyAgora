import migrator from './db-migrator';

/**
 * This script sets up the database by running all migrations.
 * 
 * Run this script with:
 * npm run db:migrate
 * 
 * This will create all necessary tables, indexes, and functions in your Supabase database.
 */

console.log('Setting up the database using migrations...');

migrator.runMigrations()
  .then(success => {
    if (success) {
      console.log('Database setup completed successfully!');
    } else {
      console.error('Database setup failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error during database setup:', error.message);
    process.exit(1);
  }); 