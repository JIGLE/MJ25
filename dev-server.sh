#!/bin/bash

# MJ25 Development Environment with Docker
# This script runs the wedding website development server using Docker

echo "🚀 Starting MJ25 Wedding Website Development Server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

PROJECT_DIR="/mnt/HDD/apps/nginx-proxy-manager/websites/mj25"

echo "📁 Working directory: $(pwd)"

# Create a development Dockerfile if it doesn't exist
if [ ! -f "Dockerfile.dev" ]; then
    echo "📝 Creating development Dockerfile..."
    cat > Dockerfile.dev << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev"]
EOF
fi

# Create development docker-compose if it doesn't exist
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "📝 Creating development docker-compose..."
    cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  mj25-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: mj25-dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    restart: unless-stopped
    stdin_open: true
    tty: true
EOF
fi

echo "🔨 Building and starting development environment..."

# Stop any existing development containers
docker-compose -f docker-compose.dev.yml down 2>/dev/null

# Build and start development container
docker-compose -f docker-compose.dev.yml up -d --build

# Wait a moment for the container to start
sleep 5

# Show container status
echo "📊 Container status:"
docker-compose -f docker-compose.dev.yml ps

# Show logs
echo "📋 Development server logs (last 20 lines):"
docker-compose -f docker-compose.dev.yml logs --tail=20

echo ""
echo "🎉 Development server is running!"
echo "📍 Access your wedding website at:"
echo "   • Local: http://localhost:5173"
echo "   • Network: http://$(hostname -I | awk '{print $1}'):5173"
echo ""
echo "💡 Useful commands:"
echo "   • View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   • Stop server: docker-compose -f docker-compose.dev.yml down"
echo "   • Restart: docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "🔄 The development server supports hot reloading - your changes will appear automatically!"
