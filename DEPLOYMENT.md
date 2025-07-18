# MJ25 Docker Deployment Guide

## Quick Deployment

Your Docker setup is now complete! Here's how to deploy:

### 1. SSH into TrueNAS
```bash
ssh truenas_admin@192.168.87.148
```

### 2. Navigate to project directory
```bash
cd /mnt/HDD/apps/nginx-proxy-manager/websites/mj25
```

### 3. Run the deployment script
```bash
sudo chmod +x deploy-truenas.sh
sudo ./deploy-truenas.sh
```

### 4. Or deploy manually
```bash
# Set permissions
sudo chown -R 1000:1000 /mnt/HDD/apps/nginx-proxy-manager/websites/mj25
sudo chmod -R 755 /mnt/HDD/apps/nginx-proxy-manager/websites/mj25

# Build and start
sudo docker-compose up -d --build

# Check status
sudo docker-compose ps
sudo docker-compose logs -f mj25
```

## Access Your Application

- **Local access**: http://192.168.87.148:30080
- **Network access**: http://your-truenas-ip:30080

## Cloudflare Configuration

1. **DNS Setup**:
   - Add A record pointing to `192.168.87.148`
   - Or use CNAME to your dynamic DNS

2. **SSL Settings**:
   - Set SSL/TLS mode to "Full" or "Full (Strict)"
   - Enable "Always Use HTTPS"

3. **Port Configuration**:
   - If using Cloudflare proxy, add custom port 30080 in Page Rules
   - Or set up a Cloudflare Tunnel for secure access

## Useful Commands

```bash
# View logs
sudo docker-compose logs -f mj25

# Restart container
sudo docker-compose restart mj25

# Stop containers
sudo docker-compose down

# Rebuild and restart
sudo docker-compose up -d --build

# Check container stats
sudo docker stats mj25-app

# Access container shell (for debugging)
sudo docker exec -it mj25-app sh
```

## Troubleshooting

### Container won't start
```bash
# Check logs
sudo docker-compose logs mj25

# Check if port is in use
sudo netstat -tlnp | grep 30080

# Remove containers and rebuild
sudo docker-compose down
sudo docker system prune -f
sudo docker-compose up -d --build
```

### Build fails
```bash
# Check if all files are present
ls -la /mnt/HDD/apps/nginx-proxy-manager/websites/mj25/

# Verify package.json exists
cat package.json

# Manual build test
sudo docker build -t mj25-test .
```

### Application not accessible
```bash
# Test from TrueNAS
curl http://localhost:30080

# Check firewall
sudo ufw status

# Check if nginx is running inside container
sudo docker exec mj25-app ps aux
```

## Files Overview

- `Dockerfile` - Multi-stage build with Node.js and Nginx
- `docker-compose.yml` - Container orchestration
- `.dockerignore` - Files to exclude from build
- `.env.production` - Production environment variables
- `deploy-truenas.sh` - Automated deployment script

## Container Architecture

1. **Build Stage**: Uses Node.js 20 Alpine to build Vite app
2. **Runtime Stage**: Uses Nginx Alpine to serve static files
3. **Port**: Container runs on port 80, mapped to host port 30080
4. **Health Check**: Automatic health monitoring
5. **Networking**: Isolated Docker network for security
