#!/bin/bash

# Deploy script for mj25 on TrueNAS SCALE
echo "🚀 Deploying mj25 to TrueNAS SCALE..."

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

echo "📁 Current directory: $(pwd)"

# Create data directory if it doesn't exist
echo "📁 Creating data directory..."
mkdir -p "$PROJECT_PATH/data"

# Set proper permissions
echo "🔐 Setting permissions..."
chown -R 1000:1000 "$PROJECT_PATH"
chmod -R 755 "$PROJECT_PATH"

# Stop existing container if running
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build and start
echo "🔨 Building and starting container..."
docker-compose up -d --build

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 30

# Check container status
echo "📊 Container status:"
docker-compose ps

# Check if port is accessible
echo "🧪 Testing application..."
if curl -f -s http://localhost:30080 > /dev/null; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access your app at: http://192.168.87.148:30080"
    echo "🌐 Or configure Cloudflare to point to: 192.168.87.148:30080"
else
    echo "❌ Application test failed. Checking logs..."
    docker-compose logs mj25
fi

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20 mj25

echo "🎉 Deployment script complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Test the app: http://192.168.87.148:30080"
echo "   2. Configure Cloudflare DNS to point to your TrueNAS IP"
echo "   3. Set up SSL in Cloudflare (Full or Full Strict mode)"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose logs -f mj25"
echo "   - Restart: docker-compose restart mj25"
echo "   - Stop: docker-compose down"
echo "   - Rebuild: docker-compose up -d --build"
