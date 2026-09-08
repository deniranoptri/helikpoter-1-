const fs = require('fs');

const sd_seni = [
  // Seni Rupa (8)
  { topik: 'Seni Rupa', pertanyaan: 'Warna merah dan kuning dicampur menjadi warna apa?', jawabanBenar: 'Oranye', pengecoh: ['Hijau', 'Ungu', 'Biru'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Rupa', pertanyaan: 'Kolase dibuat dengan cara apa pada bahan?', jawabanBenar: 'Menempel', pengecoh: ['Menggunting', 'Melukis', 'Menggambar'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Rupa', pertanyaan: 'Alat bantu untuk menggambar lingkaran yang rapi?', jawabanBenar: 'Jangka', pengecoh: ['Penggaris', 'Pensil', 'Penghapus'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Rupa', pertanyaan: 'Patung merupakan contoh karya seni berapa dimensi?', jawabanBenar: 'Tiga', pengecoh: ['Dua', 'Satu', 'Empat'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Rupa', pertanyaan: 'Tanah liat adalah bahan yang sifatnya?', jawabanBenar: 'Lunak', pengecoh: ['Keras', 'Cair', 'Tajam'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Rupa', pertanyaan: 'Lukisan di atas kertas adalah karya seni?', jawabanBenar: 'Dua dimensi', pengecoh: ['Tiga dimensi', 'Empat dimensi', 'Satu dimensi'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Rupa', pertanyaan: 'Garis yang melengkung memberikan kesan apa?', jawabanBenar: 'Luwes', pengecoh: ['Kaku', 'Keras', 'Tajam'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Rupa', pertanyaan: 'Unsur seni rupa yang terkecil adalah?', jawabanBenar: 'Titik', pengecoh: ['Garis', 'Bidang', 'Warna'], challengeType: 'IDENTIFY' },

  // Seni Musik (8)
  { topik: 'Seni Musik', pertanyaan: 'Alat musik gitar dimainkan dengan cara apa?', jawabanBenar: 'Dipetik', pengecoh: ['Ditiup', 'Dipukul', 'Digesek'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Musik', pertanyaan: 'Lagu bertempo cepat dinyanyikan dengan perasaan?', jawabanBenar: 'Gembira', pengecoh: ['Sedih', 'Malas', 'Marah'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Musik', pertanyaan: 'Alat musik angklung berasal dari daerah mana?', jawabanBenar: 'Jawa Barat', pengecoh: ['Bali', 'Papua', 'Sumatra'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Musik', pertanyaan: 'Tinggi rendahnya bunyi dalam musik disebut?', jawabanBenar: 'Nada', pengecoh: ['Tempo', 'Dinamika', 'Ritme'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Musik', pertanyaan: 'Alat musik drum dimainkan dengan cara apa?', jawabanBenar: 'Dipukul', pengecoh: ['Ditiup', 'Dipetik', 'Digesek'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Musik', pertanyaan: 'Orang yang memimpin kelompok paduan suara disebut?', jawabanBenar: 'Dirigen', pengecoh: ['Pianis', 'Gitaris', 'Vokalis'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Musik', pertanyaan: 'Lagu "Indonesia Raya" diciptakan oleh siapa?', jawabanBenar: 'W.R. Supratman', pengecoh: ['Ibu Sud', 'C. Simanjuntak', 'Ismail Marzuki'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Musik', pertanyaan: 'Cepat atau lambatnya sebuah lagu disebut?', jawabanBenar: 'Tempo', pengecoh: ['Nada', 'Birama', 'Melodi'], challengeType: 'IDENTIFY' },

  // Seni Tari (7)
  { topik: 'Seni Tari', pertanyaan: 'Gerak tubuh yang indah dan berirama disebut?', jawabanBenar: 'Tari', pengecoh: ['Nyanyi', 'Lukis', 'Teater'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Tari', pertanyaan: 'Tari Kecak berasal dari daerah mana?', jawabanBenar: 'Bali', pengecoh: ['Jawa', 'Sumatra', 'Papua'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Tari', pertanyaan: 'Garis yang dilalui penari di panggung disebut?', jawabanBenar: 'Pola lantai', pengecoh: ['Garis lurus', 'Garis lengkung', 'Batas panggung'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Tari', pertanyaan: 'Gerakan tarian harus sesuai dengan iringan apa?', jawabanBenar: 'Musik', pengecoh: ['Penonton', 'Angin', 'Panggung'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Tari', pertanyaan: 'Tari Saman dari Aceh biasanya dilakukan secara?', jawabanBenar: 'Berkelompok', pengecoh: ['Sendiri', 'Berpasangan', 'Acak'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Tari', pertanyaan: 'Perlengkapan yang digunakan penari saat menari disebut?', jawabanBenar: 'Properti', pengecoh: ['Pakaian', 'Hiasan', 'Mainan'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Tari', pertanyaan: 'Mimik wajah penari saat menari menunjukkan?', jawabanBenar: 'Ekspresi', pengecoh: ['Pola lantai', 'Arah gerak', 'Waktu'], challengeType: 'IDENTIFY' },

  // Seni Teater (7)
  { topik: 'Seni Teater', pertanyaan: 'Orang yang memainkan peran dalam drama disebut?', jawabanBenar: 'Aktor', pengecoh: ['Sutradara', 'Penulis', 'Penonton'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Teater', pertanyaan: 'Percakapan antara dua tokoh atau lebih disebut?', jawabanBenar: 'Dialog', pengecoh: ['Monolog', 'Prolog', 'Epilog'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Teater', pertanyaan: 'Orang yang memimpin pementasan teater disebut?', jawabanBenar: 'Sutradara', pengecoh: ['Aktor', 'Penari', 'Pemusik'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Teater', pertanyaan: 'Pakaian yang dipakai aktor saat pentas disebut?', jawabanBenar: 'Kostum', pengecoh: ['Properti', 'Latar', 'Topeng'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Teater', pertanyaan: 'Cerita rakyat "Sangkuriang" berasal dari mana?', jawabanBenar: 'Jawa Barat', pengecoh: ['Jawa Tengah', 'Bali', 'Papua'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Teater', pertanyaan: 'Tempat para aktor memainkan drama disebut?', jawabanBenar: 'Panggung', pengecoh: ['Lapangan', 'Kelas', 'Taman'], challengeType: 'IDENTIFY' },
  { topik: 'Seni Teater', pertanyaan: 'Gerak dan mimik wajah aktor berfungsi menyampaikan?', jawabanBenar: 'Perasaan', pengecoh: ['Properti', 'Latar', 'Tata rias'], challengeType: 'IDENTIFY' }
];

let items = [];
let idCount = 1;
sd_seni.forEach(item => {
  items.push({
    id: `sd_seni_${idCount++}`,
    jenjang: 'SD',
    kelasAtauFase: 'Fase B',
    mataPelajaran: 'Seni dan Budaya',
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
console.log('Added 30 Seni dan Budaya items');
