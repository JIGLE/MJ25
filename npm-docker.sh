#!/bin/bash

# Docker-based NPM runner for TrueNAS SCALE
# Usage: ./npm-docker.sh <npm-command>
# Examples: 
#   ./npm-docker.sh install
#   ./npm-docker.sh run build
#   ./npm-docker.sh run lint

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <npm-command>"
    echo "Examples:"
    echo "  $0 install"
    echo "  $0 run build"
    echo "  $0 run lint"
    echo "  $0 run dev"
    exit 1
fi

echo "🐳 Running npm $@ via Docker..."

# Run npm command in Docker container
docker run --rm \
    -v "$(pwd)":/app \
    -w /app \
    -p 5173:5173 \
    node:20-alpine \
    npm "$@"
