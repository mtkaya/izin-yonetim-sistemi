import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  izinGunSayisiHesapla,
  hesaplaIzinBitisTarihi,
  kalanIzinGunuHesapla,
} from '../services/izinHesaplama';

const router = Router();
const prisma = new PrismaClient();

// Tüm izin kayıtlarını getir
router.get('/', async (req: Request, res: Response) => {
  try {
    const { personelId, yil } = req.query;
    const where: any = {};

    if (personelId) {
      where.personelId = parseInt(String(personelId));
    }
    if (yil) {
      where.baslangicTarihi = {
        gte: new Date(`${yil}-01-01`),
        lte: new Date(`${yil}-12-31`),
      };
    }

    const izinler = await prisma.izinKaydi.findMany({
      where,
      include: {
        personel: { include: { birim: true } },
        izinTuru: true,
      },
      orderBy: { baslangicTarihi: 'desc' },
    });
    res.json(izinler);
  } catch (error) {
    res.status(500).json({ error: 'İzin kayıtları alınamadı' });
  }
});

// İzin gün sayısı hesapla
router.post('/hesapla-gun', async (req: Request, res: Response) => {
  try {
    const { baslangicTarihi, bitisTarihi } = req.body;
    const gunSayisi = await izinGunSayisiHesapla(
      new Date(baslangicTarihi),
      new Date(bitisTarihi)
    );
    res.json({ gunSayisi });
  } catch (error) {
    res.status(500).json({ error: 'Gün hesaplaması yapılamadı' });
  }
});

// İzin bitiş tarihi hesapla
router.post('/hesapla-bitis', async (req: Request, res: Response) => {
  try {
    const { baslangicTarihi, gunSayisi } = req.body;
    const bitisTarihi = await hesaplaIzinBitisTarihi(
      new Date(baslangicTarihi),
      parseInt(gunSayisi)
    );
    res.json({ bitisTarihi: bitisTarihi.toISOString().split('T')[0] });
  } catch (error) {
    res.status(500).json({ error: 'Bitiş tarihi hesaplanamadı' });
  }
});

// Kalan izin günü
router.get('/kalan/:personelId', async (req: Request, res: Response) => {
  try {
    const personelId = parseInt(req.params.personelId);
    const yil = parseInt(String(req.query.yil || new Date().getFullYear()));
    const sonuc = await kalanIzinGunuHesapla(personelId, yil);
    res.json(sonuc);
  } catch (error) {
    res.status(500).json({ error: 'Kalan izin hesaplanamadı' });
  }
});

// Yeni izin kaydı oluştur
router.post('/', async (req: Request, res: Response) => {
  try {
    const { personelId, izinTuruId, baslangicTarihi, bitisTarihi, gunSayisi, aciklama } = req.body;

    const izin = await prisma.izinKaydi.create({
      data: {
        personelId: parseInt(personelId),
        izinTuruId: parseInt(izinTuruId),
        baslangicTarihi: new Date(baslangicTarihi),
        bitisTarihi: new Date(bitisTarihi),
        gunSayisi: parseFloat(gunSayisi),
        aciklama,
      },
      include: {
        personel: true,
        izinTuru: true,
      },
    });
    res.status(201).json(izin);
  } catch (error) {
    res.status(500).json({ error: 'İzin kaydı oluşturulamadı' });
  }
});

// İzin kaydı güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const izin = await prisma.izinKaydi.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...req.body,
        baslangicTarihi: req.body.baslangicTarihi
          ? new Date(req.body.baslangicTarihi)
          : undefined,
        bitisTarihi: req.body.bitisTarihi
          ? new Date(req.body.bitisTarihi)
          : undefined,
      },
      include: { personel: true, izinTuru: true },
    });
    res.json(izin);
  } catch (error) {
    res.status(500).json({ error: 'İzin kaydı güncellenemedi' });
  }
});

// İzin kaydı sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.izinKaydi.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'İzin kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: 'İzin kaydı silinemedi' });
  }
});

export default router;
