import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function exportPersonelListesi(): Promise<ExcelJS.Workbook> {
  const personeller = await prisma.personel.findMany({
    include: { birim: true },
    where: { aktif: true },
    orderBy: { sicilNo: 'asc' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Personel Listesi');

  sheet.columns = [
    { header: 'Sicil No', key: 'sicilNo', width: 12 },
    { header: 'Ad', key: 'ad', width: 20 },
    { header: 'Soyad', key: 'soyad', width: 20 },
    { header: 'Birim', key: 'birim', width: 25 },
    { header: 'Telefon', key: 'telefon', width: 18 },
    { header: 'Hak Tarihi', key: 'hakTarih', width: 14 },
    { header: 'Hizmet Süresi', key: 'hizmetSuresi', width: 14 },
    { header: 'Puantör', key: 'puantor', width: 20 },
  ];

  // Header stil
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (const p of personeller) {
    sheet.addRow({
      sicilNo: p.sicilNo,
      ad: p.ad,
      soyad: p.soyad,
      birim: p.birim?.ad || '',
      telefon: p.telefon || '',
      hakTarih: p.hakTarih
        ? p.hakTarih.toISOString().split('T')[0]
        : '',
      hizmetSuresi: p.hizmetSuresi || 0,
      puantor: p.puantor || '',
    });
  }

  return workbook;
}

export async function exportIzinRaporu(yil: number): Promise<ExcelJS.Workbook> {
  const izinler = await prisma.izinKaydi.findMany({
    where: {
      baslangicTarihi: {
        gte: new Date(`${yil}-01-01`),
        lte: new Date(`${yil}-12-31`),
      },
    },
    include: {
      personel: { include: { birim: true } },
      izinTuru: true,
    },
    orderBy: { baslangicTarihi: 'desc' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('İzin Raporu');

  sheet.columns = [
    { header: 'Sicil No', key: 'sicilNo', width: 12 },
    { header: 'Ad Soyad', key: 'adSoyad', width: 25 },
    { header: 'Birim', key: 'birim', width: 25 },
    { header: 'İzin Türü', key: 'izinTuru', width: 20 },
    { header: 'Başlangıç', key: 'baslangic', width: 14 },
    { header: 'Bitiş', key: 'bitis', width: 14 },
    { header: 'Gün', key: 'gun', width: 8 },
    { header: 'Açıklama', key: 'aciklama', width: 30 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };

  for (const iz of izinler) {
    sheet.addRow({
      sicilNo: iz.personel.sicilNo,
      adSoyad: `${iz.personel.ad} ${iz.personel.soyad}`,
      birim: iz.personel.birim?.ad || '',
      izinTuru: iz.izinTuru.ad,
      baslangic: iz.baslangicTarihi.toISOString().split('T')[0],
      bitis: iz.bitisTarihi.toISOString().split('T')[0],
      gun: Number(iz.gunSayisi),
      aciklama: iz.aciklama || '',
    });
  }

  return workbook;
}
