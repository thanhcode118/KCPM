# Buoc 1: Su dung SDK .NET 9.0 de bien dich va Build ma nguon
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /app

# Copy file Solution va cac file .csproj de thuc hien restore NuGet Cache
COPY *.sln ./
COPY HomeDecorShop.Domain/*.csproj ./HomeDecorShop.Domain/
COPY HomeDecorShop.Application/*.csproj ./HomeDecorShop.Application/
COPY HomeDecorShop.Infrastructure/*.csproj ./HomeDecorShop.Infrastructure/
COPY HomeDecorShop.API/*.csproj ./HomeDecorShop.API/
COPY HomeDecorShop.Tests/*.csproj ./HomeDecorShop.Tests/
RUN dotnet restore

# Copy toan bo ma nguon va thuc hien publish phien ban Release
COPY . ./
RUN dotnet publish HomeDecorShop.API/HomeDecorShop.API.csproj -c Release -o out

# Buoc 2: Su dung Runtime .NET 9.0 de tao container chay sieu nhe
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build-env /app/out .

# Khai bao cong cua API va lenh khoi chay
EXPOSE 80
ENTRYPOINT ["dotnet", "HomeDecorShop.API.dll"]
