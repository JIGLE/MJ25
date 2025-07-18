#!/bin/bash

# MJ25 Repository Migration Script
# This script will push all current changes to https://github.com/JIGLE/MJ25

echo "🚀 Starting MJ25 repository migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js is not installed. Installing Node.js..."
    echo "📦 Updating package list..."
    sudo apt update
    echo "📦 Installing Node.js and npm..."
    sudo apt install -y nodejs npm
    echo "✅ Node.js installation completed"
    node --version
    npm --version
else
    echo "✅ Node.js is already installed: $(node --version)"
fi

echo ""
echo "🔐 AUTHENTICATION REQUIRED:"
echo "GitHub no longer supports password authentication for HTTPS URLs."
echo "You need to either:"
echo "1. Use a Personal Access Token as your password when prompted"
echo "2. Set up SSH authentication"
echo ""
echo "📖 See MIGRATION.md for detailed authentication setup instructions"
echo ""
read -p "Press Enter when you have set up authentication..."

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
echo "🔄 Setting up main branch..."
git checkout main 2>/dev/null || git checkout -b main

# Handle existing remote content
echo "� Checking for existing remote content..."
if git ls-remote origin main > /dev/null 2>&1; then
    echo "📋 Remote repository has existing content"
    echo "Choose how to handle existing content:"
    echo "1) Merge with existing content (safe)"
    echo "2) Replace all existing content (⚠️  destructive)"
    echo "3) Cancel and review manually"
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            echo "🔄 Merging with existing content..."
            git pull origin main --allow-unrelated-histories
            if [ $? -ne 0 ]; then
                echo "⚠️  Merge conflicts detected. Please resolve manually:"
                echo "1. Edit conflicted files"
                echo "2. Run: git add ."
                echo "3. Run: git commit -m 'Resolve merge conflicts'"
                echo "4. Run: git push origin main"
                exit 1
            fi
            git push origin main
            ;;
        2)
            echo "⚠️  WARNING: This will replace ALL existing content!"
            read -p "Are you sure? Type 'yes' to confirm: " confirm
            if [ "$confirm" = "yes" ]; then
                echo "🔄 Force pushing to replace existing content..."
                git push origin main --force
            else
                echo "❌ Operation cancelled"
                exit 1
            fi
            ;;
        3)
            echo "❌ Operation cancelled. You can manually resolve with:"
            echo "git pull origin main --allow-unrelated-histories"
            echo "# Resolve any conflicts, then:"
            echo "git push origin main"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Operation cancelled."
            exit 1
            ;;
    esac
else
    # First push to empty repository
    echo "📤 First push to empty repository..."
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
