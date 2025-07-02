#!/bin/bash

set -e

echo "=== Render Build Process Started ==="

# Set environment
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Clean install
echo "Cleaning and installing dependencies..."
rm -rf node_modules package-lock.json
npm install --production=false

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Clean dist directory
echo "Cleaning dist directory..."
rm -rf dist

# Build using npm script
echo "Building application..."
npm run build

# Verify build output
echo "Verifying build output..."
if [ -f "dist/main.js" ]; then
    echo "✅ dist/main.js found successfully"
    echo "File size: $(ls -lh dist/main.js | awk '{print $5}')"
else
    echo "❌ dist/main.js not found!"
    echo "Contents of dist directory:"
    ls -la dist/ || echo "dist directory does not exist"
    exit 1
fi

echo "=== Build Process Completed ===" 