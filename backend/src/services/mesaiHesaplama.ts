import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Ödeme Dönemi Hesaplama ---

export interface OdemeDonemi {
  baslangic: Date;
  bitis: Date;
  etiket: string;
}

const ayAdlari = [
  '', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

/**
 * Verilen yıl ve ay için ödeme dönemi aralığını hesaplar.
 * Ödeme dönemi: Önceki ayın 25'i - Bu ayın 24'ü
 * Örneğin: "Ocak 2025" dönemi = 25 Aralık 2024 - 24 Ocak 2025
 */
export function odemeDonemiHesapla(yil: number, ay: number): OdemeDonemi {
  let basYil = yil;
  let basAy = ay - 1;
  if (basAy === 0) {
    basAy = 12;
    basYil = yil - 1;
  }
  const baslangic = new Date(basYil, basAy - 1, 25);
  const bitis = new Date(yil, ay - 1, 24);

  return {
    baslangic,
    bitis,
    etiket: `${ayAdlari[ay]} ${yil}`,
  };
}

/** Bir yılın tüm ödeme dönemlerini döndürür (12 dönem) */
export function yillikOdemeDonemleriniGetir(yil: number): OdemeDonemi[] {
  return Array.from({ length: 12 }, (_, i) => odemeDonemiHesapla(yil, i + 1));
}

// --- Kategori Bazında Toplam Hesaplama ---

export interface MesaiOzet {
  personelId: number;
  sicilNo: string;
  adSoyad: string;
  birim: string;
  fazlaMesaiSaati: number;
  pazarSaati: number;
  bayramCalismasi: number;
  servisSaati: number;
  toplamFazlaMesaiVeServisSaati: number;
  genelToplam: number;
}

/**
 * Belirtilen ödeme dönemi için tüm personellerin
 * kategori bazında mesai saat toplamlarını hesaplar.
 */
export async function mesaiOzetHesapla(
  yil: number,
  ay: number,
  personelId?: number
): Promise<MesaiOzet[]> {
  const donem = odemeDonemiHesapla(yil, ay);

  const where: any = {
    tarih: {
      gte: donem.baslangic,
      lte: donem.bitis,
    },
    saat: { gt: 0 },
  };

  if (personelId) {
    where.personelId = personelId;
  }

  const kayitlar = await prisma.mesaiKaydi.findMany({
    where,
    include: {
      personel: { include: { birim: true } },
      mesaiNedeni: true,
    },
  });

  const personelMap = new Map<number, MesaiOzet>();

  for (const kayit of kayitlar) {
    const pid = kayit.personelId;
    if (!personelMap.has(pid)) {
      personelMap.set(pid, {
        personelId: pid,
        sicilNo: kayit.personel.sicilNo,
        adSoyad: `${kayit.personel.ad} ${kayit.personel.soyad}`,
        birim: kayit.personel.birim?.ad || '',
        fazlaMesaiSaati: 0,
        pazarSaati: 0,
        bayramCalismasi: 0,
        servisSaati: 0,
        toplamFazlaMesaiVeServisSaati: 0,
        genelToplam: 0,
      });
    }

    const ozet = personelMap.get(pid)!;
    const saat = Number(kayit.saat);
    const neden = kayit.mesaiNedeni.ad;

    switch (neden) {
      case 'Fazla Mesai':
        ozet.fazlaMesaiSaati += saat;
        break;
      case 'Pazar Çalışması':
        ozet.pazarSaati += saat;
        break;
      case 'Bayram Çalışması':
        ozet.bayramCalismasi += saat;
        break;
      case 'Servis':
        ozet.servisSaati += saat;
        break;
    }
  }

  for (const ozet of personelMap.values()) {
    ozet.toplamFazlaMesaiVeServisSaati = ozet.fazlaMesaiSaati + ozet.servisSaati;
    ozet.genelToplam = ozet.fazlaMesaiSaati + ozet.pazarSaati + ozet.bayramCalismasi + ozet.servisSaati;
  }

  return Array.from(personelMap.values());
}
