#!/bin/bash

# Quick Fix Deploy Script for mj25 on TrueNAS SCALE
# This script performs a rapid deployment without full rebuild
echo "🚀 Quick Fix Deploy for mj25..."

# Set variables
PROJECT_PATH="/mnt/HDD/apps/nginx-proxy-manager/websites/mj25"
CONTAINER_NAME="mj25-app"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root or with sudo"
  exit 1
fi

# Navigate to project directory
cd "$PROJECT_PATH" || { echo "❌ Project directory not found"; exit 1; }

echo "📁 Working in: $(pwd)"

# Quick container restart (no rebuild)
echo "🔄 Quick restarting container..."
docker-compose restart

# Wait for container to be ready
echo "⏳ Waiting for container to start..."
sleep 15

# Check container status
echo "📊 Container status:"
docker-compose ps

# Check if service is responding
echo "🔍 Checking service health..."
if curl -f http://localhost:30080 > /dev/null 2>&1; then
    echo "✅ Service is responding on port 30080"
else
    echo "⚠️  Service may not be ready yet, checking logs..."
    docker-compose logs --tail=20
fi

echo "🎉 Quick fix deploy completed!"
echo "💡 Access your site at: http://your-truenas-ip:30080"