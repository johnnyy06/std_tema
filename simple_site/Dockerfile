FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy the updated HTML file
COPY index.html .

# Simple nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name _; \
    \
    add_header X-Frame-Options ""; \
    add_header Content-Security-Policy "frame-ancestors *"; \
    \
    location / { \
    root /usr/share/nginx/html; \
    try_files $uri $uri/ /index.html; \
    } \
    \
    location /health { \
    access_log off; \
    return 200 "healthy\\n"; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]