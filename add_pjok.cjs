const fs = require('fs');

const sd_pjok = [
  { topik: 'Gerak Dasar', pertanyaan: 'Lari dan jalan termasuk gerak apa?', jawabanBenar: 'Lokomotor', pengecoh: ['Nonlokomotor', 'Manipulatif', 'Diam'], challengeType: 'IDENTIFY' },
  { topik: 'Gerak Dasar', pertanyaan: 'Gerak berpindah tempat disebut gerak apa?', jawabanBenar: 'Lokomotor', pengecoh: ['Nonlokomotor', 'Manipulatif', 'Refleks'], challengeType: 'IDENTIFY' },
  { topik: 'Gerak Dasar', pertanyaan: 'Melempar bola termasuk gerak dasar apa?', jawabanBenar: 'Manipulatif', pengecoh: ['Lokomotor', 'Nonlokomotor', 'Pasif'], challengeType: 'IDENTIFY' },
  { topik: 'Gerak Dasar', pertanyaan: 'Mengayunkan lengan tanpa berpindah disebut gerak?', jawabanBenar: 'Nonlokomotor', pengecoh: ['Lokomotor', 'Manipulatif', 'Aktif'], challengeType: 'IDENTIFY' },
  { topik: 'Olahraga', pertanyaan: 'Sebelum berolahraga, kita sebaiknya melakukan apa?', jawabanBenar: 'Pemanasan', pengecoh: ['Tidur', 'Makan', 'Pendinginan'], challengeType: 'IDENTIFY' },
  { topik: 'Olahraga', pertanyaan: 'Setelah berolahraga, kita sebaiknya melakukan apa?', jawabanBenar: 'Pendinginan', pengecoh: ['Pemanasan', 'Tidur', 'Makan'], challengeType: 'IDENTIFY' },
  { topik: 'Keselamatan', pertanyaan: 'Pemanasan bertujuan untuk mencegah terjadinya apa?', jawabanBenar: 'Cedera', pengecoh: ['Lapar', 'Haus', 'Kantuk'], challengeType: 'IDENTIFY' },
  { topik: 'Kesehatan', pertanyaan: 'Berolahraga rutin membuat tubuh kita menjadi?', jawabanBenar: 'Sehat', pengecoh: ['Sakit', 'Lemah', 'Lesu'], challengeType: 'IDENTIFY' },
  { topik: 'Kesehatan', pertanyaan: 'Minum air putih mencegah tubuh mengalami?', jawabanBenar: 'Dehidrasi', pengecoh: ['Cedera', 'Patah tulang', 'Kram'], challengeType: 'IDENTIFY' },
  { topik: 'Kesehatan', pertanyaan: 'Sumber tenaga untuk berolahraga berasal dari?', jawabanBenar: 'Makanan', pengecoh: ['Pakaian', 'Sepatu', 'Topi'], challengeType: 'IDENTIFY' },
  { topik: 'Keselamatan', pertanyaan: 'Alas kaki yang aman untuk lari?', jawabanBenar: 'Sepatu', pengecoh: ['Sandal', 'Sepatu Hak', 'Telanjang'], challengeType: 'IDENTIFY' },
  { topik: 'Kesehatan', pertanyaan: 'Makanan bergizi membuat tubuh kita menjadi?', jawabanBenar: 'Kuat', pengecoh: ['Lemah', 'Sakit', 'Ngantuk'], challengeType: 'IDENTIFY' },
  { topik: 'Keselamatan', pertanyaan: 'Bermain sepak bola sebaiknya dilakukan di?', jawabanBenar: 'Lapangan', pengecoh: ['Kelas', 'Jalan Raya', 'Atap'], challengeType: 'IDENTIFY' },
  { topik: 'Permainan', pertanyaan: 'Menendang bola merupakan teknik dasar permainan?', jawabanBenar: 'Sepak Bola', pengecoh: ['Basket', 'Voli', 'Tenis'], challengeType: 'IDENTIFY' },
  { topik: 'Keselamatan', pertanyaan: 'Berenang memakai pelampung untuk menjaga apa?', jawabanBenar: 'Keselamatan', pengecoh: ['Kecepatan', 'Kerapian', 'Gaya'], challengeType: 'IDENTIFY' },
  { topik: 'Olahraga', pertanyaan: 'Sikap awal saat akan berlari lari cepat?', jawabanBenar: 'Bersedia', pengecoh: ['Tidur', 'Duduk', 'Telentang'], challengeType: 'IDENTIFY' },
  { topik: 'Kebersihan', pertanyaan: 'Mencuci tangan sebaiknya menggunakan air dan?', jawabanBenar: 'Sabun', pengecoh: ['Minyak', 'Pasir', 'Debu'], challengeType: 'IDENTIFY' },
  { topik: 'Kebersihan', pertanyaan: 'Mandi secara teratur membersihkan tubuh dari?', jawabanBenar: 'Kuman', pengecoh: ['Keringat bersih', 'Otot', 'Darah'], challengeType: 'IDENTIFY' },
  { topik: 'Kesehatan', pertanyaan: 'Istirahat yang paling baik untuk tubuh?', jawabanBenar: 'Tidur', pengecoh: ['Main', 'Nonton', 'Lari'], challengeType: 'IDENTIFY' },
  { topik: 'Kebersihan', pertanyaan: 'Setelah bermain di luar, kita harus?', jawabanBenar: 'Cuci tangan', pengecoh: ['Makan', 'Tidur', 'Main lagi'], challengeType: 'IDENTIFY' },
  { topik: 'Olahraga', pertanyaan: 'Posisi badan saat lari cepat sebaiknya?', jawabanBenar: 'Condong', pengecoh: ['Tegak', 'Membungkuk', 'Telentang'], challengeType: 'IDENTIFY' },
  { topik: 'Permainan', pertanyaan: 'Memantulkan bola ke lantai disebut gerak?', jawabanBenar: 'Dribbling', pengecoh: ['Passing', 'Shooting', 'Smash'], challengeType: 'IDENTIFY' },
  { topik: 'Permainan', pertanyaan: 'Pukulan awal dalam permainan voli disebut?', jawabanBenar: 'Servis', pengecoh: ['Smash', 'Blok', 'Passing'], challengeType: 'IDENTIFY' },
  { topik: 'Olahraga', pertanyaan: 'Olahraga renang gaya dada sering disebut?', jawabanBenar: 'Gaya katak', pengecoh: ['Gaya bebas', 'Gaya punggung', 'Gaya lumba'], challengeType: 'IDENTIFY' },
  { topik: 'Olahraga', pertanyaan: 'Senam yang diiringi oleh musik disebut?', jawabanBenar: 'Senam ritmik', pengecoh: ['Senam lantai', 'Senam alat', 'Senam ketangkasan'], challengeType: 'IDENTIFY' },
  { topik: 'Kebugaran', pertanyaan: 'Berdiri dengan satu kaki melatih apa?', jawabanBenar: 'Keseimbangan', pengecoh: ['Kecepatan', 'Kekuatan', 'Kelenturan'], challengeType: 'IDENTIFY' },
  { topik: 'Kebugaran', pertanyaan: 'Lari lari kecil atau pelan disebut?', jawabanBenar: 'Joging', pengecoh: ['Sprint', 'Maraton', 'Estafet'], challengeType: 'IDENTIFY' },
  { topik: 'Kebersihan', pertanyaan: 'Membuang sampah sembarangan membuat lingkungan menjadi?', jawabanBenar: 'Kotor', pengecoh: ['Bersih', 'Sehat', 'Wangi'], challengeType: 'IDENTIFY' },
  { topik: 'Keselamatan', pertanyaan: 'Tempat bermain yang basah dapat menyebabkan?', jawabanBenar: 'Terpeleset', pengecoh: ['Menang', 'Cepat', 'Kuat'], challengeType: 'IDENTIFY' },
  { topik: 'Kebersihan', pertanyaan: 'Menggosok gigi sebaiknya dilakukan sebelum apa?', jawabanBenar: 'Tidur', pengecoh: ['Bermain', 'Mandi', 'Lari'], challengeType: 'IDENTIFY' }
];

let items = [];
let idCount = 1;
sd_pjok.forEach(item => {
  items.push({
    id: `sd_pjok_${idCount++}`,
    jenjang: 'SD',
    kelasAtauFase: 'Fase B',
    mataPelajaran: 'PJOK',
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
newItemsStr = newItemsStr.substring(1, newItemsStr.length - 1);

const finalStr = before + ',' + newItemsStr + after;

fs.writeFileSync('src/engine/EducationalEngine.ts', finalStr);
console.log('Added 30 PJOK items');
