import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Birimler
  const birimler = await Promise.all([
    prisma.birim.create({ data: { ad: 'İnsan Kaynakları' } }),
    prisma.birim.create({ data: { ad: 'Bilgi Teknolojileri' } }),
    prisma.birim.create({ data: { ad: 'Muhasebe' } }),
    prisma.birim.create({ data: { ad: 'Satış' } }),
    prisma.birim.create({ data: { ad: 'Üretim' } }),
    prisma.birim.create({ data: { ad: 'Lojistik' } }),
  ]);

  // İzin Türleri
  await Promise.all([
    prisma.izinTuru.create({ data: { ad: 'Yıllık İzin', maxGun: 14, ucretli: true } }),
    prisma.izinTuru.create({ data: { ad: 'Mazeret İzni', maxGun: 5, ucretli: true } }),
    prisma.izinTuru.create({ data: { ad: 'Hastalık İzni', maxGun: null, ucretli: true } }),
    prisma.izinTuru.create({ data: { ad: 'Doğum İzni', maxGun: 112, ucretli: true } }),
    prisma.izinTuru.create({ data: { ad: 'Babalık İzni', maxGun: 5, ucretli: true } }),
    prisma.izinTuru.create({ data: { ad: 'Evlilik İzni', maxGun: 3, ucretli: true } }),
    prisma.izinTuru.create({ data: { ad: 'Ölüm İzni', maxGun: 3, ucretli: true } }),
    prisma.izinTuru.create({ data: { ad: 'Ücretsiz İzin', maxGun: null, ucretli: false } }),
  ]);

  // 2025 Resmi Tatiller
  await Promise.all([
    prisma.resmiTatil.create({ data: { ad: 'Yılbaşı', tarih: new Date('2025-01-01'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Ulusal Egemenlik ve Çocuk Bayramı', tarih: new Date('2025-04-23'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Emek ve Dayanışma Günü', tarih: new Date('2025-05-01'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Atatürkü Anma, Gençlik ve Spor Bayramı', tarih: new Date('2025-05-19'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Ramazan Bayramı 1. Gün', tarih: new Date('2025-03-30'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Ramazan Bayramı 2. Gün', tarih: new Date('2025-03-31'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Ramazan Bayramı 3. Gün', tarih: new Date('2025-04-01'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Kurban Bayramı 1. Gün', tarih: new Date('2025-06-06'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Kurban Bayramı 2. Gün', tarih: new Date('2025-06-07'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Kurban Bayramı 3. Gün', tarih: new Date('2025-06-08'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Kurban Bayramı 4. Gün', tarih: new Date('2025-06-09'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Demokrasi ve Milli Birlik Günü', tarih: new Date('2025-07-15'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Zafer Bayramı', tarih: new Date('2025-08-30'), gunSayisi: 1 } }),
    prisma.resmiTatil.create({ data: { ad: 'Cumhuriyet Bayramı', tarih: new Date('2025-10-29'), gunSayisi: 1 } }),
  ]);

  // Örnek Personeller
  await Promise.all([
    prisma.personel.create({
      data: {
        sicilNo: '1001',
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        telefon: '0532 111 2233',
        birimId: birimler[0].id,
        hakTarih: new Date('2020-01-15'),
        hizmetSuresi: 5,
        puantor: 'Mehmet Demir',
        goreveBaslamaTarihi: new Date('2020-01-15'),
      },
    }),
    prisma.personel.create({
      data: {
        sicilNo: '1002',
        ad: 'Ayşe',
        soyad: 'Kara',
        telefon: '0533 222 3344',
        birimId: birimler[1].id,
        hakTarih: new Date('2019-06-01'),
        hizmetSuresi: 6,
        puantor: 'Ali Veli',
        goreveBaslamaTarihi: new Date('2019-06-01'),
      },
    }),
    prisma.personel.create({
      data: {
        sicilNo: '1003',
        ad: 'Mehmet',
        soyad: 'Öztürk',
        telefon: '0534 333 4455',
        birimId: birimler[2].id,
        hakTarih: new Date('2022-03-10'),
        hizmetSuresi: 3,
        puantor: 'Mehmet Demir',
        goreveBaslamaTarihi: new Date('2022-03-10'),
      },
    }),
  ]);

  console.log('Seed data oluşturuldu!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
