import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const turler = await prisma.izinTuru.findMany({
      where: { aktif: true },
      orderBy: { id: 'asc' },
    });
    res.json(turler);
  } catch (error) {
    res.status(500).json({ error: 'İzin türleri alınamadı' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const tur = await prisma.izinTuru.create({ data: req.body });
    res.status(201).json(tur);
  } catch (error) {
    res.status(500).json({ error: 'İzin türü eklenemedi' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const tur = await prisma.izinTuru.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(tur);
  } catch (error) {
    res.status(500).json({ error: 'İzin türü güncellenemedi' });
  }
});

export default router;
