# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Create a .env file with correct API URL
RUN echo "VUE_APP_API_BASE_URL=http://ocr-backend:3001/api" > .env

# Copy the rest of the code and build the app
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy the built app from the build stage
COPY --from=build /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]