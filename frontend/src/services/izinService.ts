import client from '../api/client';
import type { IzinKaydi, IzinTuru, KalanIzin } from '../types';

export const izinService = {
  getAll: (params?: { personelId?: number; yil?: number }) =>
    client.get<IzinKaydi[]>('/izin', { params }).then((r) => r.data),

  create: (data: {
    personelId: number;
    izinTuruId: number;
    baslangicTarihi: string;
    bitisTarihi: string;
    gunSayisi: number;
    aciklama?: string;
  }) => client.post<IzinKaydi>('/izin', data).then((r) => r.data),

  update: (id: number, data: Partial<IzinKaydi>) =>
    client.put<IzinKaydi>(`/izin/${id}`, data).then((r) => r.data),

  delete: (id: number) => client.delete(`/izin/${id}`).then((r) => r.data),

  hesaplaGun: (baslangicTarihi: string, bitisTarihi: string) =>
    client
      .post<{ gunSayisi: number }>('/izin/hesapla-gun', { baslangicTarihi, bitisTarihi })
      .then((r) => r.data),

  hesaplaBitis: (baslangicTarihi: string, gunSayisi: number) =>
    client
      .post<{ bitisTarihi: string }>('/izin/hesapla-bitis', { baslangicTarihi, gunSayisi })
      .then((r) => r.data),

  kalanIzin: (personelId: number, yil?: number) =>
    client
      .get<KalanIzin>(`/izin/kalan/${personelId}`, { params: { yil } })
      .then((r) => r.data),

  getIzinTurleri: () =>
    client.get<IzinTuru[]>('/izin-turu').then((r) => r.data),
};
