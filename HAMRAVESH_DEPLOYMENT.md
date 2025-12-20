# Deployment Guide for hamravesh.com

This is a step-by-step guide for deploying Mina Cafe on hamravesh.com platform.

## Step 1: Prepare Your Project

### 1.1 Prepare Files for Upload

Make sure your project is ready:

```bash
# Ensure all changes are committed
git status

# Create a deployment package (optional - you can also use git)
# Exclude unnecessary files
```

**Files you need to upload:**
- `docker-compose.yml`
- `backend/` directory (all files)
- `frontend/` directory (all files)
- `.env` file (create from `docker.env.example`)

**Files you DON'T need:**
- `node_modules/` (will be built in Docker)
- `.next/` (will be built in Docker)
- `.git/` (unless using git on server)

### 1.2 Create Production .env File

Copy `docker.env.example` to `.env` and update with production values:

```env
# Backend Configuration
PORT=4000

# Database - Use managed MongoDB (recommended) or container
# Option A: MongoDB Atlas or managed service
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mina-cafe?retryWrites=true&w=majority

# Option B: MongoDB Container (if using docker-compose)
# MONGODB_URI=mongodb://mongodb:27017/mina-cafe

# Security - Generate a strong secret
JWT_SECRET=<generate-strong-random-secret-here>

# Kavenegar SMS Service
KAVENEGAR_API_KEY=your-production-kavenegar-api-key

# Backend Base URL - Your production domain
BASE_URL=https://api.yourdomain.com
# Or if backend and frontend on same domain:
# BASE_URL=https://yourdomain.com

# Frontend Configuration
# Backend API URL - Must match your actual backend URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
# Or if backend and frontend on same domain:
# NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

## Step 2: Upload Files to hamravesh.com

### Method A: Using SSH (if available)

1. **Connect via SSH:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Navigate to your project directory:**
   ```bash
   cd /path/to/your/project
   ```

3. **Upload files** (from your local machine):
   ```bash
   # Using SCP
   scp -r backend frontend docker-compose.yml .env user@server:/path/to/project/
   
   # Or use SFTP client like FileZilla, WinSCP
   ```

### Method B: Using Git (Recommended)

1. **Push your code to Git repository:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **On hamravesh.com server, clone repository:**
   ```bash
   git clone your-repository-url
   cd mina-cafe
   ```

3. **Create .env file on server** (copy from docker.env.example and edit)

### Method C: Using hamravesh.com Control Panel

If hamravesh.com provides a file manager:
1. Log into control panel
2. Navigate to your project directory
3. Upload files via web interface

## Step 3: MongoDB Setup

### Option A: Managed MongoDB Service (Recommended)

**MongoDB Atlas (Free tier available):**

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier works fine)
3. Create database user
4. Whitelist your server IP (0.0.0.0/0 for testing, restrict later)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/mina-cafe?retryWrites=true&w=majority
   ```
6. Update `MONGODB_URI` in your `.env` file

### Option B: MongoDB Container

If you want to run MongoDB in Docker:

1. Include MongoDB in `docker-compose.yml` (already included)
2. Update `.env`:
   ```env
   MONGODB_URI=mongodb://mongodb:27017/mina-cafe
   ```

**Note:** For production, managed MongoDB is recommended for better reliability and backups.

## Step 4: Configure Docker on hamravesh.com

### 4.1 Check Docker Installation

SSH into your server and verify Docker:

```bash
docker --version
docker-compose --version
```

If not installed, install Docker and Docker Compose.

### 4.2 Update docker-compose.yml for Production

**Important:** For production, you may want to:

1. **Remove port mappings if using reverse proxy:**
   - If hamravesh.com uses a reverse proxy, you might not need to expose ports directly
   - Or use internal ports only

2. **Update ports in docker-compose.yml for production:**
   ```yaml
   backend:
     ports:
       - "4000:4000"  # Use standard ports in production
   
   frontend:
     ports:
       - "3000:3000"  # Use standard ports in production
   ```

## Step 5: Build and Deploy

### 5.1 Build Images

```bash
# Navigate to project directory
cd /path/to/mina-cafe

# Build all images
docker-compose build

# Or build specific service
docker-compose build backend
docker-compose build frontend
```

### 5.2 Start Services

```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### 5.3 Verify Deployment

```bash
# Check backend health
curl http://localhost:4000/api/health

# Check if containers are healthy
docker ps
```

## Step 6: Domain and Reverse Proxy Configuration

### Option A: Using hamravesh.com Reverse Proxy

If hamravesh.com provides reverse proxy configuration:

1. **Configure domain in hamravesh.com panel:**
   - Add your domain
   - Point it to your server IP

2. **Set up reverse proxy rules:**
   - Frontend: `yourdomain.com` → `localhost:3000`
   - Backend API: `api.yourdomain.com` → `localhost:4000`

### Option B: Using Nginx (if you have access)

Create Nginx configuration:

```nginx
# /etc/nginx/sites-available/mina-cafe

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable configuration:

```bash
sudo ln -s /etc/nginx/sites-available/mina-cafe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option C: SSL/HTTPS Setup

**Using Let's Encrypt (Certbot):**

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Certbot will automatically configure Nginx for HTTPS
```

Or configure in hamravesh.com panel if SSL is provided.

## Step 7: Update Environment Variables for Production

Make sure your `.env` file has the correct production URLs:

```env
# Use your actual domain
BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

**Important:** After changing `NEXT_PUBLIC_API_URL`, you MUST rebuild the frontend:

```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Step 8: Verify Everything Works

1. **Check backend:**
   ```bash
   curl https://api.yourdomain.com/api/health
   # Should return: {"status":"ok"}
   ```

2. **Check frontend:**
   - Visit `https://yourdomain.com`
   - Should load the application

3. **Test API endpoints:**
   ```bash
   curl https://api.yourdomain.com/api/categories
   ```

4. **Check logs for errors:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs mongodb
   ```

## Step 9: Set Up Auto-Start on Reboot

Make sure containers restart automatically:

```bash
# This is already configured in docker-compose.yml with:
# restart: unless-stopped

# Verify
docker-compose ps
```

## Step 10: Backup Strategy

### Backup MongoDB Data

**If using MongoDB Atlas:**
- Automatic backups are included
- Manual backup via Atlas dashboard

**If using MongoDB container:**
```bash
# Create backup
docker exec mina-cafe-mongodb mongodump --out /backup/$(date +%Y%m%d)

# Restore backup
docker exec -i mina-cafe-mongodb mongorestore /backup/YYYYMMDD
```

### Backup Uploaded Images

```bash
# Backup uploads volume
docker run --rm \
  -v mina-cafe_uploads_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
```

### Frontend can't connect to backend

1. **Verify NEXT_PUBLIC_API_URL is correct** in `.env`
2. **Rebuild frontend:**
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```
3. **Check backend is accessible:**
   ```bash
   curl http://localhost:4000/api/health
   ```

### MongoDB connection issues

1. **Check MongoDB is running:**
   ```bash
   docker-compose ps mongodb
   ```

2. **Verify MONGODB_URI** in `.env` is correct

3. **Test connection:**
   ```bash
   # If using container
   docker exec -it mina-cafe-mongodb mongosh
   
   # If using Atlas, check connection string format
   ```

### Image upload issues

1. **Check uploads volume:**
   ```bash
   docker volume inspect mina-cafe_uploads_data
   ```

2. **Verify BASE_URL** in `.env` matches your domain

3. **Check permissions:**
   ```bash
   docker exec mina-cafe-backend ls -la /app/uploads
   ```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

## Security Checklist

- [ ] Strong JWT_SECRET set
- [ ] MongoDB credentials are secure
- [ ] Environment variables are not in git
- [ ] HTTPS/SSL enabled
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular backups scheduled
- [ ] MongoDB IP whitelist configured (if using Atlas)
- [ ] Non-root users in containers (already configured)

## Support

For hamravesh.com specific issues, check:
- hamravesh.com documentation
- hamravesh.com support portal

For application issues, check logs:
```bash
docker-compose logs -f
```

