import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import personelRoutes from './routes/personel';
import izinRoutes from './routes/izin';
import izinTuruRoutes from './routes/izinTuru';
import birimRoutes from './routes/birim';
import resmiTatilRoutes from './routes/resmiTatil';
import raporRoutes from './routes/rapor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/personel', personelRoutes);
app.use('/api/izin', izinRoutes);
app.use('/api/izin-turu', izinTuruRoutes);
app.use('/api/birim', birimRoutes);
app.use('/api/resmi-tatil', resmiTatilRoutes);
app.use('/api/rapor', raporRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`İzin API çalışıyor: http://localhost:${PORT}`);
});

export default app;
