#!/bin/bash

# Local Docker Hub Deploy Script
# This script mimics the GitHub Actions workflow for local deployment

echo "🚀 Building and deploying MJ25 to Docker Hub..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Get Docker Hub credentials
if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo "Enter your Docker Hub username:"
    read -r DOCKERHUB_USERNAME
fi

if [ -z "$DOCKERHUB_TOKEN" ]; then
    echo "Enter your Docker Hub access token (or password):"
    read -rs DOCKERHUB_TOKEN
    echo ""
fi

IMAGE_NAME="docker.io/$DOCKERHUB_USERNAME/mj25"
TAG="latest"

echo "📦 Installing dependencies..."
npm ci || npm install

echo "🔍 Running lint (non-blocking)..."
npm run lint || echo "Linting failed, continuing..."

echo "🏗️  Building project..."
npm run build

echo "🐳 Building Docker image..."
docker build -t "$IMAGE_NAME:$TAG" .

echo "🔐 Logging in to Docker Hub..."
echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

echo "📤 Pushing image to Docker Hub..."
docker push "$IMAGE_NAME:$TAG"

echo "✅ Successfully pushed $IMAGE_NAME:$TAG to Docker Hub!"
echo "💡 You can now pull and run the image with:"
echo "   docker run -p 3000:3000 $IMAGE_NAME:$TAG"