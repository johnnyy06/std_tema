FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Create environment variables for Azure services
ENV PORT=3000 \
    FRONTEND_URL="http://ocr-frontend:80" \
    AZURE_STORAGE_CONNECTION_STRING="" \
    BLOB_CONTAINER_NAME="ocr-files" \
    OCR_ENDPOINT="" \
    OCR_KEY="" \
    SQL_SERVER="" \
    SQL_DATABASE="" \
    SQL_USER="" \
    SQL_PASSWORD=""

# Create necessary directories
RUN mkdir -p uploads results

# Expose the port
EXPOSE 3000

CMD ["node", "server.js"]