#!/bin/bash
# LunchPick Setup Script
# Run this once to install dependencies, set up the database, and seed data

set -e

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

echo "🌱 Seeding database with restaurants and demo data..."
npx tsx prisma/seed.ts

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Start the dev server with:"
echo "   npm run dev"
echo ""
echo "🎉 Then open http://localhost:3000"
echo "   Click 'Load Demo Event' to see 18 participants + 12 restaurants immediately!"
