# Multi-stage Docker build for Chat App
# Stage 1: Build frontend and prepare backend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies for all components
RUN npm run install-all

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY start-production.js ./

# Build the React frontend for production
RUN cd client && npm run build

# Verify build completed successfully
RUN test -f client/build/index.html || (echo "Frontend build failed" && exit 1)

# Stage 2: Production image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S chatapp -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=chatapp:nodejs /app/server ./server/
COPY --from=builder --chown=chatapp:nodejs /app/client/build ./client/build/
COPY --from=builder --chown=chatapp:nodejs /app/start-production.js ./

# Copy package files
COPY --from=builder --chown=chatapp:nodejs /app/package*.json ./
COPY --from=builder --chown=chatapp:nodejs /app/server/package*.json ./server/

# Create logs directory
RUN mkdir -p /app/logs && chown chatapp:nodejs /app/logs

# Switch to non-root user
USER chatapp

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http=require('http');http.get('http://localhost:3001/api/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/server.js"]
