#!/bin/bash
# Resolve failed migrations in production
cd /app/server || exit 1

echo "🔧 Resolving failed migrations..."
npx prisma migrate resolve --applied add_user_security_columns --schema ./prisma/schema.prisma || true

echo "🚀 Deploying pending migrations..."
npx prisma migrate deploy --schema ./prisma/schema.prisma

echo "✅ Migrations resolved and deployed"
