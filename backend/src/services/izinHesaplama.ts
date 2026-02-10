import { PrismaClient } from '@prisma/client';
import {
  addDays,
  isWeekend,
  isSameDay,
  differenceInCalendarDays,
  eachDayOfInterval,
  differenceInYears,
} from 'date-fns';

const prisma = new PrismaClient();

export async function getResmiTatiller(yil: number): Promise<Date[]> {
  const tatiller = await prisma.resmiTatil.findMany({
    where: {
      tarih: {
        gte: new Date(`${yil}-01-01`),
        lte: new Date(`${yil}-12-31`),
      },
    },
  });
  return tatiller.map((t) => t.tarih);
}

function isTatilGunu(tarih: Date, resmiTatiller: Date[]): boolean {
  if (isWeekend(tarih)) return true;
  return resmiTatiller.some((t) => isSameDay(t, tarih));
}

/** İki tarih arasındaki iş günü sayısını hesaplar (resmi tatiller ve hafta sonları hariç) */
export async function izinGunSayisiHesapla(
  baslangic: Date,
  bitis: Date
): Promise<number> {
  const yil1 = baslangic.getFullYear();
  const yil2 = bitis.getFullYear();
  const tatiller: Date[] = [];

  for (let y = yil1; y <= yil2; y++) {
    tatiller.push(...(await getResmiTatiller(y)));
  }

  const gunler = eachDayOfInterval({ start: baslangic, end: bitis });
  let isGunuSayisi = 0;

  for (const gun of gunler) {
    if (!isTatilGunu(gun, tatiller)) {
      isGunuSayisi++;
    }
  }

  return isGunuSayisi;
}

/** İş günü sayısına göre bitiş tarihini hesaplar */
export async function hesaplaIzinBitisTarihi(
  baslangic: Date,
  izinGunSayisi: number
): Promise<Date> {
  const yil = baslangic.getFullYear();
  const tatiller = await getResmiTatiller(yil);
  const sonrakiYilTatiller = await getResmiTatiller(yil + 1);
  const tumTatiller = [...tatiller, ...sonrakiYilTatiller];

  let kalanGun = izinGunSayisi;
  let mevcutTarih = new Date(baslangic);

  while (kalanGun > 0) {
    if (!isTatilGunu(mevcutTarih, tumTatiller)) {
      kalanGun--;
    }
    if (kalanGun > 0) {
      mevcutTarih = addDays(mevcutTarih, 1);
    }
  }

  return mevcutTarih;
}

/** Hizmet süresine göre yıllık izin hakkını hesaplar (4857 sayılı İş Kanunu) */
export function yillikIzinHakkiHesapla(hizmetYili: number): number {
  if (hizmetYili < 1) return 0;
  if (hizmetYili <= 5) return 14; // 1-5 yıl: 14 gün
  if (hizmetYili <= 15) return 20; // 5-15 yıl: 20 gün
  return 26; // 15+ yıl: 26 gün
}

/** Personelin kalan yıllık izin gününü hesaplar */
export async function kalanIzinGunuHesapla(
  personelId: number,
  yil: number
): Promise<{ toplam: number; kullanilan: number; kalan: number }> {
  const personel = await prisma.personel.findUnique({
    where: { id: personelId },
  });

  if (!personel || !personel.goreveBaslamaTarihi) {
    return { toplam: 0, kullanilan: 0, kalan: 0 };
  }

  const hizmetYili = differenceInYears(
    new Date(`${yil}-01-01`),
    personel.goreveBaslamaTarihi
  );
  const toplamHak = yillikIzinHakkiHesapla(hizmetYili);

  // Yıllık izin türü (id=1) için kullanılan izinler
  const kullanilanIzinler = await prisma.izinKaydi.aggregate({
    where: {
      personelId,
      izinTuruId: 1,
      baslangicTarihi: {
        gte: new Date(`${yil}-01-01`),
        lte: new Date(`${yil}-12-31`),
      },
    },
    _sum: { gunSayisi: true },
  });

  const kullanilan = Number(kullanilanIzinler._sum.gunSayisi || 0);
  return { toplam: toplamHak, kullanilan, kalan: toplamHak - kullanilan };
}
