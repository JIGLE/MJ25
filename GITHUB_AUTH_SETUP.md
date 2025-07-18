# GitHub Authentication Setup Guide

## 🔐 Quick Authentication Setup for MJ25 Migration

Since GitHub removed password authentication, you need to set up proper authentication before running the migration.

### Option 1: Personal Access Token (Recommended)

1. **Go to GitHub**:
   - Navigate to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"

2. **Configure Token**:
   - **Note**: `MJ25 Wedding Website Deployment`
   - **Expiration**: 90 days (or your preference)
   - **Scopes** (check these boxes):
     - ✅ `repo` - Full control of private repositories
     - ✅ `workflow` - Update GitHub Action workflows  
     - ✅ `write:packages` - Write packages to GitHub Package Registry

3. **Copy Token**:
   - Click "Generate token"
   - **⚠️ IMPORTANT**: Copy the token immediately (you won't see it again!)
   - Save it somewhere secure

4. **Use Token**:
   - When Git prompts for username: enter `JIGLE`
   - When Git prompts for password: enter your **token** (not your GitHub password)

### Option 2: SSH Authentication (Alternative)

```bash
# 1. Generate SSH key on TrueNAS
ssh-keygen -t ed25519 -C "contact@jigle.dev"

# 2. Copy the public key
cat ~/.ssh/id_ed25519.pub

# 3. Add to GitHub:
# - Go to: https://github.com/settings/ssh
# - Click "New SSH key"
# - Paste the public key content

# 4. Update git remote to use SSH
cd /mnt/HDD/apps/nginx-proxy-manager/websites/mj25
git remote set-url origin git@github.com:JIGLE/MJ25.git
```

## 🚀 After Authentication Setup

Once you've set up authentication, run the migration:

```bash
cd /mnt/HDD/apps/nginx-proxy-manager/websites/mj25
chmod +x migrate-to-git.sh
./migrate-to-git.sh
```

## 🔍 Testing Authentication

Test if your authentication works:

```bash
# For HTTPS (with token)
git ls-remote https://github.com/JIGLE/MJ25.git

# For SSH
git ls-remote git@github.com:JIGLE/MJ25.git
```

If these commands work without errors, your authentication is set up correctly!

---

**Need Help?** See the full `MIGRATION.md` for detailed troubleshooting steps.
