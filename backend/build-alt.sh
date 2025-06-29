#!/bin/bash

# Exit on any error
set -e

echo "Starting build process..."

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Clean previous installations
echo "Cleaning previous installations..."
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps flag
echo "Installing dependencies..."
npm install --legacy-peer-deps --verbose

# Install NestJS CLI globally if not available
echo "Ensuring NestJS CLI is available..."
if ! command -v nest &> /dev/null; then
    echo "Installing NestJS CLI globally..."
    npm install -g @nestjs/cli
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application using npx
echo "Building the application..."
npx nest build --webpack false

echo "Build completed successfully!" 