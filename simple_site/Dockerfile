FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static files
COPY index.html .

# Update iframe URLs to use kubernetes service names and ports
RUN sed -i 's|http://localhost:8080|http://chat-frontend:90|g' index.html && \
    sed -i 's|http://localhost:8081|http://ocr-frontend:80|g' index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]