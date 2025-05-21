FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["ChatApp.API.csproj", "./"]
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Build runtime image with Nginx
FROM nginx:alpine AS final

# Install .NET runtime
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Copy .NET runtime from Microsoft image
COPY --from=mcr.microsoft.com/dotnet/aspnet:6.0 /usr/share/dotnet /usr/share/dotnet

# Create symbolic links
RUN ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

# Copy our app
WORKDIR /app
COPY --from=build /app/publish .

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 88 as specified in the requirements
EXPOSE 88

# Start Nginx and our .NET application
CMD nginx && dotnet ChatApp.API.dll