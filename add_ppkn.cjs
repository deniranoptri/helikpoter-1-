const fs = require('fs');

const sd_pancasila = [
  { topik: 'Simbol', pertanyaan: 'Sila pertama Pancasila dilambangkan dengan apa?', jawabanBenar: 'Bintang', pengecoh: ['Rantai', 'Pohon', 'Banteng'], challengeType: 'IDENTIFY' },
  { topik: 'Perilaku', pertanyaan: 'Sebelum makan, kita sebaiknya melakukan apa?', jawabanBenar: 'Berdoa', pengecoh: ['Bermain', 'Berlari', 'Tidur'], challengeType: 'IDENTIFY' },
  { topik: 'Gotong Royong', pertanyaan: 'Membersihkan kelas bersama-sama disebut apa?', jawabanBenar: 'Gotong royong', pengecoh: ['Bermain', 'Persaingan', 'Pertengkaran'], challengeType: 'IDENTIFY' },
  { topik: 'Sikap', pertanyaan: 'Jika teman sakit, apa yang sebaiknya dilakukan?', jawabanBenar: 'Menjenguk', pengecoh: ['Mengejek', 'Menjauhi', 'Memusuhi'], challengeType: 'IDENTIFY' },
  { topik: 'Aturan', pertanyaan: 'Lampu lalu lintas merah artinya apa?', jawabanBenar: 'Berhenti', pengecoh: ['Jalan', 'Lari', 'Ngebut'], challengeType: 'IDENTIFY' },
  { topik: 'Hak & Kewajiban', pertanyaan: 'Belajar dengan rajin adalah tugas seorang apa?', jawabanBenar: 'Siswa', pengecoh: ['Guru', 'Dokter', 'Polisi'], challengeType: 'IDENTIFY' },
  { topik: 'Toleransi', pertanyaan: 'Teman sedang beribadah, kita harus bersikap apa?', jawabanBenar: 'Tenang', pengecoh: ['Ribut', 'Mengganggu', 'Berteriak'], challengeType: 'IDENTIFY' },
  { topik: 'Musyawarah', pertanyaan: 'Menyelesaikan masalah bersama disebut apa?', jawabanBenar: 'Musyawarah', pengecoh: ['Memaksa', 'Bertengkar', 'Menangis'], challengeType: 'IDENTIFY' },
  { topik: 'Persatuan', pertanyaan: 'Walaupun berbeda suku, kita harus tetap apa?', jawabanBenar: 'Rukun', pengecoh: ['Bermusuhan', 'Berdebat', 'Egois'], challengeType: 'IDENTIFY' },
  { topik: 'Simbol', pertanyaan: 'Simbol padi dan kapas ada pada sila ke?', jawabanBenar: 'Lima', pengecoh: ['Satu', 'Dua', 'Tiga'], challengeType: 'IDENTIFY' },
  { topik: 'Perilaku', pertanyaan: 'Bertemu guru di jalan sebaiknya kita apa?', jawabanBenar: 'Menyapa', pengecoh: ['Diam', 'Sembunyi', 'Lari'], challengeType: 'IDENTIFY' },
  { topik: 'Kejujuran', pertanyaan: 'Menemukan uang di kelas, sebaiknya diberikan ke?', jawabanBenar: 'Guru', pengecoh: ['Jajan', 'Sembunyikan', 'Dibuang'], challengeType: 'IDENTIFY' },
  { topik: 'Hak & Kewajiban', pertanyaan: 'Mendapat kasih sayang adalah contoh dari apa?', jawabanBenar: 'Hak', pengecoh: ['Kewajiban', 'Tugas', 'Hukuman'], challengeType: 'IDENTIFY' },
  { topik: 'Sikap', pertanyaan: 'Saat meminjam barang teman, kita harus bilang?', jawabanBenar: 'Izin', pengecoh: ['Diam', 'Maksa', 'Rebut'], challengeType: 'IDENTIFY' },
  { topik: 'Simbol', pertanyaan: 'Lambang negara Indonesia adalah burung apa?', jawabanBenar: 'Garuda', pengecoh: ['Merpati', 'Elang', 'Gagak'], challengeType: 'IDENTIFY' },
  { topik: 'Aturan', pertanyaan: 'Membuang sampah sebaiknya di mana?', jawabanBenar: 'Tempat sampah', pengecoh: ['Sungai', 'Jalan', 'Kelas'], challengeType: 'IDENTIFY' },
  { topik: 'Toleransi', pertanyaan: 'Jika ada teman yang berbeda agama, kita?', jawabanBenar: 'Menghargai', pengecoh: ['Mengejek', 'Menghina', 'Menjauhi'], challengeType: 'IDENTIFY' },
  { topik: 'Musyawarah', pertanyaan: 'Pemilihan ketua kelas biasanya dengan cara?', jawabanBenar: 'Musyawarah', pengecoh: ['Tebak', 'Undian', 'Paksaan'], challengeType: 'IDENTIFY' },
  { topik: 'Gotong Royong', pertanyaan: 'Pekerjaan berat akan terasa ringan jika dikerjakan?', jawabanBenar: 'Bersama', pengecoh: ['Sendiri', 'Terpaksa', 'Lama'], challengeType: 'IDENTIFY' },
  { topik: 'Perilaku', pertanyaan: 'Sikap kita kepada orang tua haruslah?', jawabanBenar: 'Hormat', pengecoh: ['Melawan', 'Cuek', 'Kasar'], challengeType: 'IDENTIFY' },
  { topik: 'Simbol', pertanyaan: 'Rantai emas adalah lambang sila ke berapa?', jawabanBenar: 'Dua', pengecoh: ['Satu', 'Tiga', 'Empat'], challengeType: 'IDENTIFY' },
  { topik: 'Persatuan', pertanyaan: 'Bersatu kita teguh, bercerai kita apa?', jawabanBenar: 'Runtuh', pengecoh: ['Kuat', 'Menang', 'Hebat'], challengeType: 'IDENTIFY' },
  { topik: 'Aturan', pertanyaan: 'Jika berbuat salah, kita sebaiknya mengucapkan apa?', jawabanBenar: 'Maaf', pengecoh: ['Terima', 'Tolong', 'Permisi'], challengeType: 'IDENTIFY' },
  { topik: 'Sikap', pertanyaan: 'Orang yang membantu orang lain disebut anak yang?', jawabanBenar: 'Baik', pengecoh: ['Nakal', 'Sombong', 'Malas'], challengeType: 'IDENTIFY' },
  { topik: 'Hak & Kewajiban', pertanyaan: 'Menjaga kebersihan rumah adalah tugas dari siapa?', jawabanBenar: 'Semua', pengecoh: ['Ibu', 'Ayah', 'Kakak'], challengeType: 'IDENTIFY' },
  { topik: 'Gotong Royong', pertanyaan: 'Siskamling adalah bentuk dari kegiatan apa?', jawabanBenar: 'Kerja bakti', pengecoh: ['Bermain', 'Pesta', 'Belajar'], challengeType: 'IDENTIFY' },
  { topik: 'Toleransi', pertanyaan: 'Indonesia memiliki semboyan Bhinneka Tunggal apa?', jawabanBenar: 'Ika', pengecoh: ['Eka', 'Aka', 'Ita'], challengeType: 'IDENTIFY' },
  { topik: 'Perilaku', pertanyaan: 'Saat menerima hadiah, kita harus mengucapkan apa?', jawabanBenar: 'Terima kasih', pengecoh: ['Maaf', 'Tolong', 'Halo'], challengeType: 'IDENTIFY' },
  { topik: 'Sikap', pertanyaan: 'Mencontek saat ujian adalah perbuatan yang?', jawabanBenar: 'Buruk', pengecoh: ['Baik', 'Hebat', 'Boleh'], challengeType: 'IDENTIFY' },
  { topik: 'Simbol', pertanyaan: 'Sila ketiga Pancasila dilambangkan dengan pohon?', jawabanBenar: 'Beringin', pengecoh: ['Mangga', 'Pisang', 'Jati'], challengeType: 'IDENTIFY' }
];

let items = [];
let idCount = 1;
sd_pancasila.forEach(item => {
  items.push({
    id: `sd_pkn_${idCount++}`,
    jenjang: 'SD',
    kelasAtauFase: 'Fase B',
    mataPelajaran: 'Pendidikan Pancasila',
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
console.log('Added 30 Pendidikan Pancasila items');
