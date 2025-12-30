# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY HealthTracker.API/*.csproj ./HealthTracker.API/
RUN dotnet restore "./HealthTracker.API/HealthTracker.API.csproj"
COPY HealthTracker.API/. ./HealthTracker.API/
WORKDIR "/src/HealthTracker.API"
RUN dotnet publish "HealthTracker.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "HealthTracker.API.dll"]
