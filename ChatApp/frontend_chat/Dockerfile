FROM nginx:alpine
WORKDIR /app

# Install Node.js
RUN apk add --no-cache nodejs npm

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build the app
COPY . .
RUN npm run build

# Move built app to Nginx serve directory
RUN mv /app/dist/* /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 90 as specified
EXPOSE 90

CMD ["nginx", "-g", "daemon off;"]