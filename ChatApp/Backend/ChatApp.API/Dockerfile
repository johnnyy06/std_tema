# Build stage pentru .NET
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["ChatApp.API.csproj", "./"]
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage cu .NET și Nginx
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app

# Install Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=build /app/publish .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Create startup script
RUN echo '#!/bin/bash\n\
    # Start .NET app in background on port 5000\n\
    dotnet ChatApp.API.dll &\n\
    # Start nginx in foreground\n\
    nginx -g "daemon off;"' > /app/start.sh && chmod +x /app/start.sh

# Configure .NET to listen on port 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port 88 as specified in requirements
EXPOSE 88

# Run both services
CMD ["/app/start.sh"]