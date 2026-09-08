const fs = require('fs');

const sd_ipas = [
  { topik: 'Kebutuhan', pertanyaan: 'Air sangat penting untuk apa?', jawabanBenar: 'Minum', pengecoh: ['Bernapas', 'Berlari', 'Tidur'], challengeType: 'IDENTIFY' },
  { topik: 'Lingkungan', pertanyaan: 'Apa akibatnya jika hutan ditebang?', jawabanBenar: 'Banjir', pengecoh: ['Panen', 'Gempa', 'Tsunami'], challengeType: 'IDENTIFY' },
  { topik: 'Hewan', pertanyaan: 'Hewan pemakan tumbuhan disebut apa?', jawabanBenar: 'Herbivor', pengecoh: ['Karnivor', 'Omnivor', 'Predator'], challengeType: 'IDENTIFY' },
  { topik: 'Tumbuhan', pertanyaan: 'Bagian tumbuhan untuk menyerap air adalah?', jawabanBenar: 'Akar', pengecoh: ['Daun', 'Bunga', 'Batang'], challengeType: 'IDENTIFY' },
  { topik: 'Tumbuhan', pertanyaan: 'Bagian tumbuhan tempat fotosintesis adalah?', jawabanBenar: 'Daun', pengecoh: ['Akar', 'Buah', 'Biji'], challengeType: 'IDENTIFY' },
  { topik: 'Benda', pertanyaan: 'Benda yang bentuknya selalu tetap adalah?', jawabanBenar: 'Padat', pengecoh: ['Cair', 'Gas', 'Asap'], challengeType: 'IDENTIFY' },
  { topik: 'Benda', pertanyaan: 'Es batu mencair menjadi apa?', jawabanBenar: 'Cair', pengecoh: ['Padat', 'Gas', 'Uap'], challengeType: 'IDENTIFY' },
  { topik: 'Energi', pertanyaan: 'Sumber panas utama di bumi adalah?', jawabanBenar: 'Matahari', pengecoh: ['Api', 'Bulan', 'Bintang'], challengeType: 'IDENTIFY' },
  { topik: 'Hewan', pertanyaan: 'Hewan yang bernapas dengan insang adalah?', jawabanBenar: 'Ikan', pengecoh: ['Burung', 'Kucing', 'Katak'], challengeType: 'IDENTIFY' },
  { topik: 'Tubuh', pertanyaan: 'Alat indra untuk melihat adalah?', jawabanBenar: 'Mata', pengecoh: ['Telinga', 'Hidung', 'Kulit'], challengeType: 'IDENTIFY' },
  { topik: 'Gaya', pertanyaan: 'Buah jatuh dari pohon karena gaya apa?', jawabanBenar: 'Gravitasi', pengecoh: ['Magnet', 'Gesek', 'Pegas'], challengeType: 'IDENTIFY' },
  { topik: 'Gaya', pertanyaan: 'Gaya tarik pada magnet paling kuat di mana?', jawabanBenar: 'Kutub', pengecoh: ['Tengah', 'Samping', 'Atas'], challengeType: 'IDENTIFY' },
  { topik: 'Benda', pertanyaan: 'Air yang dipanaskan akan menjadi apa?', jawabanBenar: 'Uap', pengecoh: ['Es', 'Padat', 'Batu'], challengeType: 'IDENTIFY' },
  { topik: 'Hewan', pertanyaan: 'Katak mengalami perubahan bentuk tubuh, disebut?', jawabanBenar: 'Metamorfosis', pengecoh: ['Fotosintesis', 'Adaptasi', 'Mutasi'], challengeType: 'IDENTIFY' },
  { topik: 'Ekosistem', pertanyaan: 'Tempat tinggal makhluk hidup disebut apa?', jawabanBenar: 'Habitat', pengecoh: ['Populasi', 'Komunitas', 'Bioma'], challengeType: 'IDENTIFY' },
  { topik: 'Lingkungan', pertanyaan: 'Membuang sampah di sungai dapat menyebabkan?', jawabanBenar: 'Banjir', pengecoh: ['Longsor', 'Tsunami', 'Kemarau'], challengeType: 'IDENTIFY' },
  { topik: 'Tata Surya', pertanyaan: 'Planet tempat kita tinggal adalah?', jawabanBenar: 'Bumi', pengecoh: ['Mars', 'Venus', 'Jupiter'], challengeType: 'IDENTIFY' },
  { topik: 'Tata Surya', pertanyaan: 'Pusat tata surya kita adalah?', jawabanBenar: 'Matahari', pengecoh: ['Bulan', 'Bumi', 'Bintang'], challengeType: 'IDENTIFY' },
  { topik: 'Cahaya', pertanyaan: 'Sifat cahaya yang mengenai cermin datar adalah?', jawabanBenar: 'Memantul', pengecoh: ['Menembus', 'Membias', 'Menyerap'], challengeType: 'IDENTIFY' },
  { topik: 'Bunyi', pertanyaan: 'Alat musik gitar dimainkan dengan cara?', jawabanBenar: 'Dipetik', pengecoh: ['Ditiup', 'Dipukul', 'Digesek'], challengeType: 'IDENTIFY' },
  { topik: 'Sumber Daya', pertanyaan: 'Minyak bumi termasuk sumber daya yang?', jawabanBenar: 'Habis', pengecoh: ['Kekal', 'Terbarukan', 'Melimpah'], challengeType: 'IDENTIFY' },
  { topik: 'Hewan', pertanyaan: 'Hewan yang aktif di malam hari disebut?', jawabanBenar: 'Nokturnal', pengecoh: ['Diurnal', 'Karnivor', 'Mamalia'], challengeType: 'IDENTIFY' },
  { topik: 'Tumbuhan', pertanyaan: 'Tumbuhan melindungi diri dengan duri contohnya?', jawabanBenar: 'Mawar', pengecoh: ['Melati', 'Pisang', 'Mangga'], challengeType: 'IDENTIFY' },
  { topik: 'Energi', pertanyaan: 'Alat yang mengubah energi listrik menjadi cahaya?', jawabanBenar: 'Lampu', pengecoh: ['Kipas', 'Setrika', 'Radio'], challengeType: 'IDENTIFY' },
  { topik: 'Energi', pertanyaan: 'Kincir angin bergerak menggunakan energi?', jawabanBenar: 'Angin', pengecoh: ['Air', 'Panas', 'Listrik'], challengeType: 'IDENTIFY' },
  { topik: 'Tubuh', pertanyaan: 'Tulang penyusun rangka kepala disebut?', jawabanBenar: 'Tengkorak', pengecoh: ['Rusuk', 'Panggul', 'Lengan'], challengeType: 'IDENTIFY' },
  { topik: 'Pencernaan', pertanyaan: 'Pencernaan makanan pertama kali terjadi di mana?', jawabanBenar: 'Mulut', pengecoh: ['Lambung', 'Usus', 'Kerongkongan'], challengeType: 'IDENTIFY' },
  { topik: 'Cuaca', pertanyaan: 'Awan hitam yang membawa hujan disebut?', jawabanBenar: 'Mendung', pengecoh: ['Cerah', 'Kabut', 'Pelangi'], challengeType: 'IDENTIFY' },
  { topik: 'Lingkungan', pertanyaan: 'Penanaman kembali hutan yang gundul disebut?', jawabanBenar: 'Reboisasi', pengecoh: ['Erosi', 'Irigasi', 'Terasering'], challengeType: 'IDENTIFY' },
  { topik: 'Ekosistem', pertanyaan: 'Peran padi dalam rantai makanan adalah?', jawabanBenar: 'Produsen', pengecoh: ['Konsumen', 'Pengurai', 'Predator'], challengeType: 'IDENTIFY' }
];

const sd_matematika = [
  { topik: 'Penjumlahan', pertanyaan: 'Berapa 5 ditambah 4?', jawabanBenar: '9', pengecoh: ['8', '10', '7'], challengeType: 'CALCULATE' },
  { topik: 'Pengurangan', pertanyaan: 'Berapa 10 dikurangi 3?', jawabanBenar: '7', pengecoh: ['6', '8', '5'], challengeType: 'CALCULATE' },
  { topik: 'Penjumlahan', pertanyaan: 'Berapa 12 + 8?', jawabanBenar: '20', pengecoh: ['18', '22', '24'], challengeType: 'CALCULATE' },
  { topik: 'Pecahan', pertanyaan: 'Setengah dari 20 adalah?', jawabanBenar: '10', pengecoh: ['5', '15', '20'], challengeType: 'CALCULATE' },
  { topik: 'Kontekstual', pertanyaan: 'Rina punya 8 apel. Ia memberi 3. Sisa apel?', jawabanBenar: '5', pengecoh: ['3', '4', '6'], challengeType: 'CALCULATE' },
  { topik: 'Perkalian', pertanyaan: 'Berapa 4 dikali 3?', jawabanBenar: '12', pengecoh: ['7', '10', '15'], challengeType: 'CALCULATE' },
  { topik: 'Pembagian', pertanyaan: '15 dibagi 3 sama dengan?', jawabanBenar: '5', pengecoh: ['3', '4', '6'], challengeType: 'CALCULATE' },
  { topik: 'Bangun Datar', pertanyaan: 'Bangun ruang yang memiliki 3 sisi adalah?', jawabanBenar: 'Segitiga', pengecoh: ['Persegi', 'Lingkaran', 'Balok'], challengeType: 'IDENTIFY' },
  { topik: 'Pengukuran', pertanyaan: '1 meter sama dengan berapa sentimeter?', jawabanBenar: '100', pengecoh: ['10', '1000', '1'], challengeType: 'CALCULATE' },
  { topik: 'Waktu', pertanyaan: '1 jam ada berapa menit?', jawabanBenar: '60', pengecoh: ['30', '12', '24'], challengeType: 'CALCULATE' },
  { topik: 'Kontekstual', pertanyaan: 'Budi beli 2 buku. Tiap buku harganya 5. Total?', jawabanBenar: '10', pengecoh: ['7', '5', '15'], challengeType: 'CALCULATE' },
  { topik: 'Pola', pertanyaan: 'Lanjutkan urutan: 2, 4, 6, 8, ...', jawabanBenar: '10', pengecoh: ['9', '12', '14'], challengeType: 'CALCULATE' },
  { topik: 'Bangun Ruang', pertanyaan: 'Dadu berbentuk bangun ruang apa?', jawabanBenar: 'Kubus', pengecoh: ['Balok', 'Tabung', 'Bola'], challengeType: 'IDENTIFY' },
  { topik: 'Pecahan', pertanyaan: 'Satu dibagi dua ditulis sebagai?', jawabanBenar: '1/2', pengecoh: ['1/3', '2/1', '1/4'], challengeType: 'IDENTIFY' },
  { topik: 'Pengurangan', pertanyaan: 'Berapa 25 - 10?', jawabanBenar: '15', pengecoh: ['5', '10', '20'], challengeType: 'CALCULATE' },
  { topik: 'Perkalian', pertanyaan: 'Berapa 6 x 5?', jawabanBenar: '30', pengecoh: ['25', '35', '11'], challengeType: 'CALCULATE' },
  { topik: 'Pembagian', pertanyaan: '20 dibagi 4 adalah?', jawabanBenar: '5', pengecoh: ['4', '6', '16'], challengeType: 'CALCULATE' },
  { topik: 'Pengukuran', pertanyaan: '1 kilogram sama dengan berapa gram?', jawabanBenar: '1000', pengecoh: ['100', '10', '10000'], challengeType: 'CALCULATE' },
  { topik: 'Waktu', pertanyaan: '1 minggu terdiri dari berapa hari?', jawabanBenar: '7', pengecoh: ['5', '6', '30'], challengeType: 'CALCULATE' },
  { topik: 'Sudut', pertanyaan: 'Sudut siku-siku besarnya berapa derajat?', jawabanBenar: '90', pengecoh: ['45', '60', '180'], challengeType: 'IDENTIFY' },
  { topik: 'Kontekstual', pertanyaan: 'Ada 10 burung. 4 terbang. Berapa sisanya?', jawabanBenar: '6', pengecoh: ['4', '5', '14'], challengeType: 'CALCULATE' },
  { topik: 'Pola', pertanyaan: 'Lanjutkan: 5, 10, 15, 20, ...', jawabanBenar: '25', pengecoh: ['21', '30', '35'], challengeType: 'CALCULATE' },
  { topik: 'Bangun Datar', pertanyaan: 'Bangun yang tidak memiliki sudut adalah?', jawabanBenar: 'Lingkaran', pengecoh: ['Segitiga', 'Persegi', 'Layang'], challengeType: 'IDENTIFY' },
  { topik: 'Penjumlahan', pertanyaan: 'Berapa 50 + 50?', jawabanBenar: '100', pengecoh: ['10', '500', '150'], challengeType: 'CALCULATE' },
  { topik: 'Pengurangan', pertanyaan: 'Berapa 100 - 25?', jawabanBenar: '75', pengecoh: ['50', '25', '125'], challengeType: 'CALCULATE' },
  { topik: 'Perkalian', pertanyaan: 'Berapa 7 x 7?', jawabanBenar: '49', pengecoh: ['42', '14', '56'], challengeType: 'CALCULATE' },
  { topik: 'Uang', pertanyaan: 'Tiga koin 500 rupiah bernilai berapa?', jawabanBenar: '1500', pengecoh: ['500', '1000', '2000'], challengeType: 'CALCULATE' },
  { topik: 'Waktu', pertanyaan: 'Satu tahun ada berapa bulan?', jawabanBenar: '12', pengecoh: ['10', '6', '24'], challengeType: 'CALCULATE' },
  { topik: 'Bangun Ruang', pertanyaan: 'Kaleng susu berbentuk bangun ruang apa?', jawabanBenar: 'Tabung', pengecoh: ['Kubus', 'Kerucut', 'Bola'], challengeType: 'IDENTIFY' },
  { topik: 'Kontekstual', pertanyaan: 'Doni punya 3 kantong, tiap kantong isi 5 kelereng. Total?', jawabanBenar: '15', pengecoh: ['8', '10', '20'], challengeType: 'CALCULATE' }
];

let items = [];
let sdIdCount = 1;
sd_ipas.forEach(item => {
  items.push({
    id: `sd_ipas_${sdIdCount++}`,
    jenjang: 'SD',
    kelasAtauFase: 'Fase C',
    mataPelajaran: 'IPAS',
    topik: item.topik,
    pertanyaan: item.pertanyaan,
    jawabanBenar: item.jawabanBenar,
    pengecoh: item.pengecoh,
    challengeType: item.challengeType
  });
});

let sdMatIdCount = 1;
sd_matematika.forEach(item => {
  items.push({
    id: `sd_mat_${sdMatIdCount++}`,
    jenjang: 'SD',
    kelasAtauFase: 'Fase B',
    mataPelajaran: 'Matematika',
    topik: item.topik,
    pertanyaan: item.pertanyaan,
    jawabanBenar: item.jawabanBenar,
    pengecoh: item.pengecoh,
    challengeType: item.challengeType
  });
});

const existing_smp_sma = [
  {
    id: 'smp_ipa_1',
    jenjang: 'SMP',
    kelasAtauFase: 'Fase D',
    mataPelajaran: 'IPA',
    topik: 'Fotosintesis',
    pertanyaan: 'Mengapa daun terlihat berwarna hijau?',
    jawabanBenar: 'Klorofil',
    pengecoh: ['Air', 'Sinar', 'Tanah'],
    challengeType: 'IDENTIFY'
  },
  {
    id: 'smp_ipa_2',
    jenjang: 'SMP',
    kelasAtauFase: 'Fase D',
    mataPelajaran: 'IPA',
    topik: 'Tumbuhan',
    pertanyaan: 'Apa fungsi utama dari akar tanaman?',
    jawabanBenar: 'Serap air',
    pengecoh: ['Cahaya', 'Napas', 'Buah'],
    challengeType: 'IDENTIFY'
  },
  {
    id: 'smp_ips_1',
    jenjang: 'SMP',
    kelasAtauFase: 'Fase D',
    mataPelajaran: 'IPS',
    topik: 'Geografi',
    pertanyaan: 'Apa yang menyebabkan angin darat terjadi?',
    jawabanBenar: 'Suhu',
    pengecoh: ['Gravitasi', 'Hujan', 'Awan'],
    challengeType: 'IDENTIFY'
  },
  {
    id: 'smp_ips_2',
    jenjang: 'SMP',
    kelasAtauFase: 'Fase D',
    mataPelajaran: 'IPS',
    topik: 'Peta',
    pertanyaan: 'Apa nama letak berdasarkan garis lintang?',
    jawabanBenar: 'Astronomis',
    pengecoh: ['Geografis', 'Geologis', 'Kultural'],
    challengeType: 'IDENTIFY'
  },
  {
    id: 'sma_bio_1',
    jenjang: 'SMA',
    kelasAtauFase: 'Fase E',
    mataPelajaran: 'Biologi',
    topik: 'Sel',
    pertanyaan: 'Organel mana yang menghasilkan energi seluler?',
    jawabanBenar: 'Mitokondria',
    pengecoh: ['Ribosom', 'Nukleus', 'Vakuola'],
    challengeType: 'IDENTIFY'
  },
  {
    id: 'sma_bio_2',
    jenjang: 'SMA',
    kelasAtauFase: 'Fase E',
    mataPelajaran: 'Biologi',
    topik: 'Sistem Pencernaan',
    pertanyaan: 'Enzim amilase pada ludah memecah molekul apa?',
    jawabanBenar: 'Karbohidrat',
    pengecoh: ['Protein', 'Lemak', 'Vitamin'],
    challengeType: 'IDENTIFY'
  },
  {
    id: 'sma_fis_1',
    jenjang: 'SMA',
    kelasAtauFase: 'Fase F',
    mataPelajaran: 'Fisika',
    topik: 'Listrik',
    pertanyaan: 'Apa satuan besaran tegangan listrik internasional?',
    jawabanBenar: 'Volt',
    pengecoh: ['Ampere', 'Watt', 'Ohm'],
    challengeType: 'IDENTIFY'
  },
  {
    id: 'sma_fis_2',
    jenjang: 'SMA',
    kelasAtauFase: 'Fase F',
    mataPelajaran: 'Fisika',
    topik: 'Kinematika',
    pertanyaan: 'Perubahan kecepatan per satuan waktu disebut?',
    jawabanBenar: 'Percepatan',
    pengecoh: ['Kecepatan', 'Gaya', 'Massa'],
    challengeType: 'IDENTIFY'
  }
];

items = items.concat(existing_smp_sma);

const fileContent = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf-8');
const before = fileContent.substring(0, fileContent.indexOf('export const SAMPLE_EDUCATIONAL_CONTENT'));
const after = fileContent.substring(fileContent.indexOf('];\n', fileContent.indexOf('export const SAMPLE_EDUCATIONAL_CONTENT')) + 3);

const finalStr = before + 'export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent[] = ' + JSON.stringify(items, null, 2).replace(/"([^"]+)":/g, '$1:') + ';\n' + after;

fs.writeFileSync('src/engine/EducationalEngine.ts', finalStr);
console.log('Replaced array');
