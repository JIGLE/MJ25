# MJ25 Wedding Website - Git Migration Guide

This guide will help you migrate from SMB-hosted development to a proper Git-based workflow with custom TrueNAS SCALE app deployment.

## 🎯 Overview

We're moving from:
- ❌ SMB-mounted development (`\\TRUENAS\websites\mj25`)
- ❌ Manual Docker deployments
- ❌ No version control

To:
- ✅ Git-based development with GitHub/GitLab
- ✅ Automated CI/CD pipeline
- ✅ Custom TrueNAS SCALE app
- ✅ Container registry deployment

## 📋 Migration Steps

### 1. Prepare Existing Repository

Your repository is already set up at: `https://github.com/JIGLE/MJ25`

### 2. Set up GitHub Authentication

Since GitHub removed password authentication, you need to set up proper authentication:

**Option A: Personal Access Token (Recommended for HTTPS)**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `write:packages` (Write packages to GitHub Package Registry)
3. Copy the token (you won't see it again!)
4. Use it as your password when pushing to Git

**Option B: SSH Key (Alternative)**

```bash
# Generate SSH key on TrueNAS
ssh-keygen -t ed25519 -C "contact@jigle.dev"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub → Settings → SSH and GPG keys → New SSH key
# Then use SSH URL: git@github.com:JIGLE/MJ25.git
```

### 3. Replace Repository Contents

From TrueNAS Shell or SSH, we'll replace all existing files:

```bash
# Navigate to your project
cd /mnt/HDD/apps/nginx-proxy-manager/websites/mj25

# Fix Git configuration for TrueNAS environment
git config --global --add safe.directory "$(pwd)"
git config --global init.defaultBranch main
git config --global user.name "JIGLE"
git config --global user.email "contact@jigle.dev"

# Clone your existing repository to a temporary location (optional backup)
git clone https://github.com/JIGLE/MJ25.git /tmp/mj25-backup

# Initialize git in current directory (if not already done)
git init
git branch -M main

# Add your existing repository as remote
git remote add origin https://github.com/JIGLE/MJ25.git

# Fetch existing repository
git fetch origin

# Create a new branch for the migration
git checkout -b migration-to-truenas-app

# Stage all current files for commit
git add .
git commit -m "Complete migration: Replace with TrueNAS app setup

- Added custom TrueNAS SCALE Helm chart
- Implemented CI/CD pipeline with GitHub Actions  
- Updated package.json with network-friendly scripts
- Added comprehensive documentation
- Restored missing index page and package.json
- Optimized for SMB-mounted development"

# Push the migration branch
git push -u origin migration-to-truenas-app

# Switch to main branch and merge (or create PR)
git checkout main
git merge migration-to-truenas-app
git push origin main
```

**Alternative Quick Method (if you want to completely replace everything):**

```bash
# Navigate to your project
cd /mnt/HDD/apps/nginx-proxy-manager/websites/mj25

# Fix Git configuration for TrueNAS environment
git config --global --add safe.directory "$(pwd)"
git config --global init.defaultBranch main

# Initialize git if needed
git init
git branch -M main

# Add git remote if not already added
git remote add origin https://github.com/JIGLE/MJ25.git

# Stage all files
git add .
git commit -m "Complete rewrite: TrueNAS SCALE app with CI/CD"

# Force push to replace everything (⚠️ This will overwrite repository history)
git push origin main --force
```

### 4. Set up GitHub Container Registry

1. Go to your GitHub repository: `https://github.com/JIGLE/MJ25`
2. Navigate to "Settings" → "Actions" → "General"
3. Enable "Actions permissions" 
4. In "Workflow permissions", select "Read and write permissions"
5. Enable "Allow GitHub Actions to create and approve pull requests"

### 5. Configure Secrets (Optional - for auto-deployment)

In your GitHub repository settings → "Secrets and variables" → "Actions":

```
TRUENAS_WEBHOOK_URL=http://your-truenas-ip:9000/webhook
TRUENAS_WEBHOOK_TOKEN=your-secret-token
```

### 6. Update Repository References

Update any references in the codebase to use your actual repository:

```bash
# Update Chart.yaml with your repository URL
sed -i 's|https://github.com/your-username/mj25-wedding|https://github.com/JIGLE/MJ25|g' charts/mj25-wedding/Chart.yaml

# Update README.md badges
sed -i 's|your-username/mj25-wedding|JIGLE/MJ25|g' README.md
```

### 7. Update TrueNAS Configuration

Replace the current setup with the custom app:

```bash
# Stop current deployment
cd /mnt/HDD/apps/nginx-proxy-manager/websites/mj25
docker-compose down

# Install the custom app through TrueNAS UI
# Apps → Discover Apps → Custom App
# Use the Helm chart from: charts/mj25-wedding/
```

### 8. Development Workflow

From now on, develop locally and push to Git:

```bash
# Clone repository for local development
git clone https://github.com/JIGLE/MJ25.git
cd MJ25

# Install dependencies
npm install

# Start development server
npm run dev

# Make changes, commit, and push
git add .
git commit -m "Feature: Add new wedding section"
git push origin main
```

## 🚀 Custom TrueNAS App Features

### App Configuration
- **Port**: 30080 (configurable)
- **Storage**: Persistent data volume
- **Resources**: 512Mi memory, 500m CPU limit
- **Health checks**: Automatic container monitoring
- **Auto-restart**: Container restart on failure

### Deployment Options
1. **Manual**: Push to Git → Manual redeploy through TrueNAS UI
2. **Webhook** (Advanced): Automatic deployment on Git push
3. **Scheduled**: Daily/weekly pulls of latest image

## 📁 New Project Structure

```
mj25-wedding/
├── .github/workflows/          # CI/CD pipelines
│   └── deploy.yml
├── charts/mj25-wedding/        # Helm chart for TrueNAS
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
├── src/                        # Your React application
├── public/                     # Static assets
├── docs/                       # Documentation
├── Dockerfile                  # Container configuration
├── docker-compose.yml          # Local development
├── package.json               # Dependencies
└── README.md                  # Project documentation
```

## 🔄 Benefits After Migration

1. **Version Control**: Track all changes, easy rollbacks
2. **Automated Builds**: Every push triggers build and test
3. **Container Registry**: Immutable deployments
4. **Scaling**: Easy to add staging/production environments
5. **Collaboration**: Multiple developers can contribute
6. **Backup**: Git serves as backup system
7. **Professional**: Industry-standard deployment practices

## 🆘 Troubleshooting

### Authentication Issues
```bash
# If you get "Authentication failed" error:
# 1. Make sure you're using a Personal Access Token (not password)
# 2. Token needs 'repo', 'workflow', and 'write:packages' permissions
# 3. Use token as password when Git prompts for credentials

# For SSH authentication:
ssh-keygen -t ed25519 -C "contact@jigle.dev"
cat ~/.ssh/id_ed25519.pub  # Add this to GitHub SSH keys
git remote set-url origin git@github.com:JIGLE/MJ25.git
```

### Build Failures
```bash
# Check GitHub Actions logs
# Go to your repository → Actions tab

# Local debugging
npm run lint
npm run build
```

### TrueNAS App Issues
```bash
# Check app logs through TrueNAS UI
# Apps → Installed Apps → mj25-wedding → Logs

# Or via CLI
kubectl logs -n ix-mj25-wedding deployment/mj25-wedding
```

### Migration Issues
```bash
# If you need to restart migration
git remote remove origin
git remote add origin https://github.com/your-username/new-repo.git
git push -u origin main --force
```

## 📞 Support

- Check the GitHub Issues tab for common problems
- Review TrueNAS SCALE documentation for custom apps
- Consult the Helm documentation for chart modifications

---

**Next Steps**: After migration, you'll have a professional, maintainable wedding website deployment! 🎉
