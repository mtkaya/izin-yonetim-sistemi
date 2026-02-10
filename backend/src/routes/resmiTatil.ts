import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { yil } = req.query;
    const where: any = {};
    if (yil) {
      where.tarih = {
        gte: new Date(`${yil}-01-01`),
        lte: new Date(`${yil}-12-31`),
      };
    }
    const tatiller = await prisma.resmiTatil.findMany({
      where,
      orderBy: { tarih: 'asc' },
    });
    res.json(tatiller);
  } catch (error) {
    res.status(500).json({ error: 'Resmi tatiller alınamadı' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const tatil = await prisma.resmiTatil.create({
      data: {
        ...req.body,
        tarih: new Date(req.body.tarih),
      },
    });
    res.status(201).json(tatil);
  } catch (error) {
    res.status(500).json({ error: 'Resmi tatil eklenemedi' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const tatil = await prisma.resmiTatil.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...req.body,
        tarih: req.body.tarih ? new Date(req.body.tarih) : undefined,
      },
    });
    res.json(tatil);
  } catch (error) {
    res.status(500).json({ error: 'Resmi tatil güncellenemedi' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.resmiTatil.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Resmi tatil silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Resmi tatil silinemedi' });
  }
});

export default router;
