# hamravesh.com Quick Start Checklist

## Pre-Deployment Checklist

- [ ] Generate strong JWT_SECRET: `openssl rand -base64 32`
- [ ] Get Kavenegar API key from https://panel.kavenegar.com/
- [ ] Set up MongoDB (Atlas recommended) or prepare for container
- [ ] Have your domain ready (e.g., yourdomain.com, api.yourdomain.com)

## Step-by-Step Deployment

### 1. Prepare .env File

```env
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mina-cafe?retryWrites=true&w=majority
JWT_SECRET=<your-generated-secret>
KAVENEGAR_API_KEY=<your-api-key>
BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 2. Upload Files to Server

Via SSH/Git/File Manager:
- `docker-compose.yml`
- `backend/` folder
- `frontend/` folder
- `.env` file

### 3. Update docker-compose.yml Ports (if needed)

For production, you may want standard ports:
```yaml
backend:
  ports:
    - "4000:4000"  # Change from 4001 if needed

frontend:
  ports:
    - "3000:3000"  # Change from 3005 if needed
```

### 4. Build and Start

```bash
cd /path/to/mina-cafe
docker-compose build
docker-compose up -d
docker-compose ps  # Verify all containers are running
```

### 5. Configure Domain & Reverse Proxy

In hamravesh.com panel or Nginx:
- Frontend: `yourdomain.com` → `localhost:3000`
- Backend: `api.yourdomain.com` → `localhost:4000`

### 6. Rebuild Frontend (Important!)

After setting NEXT_PUBLIC_API_URL, rebuild frontend:
```bash
docker-compose build frontend
docker-compose up -d frontend
```

### 7. Test

- Frontend: https://yourdomain.com
- Backend: https://api.yourdomain.com/api/health

## Common Issues

**Frontend shows connection errors:**
- Rebuild frontend after changing NEXT_PUBLIC_API_URL
- Verify backend is accessible: `curl http://localhost:4000/api/health`

**MongoDB connection fails:**
- Check MONGODB_URI format
- Verify MongoDB is running (if container) or accessible (if Atlas)
- Check IP whitelist (for Atlas)

**Container won't start:**
- Check logs: `docker-compose logs <service-name>`
- Verify .env file exists and has correct values

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all
docker-compose down

# Start all
docker-compose up -d

# Rebuild and restart
docker-compose build && docker-compose up -d
```

See `HAMRAVESH_DEPLOYMENT.md` for detailed instructions.

