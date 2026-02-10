import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { kalanIzinGunuHesapla } from '../services/izinHesaplama';
import { exportPersonelListesi, exportIzinRaporu } from '../services/excelExport';

const router = Router();
const prisma = new PrismaClient();

// Yıllık izin özet raporu
router.get('/yillik-izin-ozet', async (req: Request, res: Response) => {
  try {
    const yil = parseInt(String(req.query.yil || new Date().getFullYear()));
    const personeller = await prisma.personel.findMany({
      where: { aktif: true },
      include: { birim: true },
      orderBy: { sicilNo: 'asc' },
    });

    const rapor = await Promise.all(
      personeller.map(async (p) => {
        const izinDurumu = await kalanIzinGunuHesapla(p.id, yil);
        return {
          id: p.id,
          sicilNo: p.sicilNo,
          adSoyad: `${p.ad} ${p.soyad}`,
          birim: p.birim?.ad || '',
          hizmetSuresi: p.hizmetSuresi || 0,
          ...izinDurumu,
        };
      })
    );

    res.json(rapor);
  } catch (error) {
    res.status(500).json({ error: 'Rapor oluşturulamadı' });
  }
});

// Pivot: İzin türlerine göre aylık dağılım
router.get('/pivot', async (req: Request, res: Response) => {
  try {
    const yil = parseInt(String(req.query.yil || new Date().getFullYear()));
    const izinler = await prisma.izinKaydi.findMany({
      where: {
        baslangicTarihi: {
          gte: new Date(`${yil}-01-01`),
          lte: new Date(`${yil}-12-31`),
        },
      },
      include: { personel: true, izinTuru: true },
    });

    // Ay bazında grupla
    const pivot: Record<string, Record<string, number>> = {};
    const aylar = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ];

    for (const iz of izinler) {
      const ay = aylar[iz.baslangicTarihi.getMonth()];
      const tur = iz.izinTuru.ad;
      if (!pivot[tur]) pivot[tur] = {};
      pivot[tur][ay] = (pivot[tur][ay] || 0) + Number(iz.gunSayisi);
    }

    res.json({ yil, aylar, pivot });
  } catch (error) {
    res.status(500).json({ error: 'Pivot raporu oluşturulamadı' });
  }
});

// Takvim verisi (yıllık izin takvimi)
router.get('/takvim', async (req: Request, res: Response) => {
  try {
    const yil = parseInt(String(req.query.yil || new Date().getFullYear()));
    const ay = req.query.ay ? parseInt(String(req.query.ay)) : undefined;

    const where: any = {
      baslangicTarihi: {
        gte: new Date(`${yil}-${ay ? String(ay).padStart(2, '0') : '01'}-01`),
        lte: ay
          ? new Date(`${yil}-${String(ay).padStart(2, '0')}-31`)
          : new Date(`${yil}-12-31`),
      },
    };

    const izinler = await prisma.izinKaydi.findMany({
      where,
      include: {
        personel: { include: { birim: true } },
        izinTuru: true,
      },
      orderBy: { baslangicTarihi: 'asc' },
    });

    const takvimVerisi = izinler.map((iz) => ({
      id: iz.id,
      title: `${iz.personel.ad} ${iz.personel.soyad} - ${iz.izinTuru.ad}`,
      start: iz.baslangicTarihi.toISOString().split('T')[0],
      end: iz.bitisTarihi.toISOString().split('T')[0],
      personel: `${iz.personel.ad} ${iz.personel.soyad}`,
      izinTuru: iz.izinTuru.ad,
      gunSayisi: Number(iz.gunSayisi),
    }));

    res.json(takvimVerisi);
  } catch (error) {
    res.status(500).json({ error: 'Takvim verisi alınamadı' });
  }
});

// Excel export: Personel listesi
router.get('/export/personel', async (_req: Request, res: Response) => {
  try {
    const workbook = await exportPersonelListesi();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=personel-listesi.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Excel export başarısız' });
  }
});

// Excel export: İzin raporu
router.get('/export/izin', async (req: Request, res: Response) => {
  try {
    const yil = parseInt(String(req.query.yil || new Date().getFullYear()));
    const workbook = await exportIzinRaporu(yil);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=izin-raporu-${yil}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Excel export başarısız' });
  }
});

export default router;
