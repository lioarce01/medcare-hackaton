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

# Verify NestJS CLI
echo "Verifying NestJS CLI..."
ls -la node_modules/.bin/nest || echo "NestJS CLI not found in .bin"
which nest || echo "NestJS CLI not found globally"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build with explicit path
echo "Building application..."
if [ -f "node_modules/.bin/nest" ]; then
    echo "Using local NestJS CLI..."
    ./node_modules/.bin/nest build
else
    echo "Using npx nest..."
    npx nest build
fi

echo "=== Build Process Completed ===" 