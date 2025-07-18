#!/bin/bash

# MJ25 Repository Migration Script
# This script will push all current changes to https://github.com/JIGLE/MJ25

echo "🚀 Starting MJ25 repository migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Fix Git configuration for this environment
echo "🔧 Configuring Git for TrueNAS environment..."
git config --global --add safe.directory "$(pwd)"
git config --global init.defaultBranch main
git config --global user.name "JIGLE"
git config --global user.email "contact@jigle.dev"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add the remote repository if not already added
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/JIGLE/MJ25.git
else
    echo "✅ Git remote already configured"
fi

# Fetch from origin to check if repository exists
echo "📥 Fetching from GitHub..."
git fetch origin main --depth=1 2>/dev/null || echo "ℹ️  Repository might be empty or this is the first push"

# Stage all files
echo "📁 Staging all files..."
git add .

# Check if there are any changes to commit (compatible with older git)
if git status --porcelain | grep -q "^[AM]"; then
    echo "💾 Committing changes..."
    git commit -m "Complete migration: TrueNAS SCALE app with CI/CD

✨ Features Added:
- Custom TrueNAS SCALE Helm chart for Kubernetes deployment
- GitHub Actions CI/CD pipeline with automated Docker builds
- Restored package.json with network-friendly development scripts
- Comprehensive documentation (README.md, MIGRATION.md)
- Optimized for SMB-mounted development environment
- Container registry integration (GitHub Container Registry)

🔧 Technical Improvements:
- Health checks and auto-restart capabilities
- Persistent storage configuration
- Resource limits and scaling options
- Professional deployment workflow
- Git-based version control

💒 Project: Marlene & Jose's Wedding Website
🏗️  Tech Stack: React + Vite + Firebase + Docker + Kubernetes"
else
    echo "ℹ️  No changes to commit"
fi

# Ensure we're on main branch
git checkout main 2>/dev/null || git checkout -b main

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git ls-remote origin main > /dev/null 2>&1; then
    # Repository has existing main branch
    git push origin main
else
    # First push to empty repository
    git push -u origin main
fi

echo ""
echo "🎉 Migration completed successfully!"
echo "📍 Repository URL: https://github.com/JIGLE/MJ25"
echo ""
echo "🔄 Next steps:"
echo "1. Go to GitHub and enable Actions (if not already enabled)"
echo "2. Configure TrueNAS custom app using the Helm chart"
echo "3. Set up local development: git clone https://github.com/JIGLE/MJ25.git"
echo ""
echo "💡 Your wedding website is now ready for professional deployment! 💒"
