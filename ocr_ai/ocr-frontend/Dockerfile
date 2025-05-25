FROM alpine:latest

# Install Node.js, npm, and Nginx
RUN apk add --no-cache nodejs npm nginx

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app and build
COPY . .
RUN npm run build

# Copy the built app to Nginx's html directory
RUN mkdir -p /usr/share/nginx/html && \
    cp -r dist/* /usr/share/nginx/html/

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Clean up to reduce image size
RUN rm -rf /var/cache/apk/* /root/.npm /app/node_modules /app/src /app/public

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]