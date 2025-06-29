#!/bin/bash

# Exit on any error
set -e

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Clear npm cache and node_modules if they exist
echo "Cleaning previous installations..."
rm -rf node_modules package-lock.json

# Install dependencies with verbose output
echo "Installing dependencies..."
npm install --verbose

# Verify NestJS CLI is installed
echo "Verifying NestJS CLI installation..."
if [ ! -f "./node_modules/@nestjs/cli/bin/nest.js" ]; then
    echo "ERROR: NestJS CLI not found. Installing it explicitly..."
    npm install @nestjs/cli --save-dev
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building the application..."
npm run build:prod

echo "Build completed successfully!" 