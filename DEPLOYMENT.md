# Deployment Guide for Mina Cafe

This guide explains how to deploy the Mina Cafe application using Docker on hamravesh.com or similar hosting platforms.

## Prerequisites

- Docker and Docker Compose installed
- Access to hamravesh.com platform (or similar container hosting)
- MongoDB instance (can be managed service or containerized)
- Domain name configured (optional but recommended)

## Architecture Overview

The application consists of:
- **Backend**: Express.js API server (port 4000)
- **Frontend**: Next.js application (port 3000)
- **MongoDB**: Database server (port 27017)
- **Volumes**: Persistent storage for MongoDB data and uploaded images

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd mina-cafe
```

### 2. Configure environment variables

Copy the example environment file and configure it:

```bash
cp docker.env.example .env
```

Edit `.env` and set the required values:

```env
PORT=4000
MONGODB_URI=mongodb://mongodb:27017/mina-cafe
JWT_SECRET=your-secure-random-secret-key
KAVENEGAR_API_KEY=your-kavenegar-api-key
BASE_URL=http://localhost:4001
NEXT_PUBLIC_API_URL=http://localhost:4001/api
```

**Note**: Docker uses port 4001 for backend and 3001 for frontend to avoid conflicts with local development servers. MongoDB uses port 27018 on the host.

**Important**: Generate a secure JWT_SECRET:
```bash
openssl rand -base64 32
```

### 3. Build and start services

```bash
docker-compose up -d
```

This will:
- Build backend and frontend Docker images
- Start MongoDB container
- Start backend container
- Start frontend container
- Create persistent volumes for data

### 4. Verify deployment

- Backend API: http://localhost:4001/api/health
- Frontend: http://localhost:3001
- MongoDB: localhost:27018 (host port) / 27017 (container port)

### 5. View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 6. Stop services

```bash
docker-compose down
```

To remove volumes as well:
```bash
docker-compose down -v
```

## Production Deployment on hamravesh.com

### Option 1: Using Docker Compose (Recommended if supported)

1. **Upload project files** to your server
2. **Configure environment variables** on the platform or in `.env` file
3. **Build and deploy**:
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

### Option 2: Using Individual Containers

If hamravesh.com doesn't support docker-compose, deploy containers individually:

#### Backend Container

1. Build the backend image:
   ```bash
   cd backend
   docker build -t mina-cafe-backend .
   ```

2. Run the backend container:
   ```bash
   docker run -d \
     --name mina-cafe-backend \
     -p 4000:4000 \
     -v uploads_data:/app/uploads \
     -e PORT=4000 \
     -e MONGODB_URI=your-mongodb-connection-string \
     -e JWT_SECRET=your-jwt-secret \
     -e KAVENEGAR_API_KEY=your-api-key \
     -e BASE_URL=https://api.yourdomain.com \
     --restart unless-stopped \
     mina-cafe-backend
   ```

#### Frontend Container

1. Build the frontend image (set NEXT_PUBLIC_API_URL):
   ```bash
   cd frontend
   docker build \
     --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api \
     -t mina-cafe-frontend .
   ```

2. Run the frontend container:
   ```bash
   docker run -d \
     --name mina-cafe-frontend \
     -p 3000:3000 \
     --restart unless-stopped \
     mina-cafe-frontend
   ```

### Environment Variables for Production

Update these values for production:

```env
# Backend
PORT=4000
MONGODB_URI=mongodb://your-mongodb-host:27017/mina-cafe
JWT_SECRET=<generate-secure-random-key>
KAVENEGAR_API_KEY=your-production-kavenegar-key
BASE_URL=https://api.yourdomain.com

# Frontend (must be set at build time)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### MongoDB Setup

#### Option A: Managed MongoDB Service (Recommended for Production)

Use a managed MongoDB service (MongoDB Atlas, etc.) and update `MONGODB_URI`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mina-cafe?retryWrites=true&w=majority
```

#### Option B: MongoDB Container

If using MongoDB in Docker, ensure network connectivity between containers:

```bash
docker network create mina-cafe-network
```

Then run MongoDB:
```bash
docker run -d \
  --name mina-cafe-mongodb \
  --network mina-cafe-network \
  -v mongodb_data:/data/db \
  -p 27017:27017 \
  mongo:7
```

Update `MONGODB_URI` to use container name:
```env
MONGODB_URI=mongodb://mina-cafe-mongodb:27017/mina-cafe
```

### Reverse Proxy Setup (Nginx Example)

For production, use a reverse proxy (Nginx, Caddy, etc.):

```nginx
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
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Volume Management

#### Backup Uploads Volume

```bash
# Create backup
docker run --rm \
  -v uploads_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .

# Restore backup
docker run --rm \
  -v uploads_data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/uploads-YYYYMMDD.tar.gz"
```

#### Backup MongoDB Data

```bash
# Create backup
docker exec mina-cafe-mongodb mongodump --out /backup

# Restore backup
docker exec mina-cafe-mongodb mongorestore /backup
```

## Monitoring and Maintenance

### Health Checks

All services include health checks. Monitor with:

```bash
docker ps  # Check container status
docker inspect --format='{{.State.Health.Status}}' mina-cafe-backend
```

### Logs

```bash
# Backend logs
docker logs -f mina-cafe-backend

# Frontend logs
docker logs -f mina-cafe-frontend

# MongoDB logs
docker logs -f mina-cafe-mongodb
```

### Updates

1. Pull latest code
2. Rebuild images: `docker-compose build`
3. Restart services: `docker-compose up -d`

## Troubleshooting

### Container won't start

- Check logs: `docker-compose logs <service-name>`
- Verify environment variables are set correctly
- Check port availability: `netstat -tulpn | grep <port>`

### Database connection issues

- Verify MongoDB is running and accessible
- Check MONGODB_URI format
- Ensure network connectivity between containers

### Image upload issues

- Verify uploads directory has write permissions
- Check volume is mounted correctly: `docker inspect mina-cafe-backend`
- Ensure BASE_URL is set correctly for image URLs

### Frontend can't connect to backend

- Verify NEXT_PUBLIC_API_URL is set correctly at build time
- Check CORS configuration in backend
- Ensure backend is accessible from frontend

## Security Considerations

1. **Never commit `.env` files** - Use platform environment variables
2. **Use strong JWT_SECRET** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS** - Use reverse proxy with SSL certificates
4. **Restrict MongoDB access** - Use authentication and network restrictions
5. **Regular backups** - Backup MongoDB and uploads volume regularly
6. **Keep images updated** - Regularly update base images for security patches

## Support

For issues or questions, please refer to the project documentation or contact the development team.

