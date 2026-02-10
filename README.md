# Izin Yonetim Sistemi

Personel izin takip sistemi - ASP.NET WinForms uygulamasindan yeniden yazilmis web versiyonu.

## Teknolojiler

- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Frontend**: React 18 + TypeScript + Vite + Ant Design
- **Veritabani**: PostgreSQL 16
- **Excel Export**: ExcelJS

## Kurulum

### 1. PostgreSQL Baslat

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env  # veya .env dosyasini duzenle
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Uygulama: http://localhost:5173

## Ozellikler

- Personel CRUD (ekleme, duzenleme, silme, arama)
- Izin kaydi olusturma (otomatik gun hesaplama)
- Is gunu hesaplama (hafta sonu + resmi tatil haric)
- Izin bitis tarihi otomatik hesaplama
- Yillik izin hakki hesaplama (4857 Is Kanunu)
- Kalan izin gunu takibi
- Resmi tatil yonetimi
- Yillik izin ozet raporu
- Izin takvimi
- Aylik dagilim (pivot) raporu
- Excel export (personel listesi + izin raporu)
