# Build stage
FROM node:22 AS builder
WORKDIR /app

# Copiem package files
COPY package*.json ./
RUN npm install

# Copiem cod sursă
COPY . .

FROM nginx:alpine

# Copiem aplicația Node.js
COPY --from=builder /app /app

# Copiem configurația nginx
COPY nginx.conf /etc/nginx/sites-available/default

# Creăm directoarele necesare
RUN mkdir -p /run/nginx /app/uploads /app/results

WORKDIR /app

# Setări de mediu
ENV PORT=3002
ENV NODE_ENV=production

EXPOSE 3001

CMD ["sh", "-c", "nginx & node server.js"]