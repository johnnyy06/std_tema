FROM node:22

# Setăm directorul de lucru
WORKDIR /app

# Copiem fișierele necesare
COPY package*.json ./
RUN npm install

# Copiem tot codul sursă
COPY . .

# Instalăm nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*  && \
    apt-get update && \
    apt-get install --reinstall ca-certificates

# Copiem configurația nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Creăm directoarele necesare
RUN mkdir -p /run/nginx /app/uploads /app/results

# Setări de mediu
ENV PORT=3002
ENV NODE_ENV=production

EXPOSE 3001

# Comandă de start
CMD ["sh", "-c", "nginx && node server.js"]
