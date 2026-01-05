# DigitalOcean App Platform Deployment Guide

This guide explains how to deploy Mina Cafe on DigitalOcean App Platform as separate services.

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
└──────────────────────────────────────│──────────────────────┘
                                       │
                                       ▼
                          ┌─────────────────────┐
                          │   MongoDB Atlas     │
                          │  (External DB)      │
                          └─────────────────────┘
```

## Prerequisites

1. DigitalOcean account
2. GitHub repository with your code
3. MongoDB Atlas account (DigitalOcean doesn't have managed MongoDB)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs: `0.0.0.0/0` (for App Platform dynamic IPs)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mina-cafe?retryWrites=true&w=majority
   ```

## Step 2: Deploy Backend Service

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
   | `MONGODB_URI` | Secret | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Secret | A strong random string (32+ chars) |
   | `KAVENEGAR_API_KEY` | Secret | Your Kavenegar API key |
   | `BASE_URL` | Plain | Will be set after deployment (e.g., `https://backend-xxxxx.ondigitalocean.app`) |

5. Click **Create Resources**
6. Wait for deployment to complete
7. Note the backend URL (e.g., `https://backend-xxxxx.ondigitalocean.app`)
8. Go back and update `BASE_URL` environment variable with the actual URL

## Step 3: Deploy Frontend Service

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

## File Uploads Note

DigitalOcean App Platform uses ephemeral storage - uploaded files will be lost on redeploy.

**Solutions:**

1. **DigitalOcean Spaces (Recommended):**
   - Create a Space in DigitalOcean
   - Update backend to use S3-compatible storage
   - Install `@aws-sdk/client-s3`:
     ```bash
     npm install @aws-sdk/client-s3
     ```
   - Update `fileStorage.js` to use Spaces

2. **External Storage:**
   - Use Cloudinary, AWS S3, or similar
   - Update the file upload logic accordingly

## Environment Variables Summary

### Backend
```env
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mina-cafe
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
KAVENEGAR_API_KEY=your-kavenegar-api-key
BASE_URL=https://your-backend-url.ondigitalocean.app
```

### Frontend (Build Arg)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.ondigitalocean.app/api
```

## Deployment Commands (Alternative: Using doctl CLI)

```bash
# Install doctl
brew install doctl  # macOS

# Authenticate
doctl auth init

# Create backend app from spec
doctl apps create --spec backend-app.yaml

# Create frontend app from spec
doctl apps create --spec frontend-app.yaml
```

## Troubleshooting

### Backend Issues

**"Cannot connect to MongoDB"**
- Verify MongoDB Atlas whitelist includes `0.0.0.0/0`
- Check connection string format
- Verify database user credentials

**"Health check failed"**
- Check `/api/health` endpoint is working
- Review deployment logs: `doctl apps logs <app-id>`

### Frontend Issues

**"API calls failing"**
- Verify `NEXT_PUBLIC_API_URL` is set correctly at build time
- Check CORS settings in backend
- Ensure backend is accessible

**"Build failed"**
- Check Node.js version compatibility
- Review build logs for specific errors

## Monitoring

1. Go to your app in DigitalOcean dashboard
2. Check **Runtime Logs** for application logs
3. Check **Insights** for metrics and performance
4. Set up **Alerts** for notifications

## Cost Estimate

| Service | Size | Monthly Cost |
|---------|------|--------------|
| Backend | Basic (512MB RAM) | $5 |
| Frontend | Basic (512MB RAM) | $5 |
| MongoDB Atlas | M0 Free Tier | $0 |
| **Total** | | **$10/month** |

For production workloads, consider upgrading to:
- Professional instances ($12+/month each)
- MongoDB Atlas M10+ ($57+/month)
