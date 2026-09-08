const fs = require('fs');

const sd_bindo = [
  { topik: 'Kosakata', pertanyaan: 'Antonim dari kata panjang adalah?', jawabanBenar: 'Pendek', pengecoh: ['Besar', 'Lebar', 'Tinggi'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Sinonim dari kata pintar adalah?', jawabanBenar: 'Pandai', pengecoh: ['Bodoh', 'Malas', 'Jahat'], challengeType: 'IDENTIFY' },
  { topik: 'Membaca', pertanyaan: '"Budi rajin membaca". Siapa yang rajin?', jawabanBenar: 'Budi', pengecoh: ['Membaca', 'Rajin', 'Buku'], challengeType: 'IDENTIFY' },
  { topik: 'Tanda Baca', pertanyaan: 'Kalimat tanya diakhiri dengan tanda apa?', jawabanBenar: 'Tanya (?)', pengecoh: ['Titik (.)', 'Seru (!)', 'Koma (,)'], challengeType: 'IDENTIFY' },
  { topik: 'Tanda Baca', pertanyaan: 'Kalimat perintah diakhiri dengan tanda apa?', jawabanBenar: 'Seru (!)', pengecoh: ['Titik (.)', 'Tanya (?)', 'Kutip (")'], challengeType: 'IDENTIFY' },
  { topik: 'Huruf Kapital', pertanyaan: 'Nama orang diawali dengan huruf apa?', jawabanBenar: 'Kapital', pengecoh: ['Kecil', 'Sambung', 'Cetak'], challengeType: 'IDENTIFY' },
  { topik: 'Pantun', pertanyaan: 'Baris pertama dan kedua pantun disebut?', jawabanBenar: 'Sampiran', pengecoh: ['Isi', 'Sajak', 'Bait'], challengeType: 'IDENTIFY' },
  { topik: 'Pantun', pertanyaan: 'Baris ketiga dan keempat pantun disebut?', jawabanBenar: 'Isi', pengecoh: ['Sampiran', 'Bait', 'Rima'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Tempat untuk meminjam buku disebut?', jawabanBenar: 'Perpustakaan', pengecoh: ['Kantin', 'Kelas', 'UKS'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Orang yang mengemudikan kereta api disebut?', jawabanBenar: 'Masinis', pengecoh: ['Pilot', 'Nahkoda', 'Sopir'], challengeType: 'IDENTIFY' },
  { topik: 'Kalimat', pertanyaan: '"Rina menyapu lantai". Apa kata kerjanya?', jawabanBenar: 'Menyapu', pengecoh: ['Rina', 'Lantai', 'Sapu'], challengeType: 'IDENTIFY' },
  { topik: 'Membaca', pertanyaan: '"Kucing mengeong". Siapa yang bersuara?', jawabanBenar: 'Kucing', pengecoh: ['Anjing', 'Burung', 'Tikus'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Lawan kata dari siang adalah?', jawabanBenar: 'Malam', pengecoh: ['Sore', 'Pagi', 'Gelap'], challengeType: 'IDENTIFY' },
  { topik: 'Ide Pokok', pertanyaan: 'Gagasan utama dalam sebuah paragraf disebut?', jawabanBenar: 'Ide Pokok', pengecoh: ['Simpulan', 'Judul', 'Tema'], challengeType: 'IDENTIFY' },
  { topik: 'Tanda Baca', pertanyaan: 'Tanda untuk memisahkan kata dalam rincian?', jawabanBenar: 'Koma (,)', pengecoh: ['Titik (.)', 'Tanya (?)', 'Seru (!)'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Kata sapaan untuk orang tua laki-laki?', jawabanBenar: 'Bapak', pengecoh: ['Ibu', 'Kakak', 'Adik'], challengeType: 'IDENTIFY' },
  { topik: 'Kalimat', pertanyaan: '"Adik menangis karena jatuh". Mengapa adik menangis?', jawabanBenar: 'Jatuh', pengecoh: ['Sedih', 'Takut', 'Marah'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Orang yang memeriksa pasien sakit disebut?', jawabanBenar: 'Dokter', pengecoh: ['Guru', 'Polisi', 'Pilot'], challengeType: 'IDENTIFY' },
  { topik: 'Huruf Kapital', pertanyaan: 'Nama hari dan bulan diawali huruf?', jawabanBenar: 'Kapital', pengecoh: ['Kecil', 'Cetak', 'Sambung'], challengeType: 'IDENTIFY' },
  { topik: 'Membaca', pertanyaan: 'Buku berisi kumpulan peta disebut?', jawabanBenar: 'Atlas', pengecoh: ['Kamus', 'Majalah', 'Koran'], challengeType: 'IDENTIFY' },
  { topik: 'Teks', pertanyaan: 'Cerita rakyat yang tidak benar terjadi disebut?', jawabanBenar: 'Dongeng', pengecoh: ['Berita', 'Laporan', 'Jurnal'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Tempat pemberhentian bus disebut?', jawabanBenar: 'Halte', pengecoh: ['Stasiun', 'Bandara', 'Pelabuhan'], challengeType: 'IDENTIFY' },
  { topik: 'Kalimat', pertanyaan: 'Kata tanya untuk menanyakan tempat adalah?', jawabanBenar: 'Di mana', pengecoh: ['Siapa', 'Kapan', 'Bagaimana'], challengeType: 'IDENTIFY' },
  { topik: 'Kalimat', pertanyaan: 'Kata tanya untuk menanyakan waktu adalah?', jawabanBenar: 'Kapan', pengecoh: ['Di mana', 'Siapa', 'Berapa'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Lawan kata dari bersih adalah?', jawabanBenar: 'Kotor', pengecoh: ['Rapi', 'Indah', 'Wang'], challengeType: 'IDENTIFY' },
  { topik: 'Kosakata', pertanyaan: 'Persamaan kata dari melihat adalah?', jawabanBenar: 'Menonton', pengecoh: ['Mendengar', 'Mencium', 'Meraba'], challengeType: 'IDENTIFY' },
  { topik: 'Teks', pertanyaan: 'Pesan moral dalam cerita disebut?', jawabanBenar: 'Amanat', pengecoh: ['Tema', 'Tokoh', 'Latar'], challengeType: 'IDENTIFY' },
  { topik: 'Teks', pertanyaan: 'Pelaku dalam sebuah cerita disebut?', jawabanBenar: 'Tokoh', pengecoh: ['Latar', 'Tema', 'Amanat'], challengeType: 'IDENTIFY' },
  { topik: 'Kalimat', pertanyaan: '"Ibu memasak nasi". Siapa yang memasak?', jawabanBenar: 'Ibu', pengecoh: ['Nasi', 'Memasak', 'Dapur'], challengeType: 'IDENTIFY' },
  { topik: 'Tanda Baca', pertanyaan: 'Kalimat berita diakhiri dengan tanda apa?', jawabanBenar: 'Titik (.)', pengecoh: ['Koma (,)', 'Seru (!)', 'Tanya (?)'], challengeType: 'IDENTIFY' }
];

let items = [];
let idCount = 1;
sd_bindo.forEach(item => {
  items.push({
    id: `sd_bind_${idCount++}`,
    jenjang: 'SD',
    kelasAtauFase: 'Fase B',
    mataPelajaran: 'Bahasa Indonesia',
    topik: item.topik,
    pertanyaan: item.pertanyaan,
    jawabanBenar: item.jawabanBenar,
    pengecoh: item.pengecoh,
    challengeType: item.challengeType
  });
});

const fileContent = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf-8');

const before = fileContent.substring(0, fileContent.indexOf('];\n', fileContent.indexOf('export const SAMPLE_EDUCATIONAL_CONTENT')));
const after = fileContent.substring(fileContent.indexOf('];\n', fileContent.indexOf('export const SAMPLE_EDUCATIONAL_CONTENT')));

let newItemsStr = JSON.stringify(items, null, 2).replace(/"([^"]+)":/g, '$1:');
// remove opening bracket and closing bracket
newItemsStr = newItemsStr.substring(1, newItemsStr.length - 1);

const finalStr = before + ',' + newItemsStr + after;

fs.writeFileSync('src/engine/EducationalEngine.ts', finalStr);
console.log('Added 30 Bahasa Indonesia items');
