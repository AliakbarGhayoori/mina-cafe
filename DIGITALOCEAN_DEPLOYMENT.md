# DigitalOcean App Platform Deployment Guide

This guide explains how to deploy Mina Cafe on DigitalOcean App Platform as two services (no database needed).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  DigitalOcean App Platform                  │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │    Frontend     │         │     Backend     │           │
│  │   (Next.js)     │ ──────▶ │   (Express)     │           │
│  │   Port: 3000    │   API   │   Port: 4000    │           │
│  └─────────────────┘         └─────────────────┘           │
│                                      │                      │
│                              ┌───────┴───────┐              │
│                              │  db.json file │              │
│                              │ (JSON storage)│              │
│                              └───────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**No external database needed!** Data is stored in a JSON file.

## Prerequisites

1. DigitalOcean account
2. GitHub repository with your code

## Step 1: Deploy Backend Service

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Connect your GitHub repository
4. Configure the backend:

   **Source Settings:**
   - Source Directory: `/backend`
   - Dockerfile Path: `Dockerfile` (relative to source directory)

   **Resources:**
   - Type: Web Service
   - HTTP Port: `4000`
   - Instance Size: Basic ($5/month) or higher

   **Health Check:**
   - Path: `/api/health`

   **Environment Variables:**
   | Variable | Type | Value |
   |----------|------|-------|
   | `PORT` | Plain | `4000` |
   | `NODE_ENV` | Plain | `production` |
   | `JWT_SECRET` | Secret | A strong random string (32+ chars) |
   | `KAVENEGAR_API_KEY` | Secret | Your Kavenegar API key (optional, for OTP) |
   | `BASE_URL` | Plain | Will be set after deployment |

5. Click **Create Resources**
6. Wait for deployment to complete
7. Note the backend URL (e.g., `https://backend-xxxxx.ondigitalocean.app`)
8. Go back and update `BASE_URL` environment variable with the actual URL

## Step 2: Deploy Frontend Service

1. Create another App or add a component to existing app
2. Connect the same GitHub repository
3. Configure the frontend:

   **Source Settings:**
   - Source Directory: `/frontend`
   - Dockerfile Path: `Dockerfile` (relative to source directory)

   **Resources:**
   - Type: Web Service
   - HTTP Port: `3000`
   - Instance Size: Basic ($5/month) or higher

   **Build Arguments:**
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://backend-xxxxx.ondigitalocean.app/api` |

   **Environment Variables:**
   | Variable | Type | Value |
   |----------|------|-------|
   | `NODE_ENV` | Plain | `production` |

4. Click **Create Resources**
5. Wait for deployment to complete

## Step 3: Create Admin Account

After deployment, create your admin account by calling the register endpoint:

```bash
curl -X POST https://your-backend-url.ondigitalocean.app/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password", "name": "Admin"}'
```

Then login at `https://your-frontend-url/admin/login`

## Step 4: Configure Custom Domain (Optional)

### For Backend:
1. Go to your backend app settings
2. Click **Domains**
3. Add your domain: `api.yourdomain.com`
4. Update DNS records as instructed
5. Update `BASE_URL` to use the custom domain

### For Frontend:
1. Go to your frontend app settings
2. Click **Domains**
3. Add your domain: `yourdomain.com` or `menu.yourdomain.com`
4. Update DNS records as instructed

## Important Notes

### Data Persistence
The JSON file (`db.json`) stores all data. On DigitalOcean App Platform:
- Data persists between container restarts
- Data is **lost on redeploy** (new container is created)

**For production with data persistence:**
- Export your data before redeploying
- Consider adding a backup/restore script
- Or use DigitalOcean Managed Database (PostgreSQL) if you need persistence

### File Uploads
Uploaded images are stored locally and will be **lost on redeploy**.

**Solutions:**
1. **DigitalOcean Spaces:** Use S3-compatible storage
2. **Cloudinary/AWS S3:** External image hosting
3. **Use image URLs:** Host images elsewhere and just store URLs

## Environment Variables Summary

### Backend
```env
PORT=4000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
KAVENEGAR_API_KEY=your-kavenegar-api-key  # optional
BASE_URL=https://your-backend-url.ondigitalocean.app
```

### Frontend (Build Arg)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.ondigitalocean.app/api
```

## Troubleshooting

### Backend Issues

**"Health check failed"**
- Check `/api/health` endpoint is working
- Review deployment logs in DO dashboard

**"Cannot write to db.json"**
- Check file permissions in Dockerfile
- Ensure data directory exists

### Frontend Issues

**"API calls failing"**
- Verify `NEXT_PUBLIC_API_URL` is set correctly at build time
- Check CORS settings in backend
- Ensure backend is accessible

**"Build failed"**
- Check Node.js version compatibility
- Review build logs for specific errors

## Cost Estimate

| Service | Size | Monthly Cost |
|---------|------|--------------|
| Backend | Basic (512MB RAM) | $5 |
| Frontend | Basic (512MB RAM) | $5 |
| **Total** | | **$10/month** |

No database costs since we use JSON file storage!
