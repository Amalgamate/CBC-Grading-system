#!/bin/bash
# Quick migration verification script for Railway
cd /app/server || exit 1

echo "🔍 Checking Prisma setup..."
npx prisma validate

echo "🚀 Running migrations..."
npx prisma migrate deploy --schema ./prisma/schema.prisma

echo "✅ Migrations complete"
