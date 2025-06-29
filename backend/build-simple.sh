#!/bin/bash

set -e

echo "=== Starting Build Process ==="

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Install dev dependencies for build
echo "Installing dev dependencies..."
npm install --only=dev

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build application
echo "Building application..."
npx nest build

echo "=== Build Completed Successfully ===" 