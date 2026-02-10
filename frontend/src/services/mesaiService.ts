import client from '../api/client';
import type { MesaiKaydi, MesaiNedeni, MesaiOzetResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const mesaiService = {
  getAll: (params?: { yil?: number; ay?: number; personelId?: number }) =>
    client.get<MesaiKaydi[]>('/mesai', { params }).then((r) => r.data),

  getNedenler: () =>
    client.get<MesaiNedeni[]>('/mesai/nedenler').then((r) => r.data),

  getOzet: (params?: { yil?: number; ay?: number; personelId?: number }) =>
    client.get<MesaiOzetResponse>('/mesai/ozet', { params }).then((r) => r.data),

  create: (data: {
    personelId: number;
    mesaiNedeniId: number;
    tarih: string;
    saat: number;
    aciklama?: string;
  }) => client.post<MesaiKaydi>('/mesai', data).then((r) => r.data),

  update: (id: number, data: Partial<MesaiKaydi>) =>
    client.put<MesaiKaydi>(`/mesai/${id}`, data).then((r) => r.data),

  delete: (id: number) => client.delete(`/mesai/${id}`).then((r) => r.data),

  exportDetayExcel: (yil: number, ay: number) =>
    `${API_BASE_URL}/mesai/export/detay?yil=${yil}&ay=${ay}`,

  exportOzetExcel: (yil: number, ay: number) =>
    `${API_BASE_URL}/mesai/export/ozet?yil=${yil}&ay=${ay}`,
};
