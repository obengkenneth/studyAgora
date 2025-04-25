const migrator = require('./app/services/db-migrator');

// Run the migrations
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