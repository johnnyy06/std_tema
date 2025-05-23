FROM node:18-alpine
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Create necessary directories
RUN mkdir -p uploads results

# Expose the port
EXPOSE 3000

# Environment variables will be injected by Kubernetes
CMD ["node", "server.js"]