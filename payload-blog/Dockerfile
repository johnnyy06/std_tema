FROM node:22-alpine

# Install dependencies
RUN apk add --no-cache dumb-init python3 make g++

WORKDIR /app

# Create app user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S payloaduser -u 1001 -G nodejs

# Copy package.json first for better caching
COPY package*.json ./

# Use npm install instead of npm ci since we don't have package-lock.json
RUN npm install

# Copy all application files
COPY . .

# Create necessary directories
RUN mkdir -p /app/.payload /app/media

# IMPORTANT: Copy the existing database
# Make sure payload-blog.db exists in your local payload-blog directory
COPY payload-blog.db /app/.payload/payload.db

# Set correct ownership for everything including the database
RUN chown -R payloaduser:nodejs /app

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_LINT=false
RUN npm run build

# Clean up build dependencies to reduce image size
RUN apk del python3 make g++ && \
  rm -rf /root/.npm /root/.cache

# Switch to non-root user
USER payloaduser

# Environment variables
ENV NODE_ENV=production
ENV PORT=80
ENV DATABASE_URI=file:/app/.payload/payload.db
ENV NEXT_PUBLIC_SERVER_URL=http://localhost

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:80 || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]