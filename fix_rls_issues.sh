#!/bin/bash

# Set error handling
set -e

echo "Starting RLS fixes for course content upload issues"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create it with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  exit 1
fi

# Run the fixes script
echo "Running RLS and bucket policy fixes..."
node run_rls_fixes.js

echo "All fixes completed!"
echo "You should now be able to upload course content without RLS errors." 