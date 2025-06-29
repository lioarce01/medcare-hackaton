#!/bin/bash

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Build the application
echo "Building the application..."
npm run build:prod

echo "Build completed successfully!" 