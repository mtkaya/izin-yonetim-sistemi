import client from '../api/client';
import { Personel } from '../types';

export const personelService = {
  getAll: () => client.get<Personel[]>('/personel').then((r) => r.data),

  getById: (id: number) =>
    client.get<Personel>(`/personel/${id}`).then((r) => r.data),

  search: (q: string) =>
    client.get<Personel[]>('/personel/ara', { params: { q } }).then((r) => r.data),

  create: (data: Partial<Personel>) =>
    client.post<Personel>('/personel', data).then((r) => r.data),

  update: (id: number, data: Partial<Personel>) =>
    client.put<Personel>(`/personel/${id}`, data).then((r) => r.data),

  delete: (id: number) => client.delete(`/personel/${id}`).then((r) => r.data),
};
