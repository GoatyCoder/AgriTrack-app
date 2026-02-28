# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY AgriTrack.App.csproj ./
RUN dotnet restore AgriTrack.App.csproj

COPY . .
RUN dotnet publish AgriTrack.App.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:10000

COPY --from=build /app/publish .

EXPOSE 10000

# Render sets PORT dynamically; fallback to 10000 for local container runs.
CMD ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-10000} dotnet AgriTrack.App.dll"]
