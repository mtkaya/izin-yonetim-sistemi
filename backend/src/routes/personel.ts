import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Tüm personelleri getir
router.get('/', async (_req: Request, res: Response) => {
  try {
    const personeller = await prisma.personel.findMany({
      include: { birim: true },
      where: { aktif: true },
      orderBy: { sicilNo: 'asc' },
    });
    res.json(personeller);
  } catch (error) {
    res.status(500).json({ error: 'Personel listesi alınamadı' });
  }
});

// Personel ara (sicil no veya ad ile)
router.get('/ara', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const personeller = await prisma.personel.findMany({
      where: {
        aktif: true,
        OR: [
          { sicilNo: { contains: String(q || '') } },
          { ad: { contains: String(q || '') } },
          { soyad: { contains: String(q || '') } },
        ],
      },
      include: { birim: true },
      take: 20,
    });
    res.json(personeller);
  } catch (error) {
    res.status(500).json({ error: 'Arama yapılamadı' });
  }
});

// Tek personel getir
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const personel = await prisma.personel.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { birim: true, izinKayitlari: { include: { izinTuru: true } } },
    });
    if (!personel) {
      res.status(404).json({ error: 'Personel bulunamadı' });
      return;
    }
    res.json(personel);
  } catch (error) {
    res.status(500).json({ error: 'Personel bilgisi alınamadı' });
  }
});

// Yeni personel ekle
router.post('/', async (req: Request, res: Response) => {
  try {
    const personel = await prisma.personel.create({
      data: req.body,
      include: { birim: true },
    });
    res.status(201).json(personel);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Bu sicil no zaten kayıtlı' });
      return;
    }
    res.status(500).json({ error: 'Personel eklenemedi' });
  }
});

// Personel güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const personel = await prisma.personel.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: { birim: true },
    });
    res.json(personel);
  } catch (error) {
    res.status(500).json({ error: 'Personel güncellenemedi' });
  }
});

// Personel sil (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.personel.update({
      where: { id: parseInt(req.params.id) },
      data: { aktif: false },
    });
    res.json({ message: 'Personel silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Personel silinemedi' });
  }
});

export default router;
