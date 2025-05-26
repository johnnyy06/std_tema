FROM node:22

# Set working directory
WORKDIR /app

# Install dumb-init
RUN apt-get update && \
  apt-get install -y dumb-init && \
  rm -rf /var/lib/apt/lists/*

# Create app user early
RUN groupadd --gid 1001 nodejs && \
  useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home payloaduser

# Create directories early with correct permissions
RUN mkdir -p /app/media /app/.payload && \
  chown -R payloaduser:nodejs /app

# Copy package files and install dependencies
COPY --chown=payloaduser:nodejs package*.json ./
RUN npm install

# Copy source code
COPY --chown=payloaduser:nodejs . .

# Generate Payload types and build (skip linting and with faster settings)
ENV NEXT_LINT=false
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Clean up development dependencies to reduce image size
# RUN npm prune --production && \
#   npm cache clean --force

# Switch to non-root user
USER payloaduser

# Set environment variables for Payload v3
ENV NODE_ENV=production
ENV PORT=80

# Expose port 80 to match your Kubernetes service
EXPOSE 80

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]