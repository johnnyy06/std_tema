# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Create a .env file with correct service URLs
RUN echo "VUE_APP_API_BASE_URL=http://backend:88" > .env
RUN echo "VUE_APP_HUB_URL=http://backend:88/chatHub" >> .env

# Copy the rest of the code and build the app
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy the built app from the build stage
COPY --from=build /app/dist .

# Copy nginx configuration to expose on port 90
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 90 as specified in the requirements
EXPOSE 90

CMD ["nginx", "-g", "daemon off;"]