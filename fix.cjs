const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/(export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = )(\[[\s\S]*\]);/);
if (!match) {
  console.log("Not found array");
  process.exit(1);
}

const arr = eval(match[2]);

const changes = {
  "FA-C-BIND-001": {
    j: "Sampah plastik sulit terurai, menjadi persoalan serius.",
    p: [
      "Mikroorganisme tanah butuh ratusan tahun untuk hidup.",
      "Kita harus mengurangi barang di sekitar kita.",
      "Plastik sekali pakai mudah digunakan dan dibuang."
    ]
  },
  "FA-C-BIND-003": {
    j: "Lani mengantuk di kelas karena kurang tidur.",
    p: [
      "Lani sangat menyukai pelajaran matematika Pak Guru.",
      "Lani sakit gigi sehingga tidak mendengarkan penjelasan.",
      "Lani merasa segar karena menyelesaikan proyek sainsnya."
    ]
  },
  "FA-C-BIND-008": {
    j: "Matahari terbit di timur, tenggelam di barat.",
    p: [
      "Nasi goreng warung itu paling enak sedunia.",
      "Mungkin sore nanti turun hujan deras.",
      "Sebaiknya kamu pulang sebelum hari menjadi gelap."
    ]
  },
  "FA-C-BIND-009": {
    j: "Pemandangan pantai sore hari sangat indah memukau.",
    p: [
      "Sapi termasuk hewan pemakan rumput (herbivora).",
      "Air membeku pada suhu 0 derajat Celcius.",
      "Kucing termasuk dalam golongan hewan mamalia."
    ]
  },
  "FA-C-BIND-012": {
    j: "pemborosan kata: 'banyak' dan 'siswa-siswa' bermakna jamak.",
    p: [
      "kalimat tersebut tidak memiliki unsur predikat dan objek.",
      "menggunakan huruf kapital yang salah di tengah kalimat.",
      "kata 'bermain' seharusnya ditambah akhiran '-kan'."
    ]
  },
  "FA-C-BIND-019": {
    j: "Fiksi berisi rekaan, nonfiksi berisi informasi fakta.",
    p: [
      "Fiksi menceritakan kehidupan nyata, nonfiksi menceritakan khayalan.",
      "Fiksi dibaca anak-anak, nonfiksi dibaca orang dewasa.",
      "Halaman buku fiksi tebal, buku nonfiksi tipis."
    ]
  },
  "FA-C-BIND-020": {
    j: '"Bagaimana cara Bapak mengolah sampah menjadi kompos?"',
    p: [
      '"Kapan Bapak mulai membuat pupuk kompos ini?"',
      '"Di mana Bapak menyimpan kompos yang jadi?"',
      '"Siapa yang menyuruh Bapak membuat pupuk kompos ini?"'
    ]
  },
  "FA-C-BIND-021": {
    j: "Andi sebaiknya kurangi bermain game agar cukup tidur.",
    p: [
      "Andi berhenti sekolah agar bebas bermain game.",
      "Guru piket tidak boleh menghukum Andi.",
      "Andi harus pindah sekolah yang masuknya siang."
    ]
  },
  "FA-C-BIND-025": {
    j: "Bersepeda menyehatkan tubuh dan menjadi transportasi ramah.",
    p: [
      "Asap motor dapat menyebabkan penyakit jantung.",
      "Sepeda dikayuh kekuatan otot agar berjalan cepat.",
      "Semua orang bekerja naik sepeda tanpa bahan bakar."
    ]
  },
  "FA-C-BIND-027": {
    j: "mengajak bekerja sama menjaga kebersihan kelas",
    p: [
      "meminta maaf jika ada kesalahan tugas piket",
      "menceritakan pengalaman pribadi membersihkan ruang kelas sendirian",
      "mengucapkan syukur karena bisa berkumpul di kelas"
    ]
  },
  "FA-C-BIND-028": {
    j: "(1)-(2)-(3)-(4)-(5)",
    p: [
      "(3)-(1)-(2)-(4)-(5)",
      "(1)-(3)-(2)-(5)-(4)",
      "(2)-(1)-(4)-(3)-(5)"
    ]
  }
};

let modifiedQuestions = 0;
arr.forEach(q => {
  if (changes[q.id]) {
    q.jawabanBenar = changes[q.id].j;
    q.pengecoh = changes[q.id].p;
    modifiedQuestions++;
  }
});

const newArrStr = JSON.stringify(arr, null, 2);
const newContent = content.substring(0, match.index) + match[1] + newArrStr + ";" + content.substring(match.index + match[0].length);

fs.writeFileSync('src/engine/EducationalEngine.ts', newContent);
console.log(`Modified ${modifiedQuestions} questions successfully.`);
