# Backend Dockerfile for Mina Cafe API
# Optimized for PaaS deployment (Hamravesh, etc.)
# NOTE: This Dockerfile is built from repo root with context at root

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from backend/
COPY backend/package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev && npm cache clean --force

# Production stage
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code from backend/
COPY --chown=nodejs:nodejs backend/ .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Use PORT env variable (PaaS platforms set this dynamically)
ENV PORT=4000

# Expose port
EXPOSE ${PORT}

# Health check (optional - PaaS usually handles this)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 4000; require('http').get('http://localhost:' + port + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]

