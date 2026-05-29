# Huong Dan Chay

## Terminal 1 - Clone source

```powershell
git clone 
cd TMDT_Nhom6
```

## Terminal 2 - Start SQL Server

```powershell
docker compose -f docker-compose.sql.yml up -d
docker compose -f docker-compose.sql.yml ps
```

## Terminal 3 - Start Backend
C:\WORK_SPACE\NEW_KCPM\KCPM\HomeDecorShop\HomeDecorShop.API
dotnet run
```

## Terminal 4 - Seed du lieu

```powershell
Invoke-RestMethod -Method Post http://localhost:5020/api/Maintenance/seed/all
```

## Terminal 5 - Start Frontend
C:\WORK_SPACE\NEW_KCPM\KCPM\frontend
npm install
npm run dev
```

## Terminal 6 - Start ngrok

```powershell
ngrok config add-authtoken 3CHqDga7M0o27PcWJWmERTM55E1_5mfBKdmVUCZ5fj9QnR8FN


ngrok http --domain=gecko-canning-viability.ngrok-free.dev 5020

Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ: NGUYEN VAN A
Ngày phát hành: 07/15
Mã OTP: 123456

## URL

```text
Frontend: http://127.0.0.1:3000
Backend: http://localhost:5020
Swagger: http://localhost:5020/swagger
```


## auto-test
```text
newman run HomeDecorShop/HomeDecorShop_Postman.json --env-var "url=http://localhost:5020"
```

npm install -g newman newman-reporter-html newman-reporter-junit
admin:12345678 jenkins
http://localhost:8080/pluginManager/available


net stop jenkins
net start jenkins