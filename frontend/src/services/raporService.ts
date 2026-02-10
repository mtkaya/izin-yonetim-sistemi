import client from '../api/client';
import { YillikIzinOzet, TakvimVerisi, PivotRapor } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const raporService = {
  yillikIzinOzet: (yil?: number) =>
    client
      .get<YillikIzinOzet[]>('/rapor/yillik-izin-ozet', { params: { yil } })
      .then((r) => r.data),

  pivot: (yil?: number) =>
    client.get<PivotRapor>('/rapor/pivot', { params: { yil } }).then((r) => r.data),

  takvim: (yil?: number, ay?: number) =>
    client
      .get<TakvimVerisi[]>('/rapor/takvim', { params: { yil, ay } })
      .then((r) => r.data),

  exportPersonelExcel: () => `${API_BASE_URL}/rapor/export/personel`,

  exportIzinExcel: (yil?: number) =>
    `${API_BASE_URL}/rapor/export/izin?yil=${yil || new Date().getFullYear()}`,
};
