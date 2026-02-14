#!/bin/bash
# Full database reset script for production
# WARNING: This will DELETE all data!

set -e

cd /app/server || exit 1

echo "🚨 FULL DATABASE RESET 🚨"
echo "This will DELETE all existing data!"
echo ""

# Drop and recreate database
echo "🔄 Resetting database schema..."
npx prisma migrate reset --force --schema ./prisma/schema.prisma

echo ""
echo "✅ Database reset complete!"
echo "✅ All migrations applied"
echo "✅ Database is fresh and ready"
echo ""
echo "ℹ️  To seed initial data, run: npm run seed"
