FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Create necessary directories
RUN mkdir -p uploads results

ENV PORT=3001

# Expose the port
EXPOSE 3001

# Environment variables will be injected by Kubernetes
CMD ["npm", "start"]