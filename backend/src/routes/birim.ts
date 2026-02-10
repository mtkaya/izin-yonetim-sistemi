import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const birimler = await prisma.birim.findMany({
      where: { aktif: true },
      orderBy: { ad: 'asc' },
    });
    res.json(birimler);
  } catch (error) {
    res.status(500).json({ error: 'Birimler alınamadı' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const birim = await prisma.birim.create({ data: req.body });
    res.status(201).json(birim);
  } catch (error) {
    res.status(500).json({ error: 'Birim eklenemedi' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const birim = await prisma.birim.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(birim);
  } catch (error) {
    res.status(500).json({ error: 'Birim güncellenemedi' });
  }
});

export default router;
