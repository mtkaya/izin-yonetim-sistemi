export interface Birim {
  id: number;
  ad: string;
  aktif: boolean;
}

export interface Personel {
  id: number;
  sicilNo: string;
  ad: string;
  soyad: string;
  telefon?: string;
  birimId?: number;
  birim?: Birim;
  hakTarih?: string;
  hizmetSuresi?: number;
  puantor?: string;
  goreveBaslamaTarihi?: string;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
  izinKayitlari?: IzinKaydi[];
}

export interface IzinTuru {
  id: number;
  ad: string;
  maxGun?: number;
  ucretli: boolean;
  aktif: boolean;
}

export interface IzinKaydi {
  id: number;
  personelId: number;
  personel?: Personel;
  izinTuruId: number;
  izinTuru?: IzinTuru;
  baslangicTarihi: string;
  bitisTarihi: string;
  gunSayisi: number;
  aciklama?: string;
  kayitTarihi: string;
  createdAt: string;
}

export interface ResmiTatil {
  id: number;
  ad: string;
  tarih: string;
  gunSayisi: number;
}

export interface KalanIzin {
  toplam: number;
  kullanilan: number;
  kalan: number;
}

export interface YillikIzinOzet {
  id: number;
  sicilNo: string;
  adSoyad: string;
  birim: string;
  hizmetSuresi: number;
  toplam: number;
  kullanilan: number;
  kalan: number;
}

export interface TakvimVerisi {
  id: number;
  title: string;
  start: string;
  end: string;
  personel: string;
  izinTuru: string;
  gunSayisi: number;
}

export interface PivotRapor {
  yil: number;
  aylar: string[];
  pivot: Record<string, Record<string, number>>;
}
