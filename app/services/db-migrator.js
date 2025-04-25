const fs = require('fs');
const path = require('path');
const { supabase } = require('./supabase.cjs');

/**
 * Database migration utility for StudyAgora
 * 
 * This utility tracks and applies database migrations to keep the schema up-to-date.
 * Migrations are SQL files stored in the migrations directory and are applied in
 * numerical order based on their filenames.
 * 
 * Usage:
 * 1. Create a new migration file in the migrations directory: 
 *    NNN_description.sql (where NNN is a sequence number)
 * 2. Run this script to apply new migrations:
 *    node app/services/db-migrator.js
 */

class DbMigrator {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.migrations = [];
  }

  /**
   * Initializes the migrations table if it doesn't exist
   */
  async initMigrationsTable() {
    try {
      // Check if migrations table exists
      const { error } = await supabase.from('migrations').select('id').limit(1);
      
      if (error && error.code === '42P01') { // Table doesn't exist
        console.log('Creating migrations table...');
        const sql = `
          CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', { sql });
        if (createError) {
          throw createError;
        }
      } else if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error initializing migrations table:', error.message);
      throw error;
    }
  }

  /**
   * Gets a list of all applied migrations from the database
   */
  async getAppliedMigrations() {
    try {
      const { data, error } = await supabase
        .from('migrations')
        .select('name')
        .order('id', { ascending: true });
      
      if (error) throw error;
      
      return data.map(migration => migration.name);
    } catch (error) {
      console.error('Error fetching applied migrations:', error.message);
      return [];
    }
  }

  /**
   * Gets a list of all migration files from the migrations directory
   */
  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort by filename
      
      return files;
    } catch (error) {
      console.error('Error reading migration files:', error.message);
      return [];
    }
  }

  /**
   * Applies a single migration
   */
  async applyMigration(filename) {
    const filepath = path.join(this.migrationsPath, filename);
    const migrationName = filename.replace('.sql', '');
    
    try {
      console.log(`Applying migration: ${migrationName}`);
      
      // Read and execute the migration file
      const sqlContent = fs.readFileSync(filepath, 'utf8');
      
      // Split into statements and execute
      const statements = sqlContent
        .split(';')
        .filter(statement => statement.trim().length > 0)
        .map(statement => statement.trim() + ';');
      
      for (const statement of statements) {
        // Skip the migration recording statement, as we'll do it ourselves
        if (statement.includes('INSERT INTO migrations') && 
            statement.includes(`VALUES ('${migrationName}')`)) {
          continue;
        }
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('Error executing SQL statement:', error.message);
          console.error('Statement:', statement);
          throw error;
        }
      }
      
      // Record the migration
      const { error } = await supabase
        .from('migrations')
        .insert({ name: migrationName });
      
      if (error) throw error;
      
      console.log(`Migration ${migrationName} applied successfully`);
      return true;
    } catch (error) {
      console.error(`Error applying migration ${migrationName}:`, error.message);
      return false;
    }
  }

  /**
   * Runs all pending migrations
   */
  async runMigrations() {
    try {
      console.log('Starting database migrations...');
      
      // Initialize migrations table if needed
      await this.initMigrationsTable();
      
      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      console.log('Applied migrations:', appliedMigrations.length ? appliedMigrations : 'None');
      
      // Get all migration files
      const migrationFiles = await this.getMigrationFiles();
      console.log('Found migration files:', migrationFiles);
      
      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        file => !appliedMigrations.includes(file.replace('.sql', ''))
      );
      
      if (pendingMigrations.length === 0) {
        console.log('No pending migrations found.');
        return true;
      }
      
      console.log('Pending migrations:', pendingMigrations);
      
      // Apply pending migrations
      for (const migration of pendingMigrations) {
        const success = await this.applyMigration(migration);
        if (!success) {
          console.error(`Migration failed: ${migration}`);
          return false;
        }
      }
      
      console.log('All migrations applied successfully!');
      return true;
    } catch (error) {
      console.error('Migration process failed:', error.message);
      return false;
    }
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const migrator = new DbMigrator();
  migrator.runMigrations()
    .then(success => {
      if (success) {
        console.log('Migration process completed successfully');
      } else {
        console.error('Migration process failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error during migration:', error);
      process.exit(1);
    });
}

module.exports = new DbMigrator(); 