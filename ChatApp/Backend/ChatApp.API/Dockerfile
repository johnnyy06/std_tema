FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["ChatApp.API.csproj", "./"]
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app/publish .

# Configure the app to listen on port 88 directly
ENV ASPNETCORE_URLS=http://+:88
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port 88
EXPOSE 88

ENTRYPOINT ["dotnet", "ChatApp.API.dll"]