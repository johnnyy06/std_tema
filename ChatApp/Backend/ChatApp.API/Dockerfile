FROM mcr.microsoft.com/dotnet/sdk:6.0
WORKDIR /src

# Copy csproj and restore dependencies
COPY ChatApp.API.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Install Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Move published app to /app
WORKDIR /app
#RUN mv /src/app/publish/* .

# Configure .NET to listen on port 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port 88 as specified
EXPOSE 88

# Run both services
CMD bash -c "dotnet ChatApp.API.dll & nginx -g 'daemon off;'"