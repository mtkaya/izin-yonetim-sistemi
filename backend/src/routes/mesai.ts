import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  mesaiOzetHesapla,
  odemeDonemiHesapla,
  yillikOdemeDonemleriniGetir,
} from '../services/mesaiHesaplama';
import {
  exportMesaiDetayRaporu,
  exportMesaiOzetRaporu,
} from '../services/excelExport';

const router = Router();
const prisma = new PrismaClient();

// Mesai kayıtlarını listele (dönem bazında)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { yil, ay, personelId } = req.query;
    const where: any = {};

    if (yil && ay) {
      const donem = odemeDonemiHesapla(
        parseInt(String(yil)),
        parseInt(String(ay))
      );
      where.tarih = { gte: donem.baslangic, lte: donem.bitis };
    }

    if (personelId) {
      where.personelId = parseInt(String(personelId));
    }

    const kayitlar = await prisma.mesaiKaydi.findMany({
      where,
      include: {
        personel: { include: { birim: true } },
        mesaiNedeni: true,
      },
      orderBy: [{ tarih: 'desc' }, { personelId: 'asc' }],
    });
    res.json(kayitlar);
  } catch (error) {
    res.status(500).json({ error: 'Mesai kayıtları alınamadı' });
  }
});

// Mesai nedenlerini listele
router.get('/nedenler', async (_req: Request, res: Response) => {
  try {
    const nedenler = await prisma.mesaiNedeni.findMany({
      where: { aktif: true },
      orderBy: { id: 'asc' },
    });
    res.json(nedenler);
  } catch (error) {
    res.status(500).json({ error: 'Mesai nedenleri alınamadı' });
  }
});

// Yılın ödeme dönemlerini getir
router.get('/donemler/:yil', async (req: Request, res: Response) => {
  try {
    const yil = parseInt(req.params.yil);
    const donemler = yillikOdemeDonemleriniGetir(yil);
    res.json(donemler);
  } catch (error) {
    res.status(500).json({ error: 'Dönem bilgisi alınamadı' });
  }
});

// Dönem bazında özet rapor
router.get('/ozet', async (req: Request, res: Response) => {
  try {
    const yil = parseInt(String(req.query.yil || new Date().getFullYear()));
    const ay = parseInt(String(req.query.ay || new Date().getMonth() + 1));
    const personelId = req.query.personelId
      ? parseInt(String(req.query.personelId))
      : undefined;
    const ozetler = await mesaiOzetHesapla(yil, ay, personelId);
    const donem = odemeDonemiHesapla(yil, ay);
    res.json({ donem, ozetler });
  } catch (error) {
    res.status(500).json({ error: 'Mesai özeti hesaplanamadı' });
  }
});

// Excel export - detay
router.get('/export/detay', async (req: Request, res: Response) => {
  try {
    const yil = parseInt(String(req.query.yil || new Date().getFullYear()));
    const ay = parseInt(String(req.query.ay || new Date().getMonth() + 1));
    const workbook = await exportMesaiDetayRaporu(yil, ay);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=mesai-detay-${yil}-${ay}.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Excel export başarısız' });
  }
});

// Excel export - özet
router.get('/export/ozet', async (req: Request, res: Response) => {
  try {
    const yil = parseInt(String(req.query.yil || new Date().getFullYear()));
    const ay = parseInt(String(req.query.ay || new Date().getMonth() + 1));
    const workbook = await exportMesaiOzetRaporu(yil, ay);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=mesai-ozet-${yil}-${ay}.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Excel export başarısız' });
  }
});

// Yeni mesai kaydı oluştur
router.post('/', async (req: Request, res: Response) => {
  try {
    const { personelId, mesaiNedeniId, tarih, saat, aciklama } = req.body;
    const kayit = await prisma.mesaiKaydi.create({
      data: {
        personelId: parseInt(personelId),
        mesaiNedeniId: parseInt(mesaiNedeniId),
        tarih: new Date(tarih),
        saat: parseFloat(saat),
        aciklama,
      },
      include: {
        personel: { include: { birim: true } },
        mesaiNedeni: true,
      },
    });
    res.status(201).json(kayit);
  } catch (error) {
    res.status(500).json({ error: 'Mesai kaydı oluşturulamadı' });
  }
});

// Mesai kaydı güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (data.tarih) data.tarih = new Date(data.tarih);
    if (data.saat) data.saat = parseFloat(data.saat);
    if (data.personelId) data.personelId = parseInt(data.personelId);
    if (data.mesaiNedeniId) data.mesaiNedeniId = parseInt(data.mesaiNedeniId);

    const kayit = await prisma.mesaiKaydi.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: {
        personel: { include: { birim: true } },
        mesaiNedeni: true,
      },
    });
    res.json(kayit);
  } catch (error) {
    res.status(500).json({ error: 'Mesai kaydı güncellenemedi' });
  }
});

// Mesai kaydı sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.mesaiKaydi.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Mesai kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Mesai kaydı silinemedi' });
  }
});

export default router;
