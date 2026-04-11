# Huong Dan Chay Backend

## 1. Ket noi DB

Khoi dong SQL Server bang Docker Compose (tu root repo):

```powershell
cd d:\2026\TMDT_Nhom6_latest\TMDT_Nhom6
docker compose -f docker-compose.sql.yml up -d
```

Backend doc connection string trong:

- [appsettings.json](/d:/2026/TMDT_Nhom6_latest/TMDT_Nhom6/HomeDecorShop/HomeDecorShop.API/appsettings.json)

Gia tri hien tai:

```text
Server=localhost,1433;Database=BeeShopDB;User Id=sa;Password=BeeShop@2026!;TrustServerCertificate=True;Encrypt=False;MultipleActiveResultSets=true
```

Can dam bao:

- SQL Server dang chay
- dung port `1433`
- dung tai khoan `sa`
- database `BeeShopDB` truy cap duoc

Neu can doi connection string, sua truc tiep file tren.

## 2. Start BE

Chay cac lenh sau tu root repo:

```powershell
cd d:\2026\TMDT_Nhom6_latest\TMDT_Nhom6
dotnet restore HomeDecorShop\HomeDecorShop.sln
dotnet run --project HomeDecorShop\HomeDecorShop.API\HomeDecorShop.API.csproj --launch-profile http
```

Backend se len tai:

- `http://localhost:5020`
- Swagger: `http://localhost:5020/swagger`

## 3. Ghi chu

- Luc app start, backend se tu kiem tra/khoi tao schema co ban trong DB neu can.
- Tai khoan seed mac dinh:
  - `admin1`
  - `admin123`

## 4. Loi thuong gap

Neu backend khong len:

- kiem tra SQL Server da chay chua
- kiem tra lai connection string
- neu bi loi khoa file DLL khi build/run, tat process `HomeDecorShop.API` dang chay roi thu lai
