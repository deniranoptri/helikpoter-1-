const fs = require('fs');

const newQuestions = [
  {
    "id": "FC-SENI-001",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Alat Musik",
    "pertanyaan": "Saat pentas, Budi menabuh gendang dan Edo memainkan marakas. Alat musik yang dimainkan mereka termasuk jenis...",
    "jawabanBenar": "Alat musik ritmis",
    "pengecoh": [
      "Alat musik melodis",
      "Alat musik harmonis",
      "Alat musik tiup"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Gendang dan marakas adalah alat musik pengatur irama yang tidak memiliki nada pasti, sehingga disebut alat musik ritmis."
  },
  {
    "id": "FC-SENI-002",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Bernyanyi",
    "pertanyaan": "Paduan suara kelas V menyanyikan sebuah lagu secara bersama-sama dengan satu suara. Cara bernyanyi seperti ini disebut...",
    "jawabanBenar": "Bernyanyi unisono",
    "pengecoh": [
      "Bernyanyi solo",
      "Bernyanyi kanon",
      "Bernyanyi akapela"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Unisono berarti menyanyikan suatu melodi bersama-sama dalam satu nada atau satu suara secara serempak."
  },
  {
    "id": "FC-SENI-003",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tempo",
    "pertanyaan": "Lagu 'Hari Merdeka' dinyanyikan dengan cepat dan penuh semangat. Ukuran kecepatan dalam memainkan lagu disebut...",
    "jawabanBenar": "Tempo",
    "pengecoh": [
      "Dinamika",
      "Melodi",
      "Harmoni"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Tempo adalah ukuran kecepatan birama lagu. Lagu yang gembira dan semangat biasanya bertempo cepat."
  },
  {
    "id": "FC-SENI-004",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Ansambel Musik",
    "pertanyaan": "Sekelompok siswa bermain pianika, rekorder, dan gitar secara bersama-sama di depan kelas. Pertunjukan ini disebut bermain musik...",
    "jawabanBenar": "Ansambel campuran",
    "pengecoh": [
      "Ansambel sejenis",
      "Paduan suara",
      "Orkes simfoni"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Ansambel campuran adalah penyajian musik yang dimainkan secara bersama-sama menggunakan berbagai jenis alat musik yang berbeda."
  },
  {
    "id": "FC-SENI-005",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Dinamika",
    "pertanyaan": "Saat menyanyikan lagu pengantar tidur, penyanyi melembutkan volume suaranya. Perubahan keras lembutnya suara dalam musik disebut...",
    "jawabanBenar": "Dinamika",
    "pengecoh": [
      "Tempo",
      "Artikulasi",
      "Intonasi"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Dinamika memberikan ekspresi pada lagu melalui perubahan tingkat kekerasan atau kelembutan suara."
  },
  {
    "id": "FC-SENI-006",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Alat Musik Daerah",
    "pertanyaan": "Angklung adalah alat musik tradisional dari Jawa Barat yang terbuat dari bambu. Cara membunyikannya adalah dengan...",
    "jawabanBenar": "Digoyangkan",
    "pengecoh": [
      "Ditiup",
      "Dipetik",
      "Dipukul"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Angklung menghasilkan suara dari benturan tabung bambu yang terjadi ketika alat tersebut digoyangkan."
  },
  {
    "id": "FC-SENI-007",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Birama",
    "pertanyaan": "Sebuah lagu daerah ditulis dengan tanda birama 3/4. Angka tersebut memiliki arti bahwa setiap birama terdiri dari...",
    "jawabanBenar": "Tiga ketukan",
    "pengecoh": [
      "Empat ketukan",
      "Tiga per empat ketukan",
      "Tiga nada dasar"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Angka pembilang pada birama (angka 3) menunjukkan jumlah ketukan dalam setiap ruas birama."
  },
  {
    "id": "FC-SENI-008",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Harmoni",
    "pertanyaan": "Dalam paduan suara, pembagian suara menjadi suara 1 dan suara 2 bertujuan agar paduan nada terdengar...",
    "jawabanBenar": "Selaras dan harmonis",
    "pengecoh": [
      "Lebih keras",
      "Cepat selesai",
      "Sama persis"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Pembagian suara melodi yang berbeda menghasilkan harmoni atau keselarasan nada yang indah saat dinyanyikan bersama."
  },
  {
    "id": "FC-SENI-009",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Warna",
    "pertanyaan": "Saat melukis, Andi ingin membuat warna hijau. Ia harus mencampurkan dua warna dasar, yaitu...",
    "jawabanBenar": "Kuning dan biru",
    "pengecoh": [
      "Merah dan kuning",
      "Merah dan biru",
      "Hitam dan putih"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Hijau adalah warna sekunder yang dihasilkan dari percampuran warna primer kuning dan biru."
  },
  {
    "id": "FC-SENI-010",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Teknik Berkarya",
    "pertanyaan": "Dina membuat karya seni dengan cara menempelkan potongan-potongan kertas kecil pada sebuah gambar. Teknik ini disebut...",
    "jawabanBenar": "Kolase",
    "pengecoh": [
      "Menganyam",
      "Membatik",
      "Mengecor"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Kolase adalah seni menempel kepingan atau potongan bahan (seperti kertas, daun) pada permukaan bidang dua dimensi."
  },
  {
    "id": "FC-SENI-011",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Teknik Menggambar",
    "pertanyaan": "Menggambar bayangan objek menggunakan tarikan garis sejajar atau menyilang berulang-ulang disebut teknik...",
    "jawabanBenar": "Arsir",
    "pengecoh": [
      "Dusel",
      "Pointilis",
      "Aquarel"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Teknik arsir menggunakan garis-garis sejajar atau silang untuk menciptakan efek gelap terang dan dimensi pada gambar."
  },
  {
    "id": "FC-SENI-012",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Proporsi",
    "pertanyaan": "Saat menggambar manusia, Budi memperhatikan perbandingan ukuran antara kepala, badan, dan kaki agar terlihat wajar. Budi sedang menerapkan prinsip...",
    "jawabanBenar": "Proporsi",
    "pengecoh": [
      "Kesatuan",
      "Keseimbangan",
      "Irama"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Proporsi adalah prinsip seni rupa yang mengatur perbandingan ukuran antar bagian agar benda terlihat proporsional dan realistis."
  },
  {
    "id": "FC-SENI-013",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Kerajinan",
    "pertanyaan": "Memanfaatkan botol plastik bekas menjadi pot bunga yang indah adalah contoh kegiatan berkarya seni yang bertujuan untuk...",
    "jawabanBenar": "Mendaur ulang barang bekas",
    "pengecoh": [
      "Menghabiskan uang saku",
      "Meniru karya seniman",
      "Membuang sampah sembarangan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Berkarya menggunakan barang bekas (daur ulang) membantu mengurangi sampah sekaligus menghasilkan benda fungsional yang bernilai estetika."
  },
  {
    "id": "FC-SENI-014",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tekstur",
    "pertanyaan": "Saat kita meraba sebuah patung kayu, permukaannya terasa kasar. Sifat permukaan benda ini dalam seni rupa disebut...",
    "jawabanBenar": "Tekstur nyata",
    "pengecoh": [
      "Tekstur semu",
      "Warna gelap",
      "Ruang tiga dimensi"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Tekstur nyata adalah sifat permukaan benda yang ketika dilihat dan diraba rasanya sama (misal: terlihat kasar, diraba juga kasar)."
  },
  {
    "id": "FC-SENI-015",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Teknik Menggambar",
    "pertanyaan": "Seniman itu melukis pemandangan hanya dengan menggunakan kumpulan titik-titik kecil yang sangat padat. Teknik lukis ini dikenal dengan nama...",
    "jawabanBenar": "Pointilis",
    "pengecoh": [
      "Plakat",
      "Siluet",
      "Dusel"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Teknik pointilis menciptakan objek dan bayangan menggunakan ribuan titik kecil warna tanpa garis tebal."
  },
  {
    "id": "FC-SENI-016",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Komposisi",
    "pertanyaan": "Agar gambar pemandangan tidak terlihat miring atau berat sebelah, kita harus mengatur letak objek dengan baik. Prinsip ini disebut...",
    "jawabanBenar": "Keseimbangan atau komposisi",
    "pengecoh": [
      "Keselarasan warna",
      "Penekanan objek",
      "Gradasi bayangan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Keseimbangan (balance) merupakan prinsip komposisi agar susunan objek gambar terasa utuh dan tidak berat sebelah."
  },
  {
    "id": "FC-SENI-017",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Pola Lantai",
    "pertanyaan": "Saat menari berkelompok, para penari bergerak membentuk formasi garis lurus dari depan ke belakang. Formasi ini disebut pola lantai...",
    "jawabanBenar": "Vertikal",
    "pengecoh": [
      "Melingkar",
      "Horizontal",
      "Diagonal"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Pola lantai lurus dari depan ke belakang atau sebaliknya disebut dengan pola lantai garis lurus vertikal."
  },
  {
    "id": "FC-SENI-018",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Properti Tari",
    "pertanyaan": "Tari Piring dari Sumatera Barat dimainkan dengan membawa piring di tangan penari. Piring dalam tarian tersebut berfungsi sebagai...",
    "jawabanBenar": "Properti tari",
    "pengecoh": [
      "Pakaian tari",
      "Tata rias",
      "Panggung tari"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Benda apa pun yang dibawa, dipegang, atau dimainkan oleh penari saat menari disebut properti tari."
  },
  {
    "id": "FC-SENI-019",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Level Gerak",
    "pertanyaan": "Dalam sebuah pertunjukan tari, beberapa penari melakukan gerakan sambil duduk bersimpuh di lantai. Gerakan ini termasuk dalam...",
    "jawabanBenar": "Level gerak rendah",
    "pengecoh": [
      "Level gerak sedang",
      "Level gerak tinggi",
      "Level gerak vertikal"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Gerak yang dilakukan menyentuh lantai (seperti duduk, bersimpuh, rebah) termasuk dalam eksplorasi tari pada level rendah."
  },
  {
    "id": "FC-SENI-020",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Wirama",
    "pertanyaan": "Agar tarian terlihat indah dan kompak, setiap langkah dan ayunan tangan penari harus selalu disesuaikan dengan...",
    "jawabanBenar": "Irama iringan musik",
    "pengecoh": [
      "Tata cahaya panggung",
      "Warna baju penonton",
      "Teriakan sutradara"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Kesesuaian antara irama musik dengan tempo dan ritme gerak penari dikenal sebagai unsur wirama."
  },
  {
    "id": "FC-SENI-021",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Wirasa",
    "pertanyaan": "Penari memperlihatkan senyuman ceria karena tarian tersebut menceritakan suasana pesta panen yang bahagia. Hal ini merupakan unsur tari yaitu...",
    "jawabanBenar": "Wirasa atau penjiwaan",
    "pengecoh": [
      "Wiraga atau raga",
      "Wirama atau irama",
      "Tata rias panggung"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Wirasa adalah penghayatan atau penjiwaan tarian yang dipancarkan melalui ekspresi wajah dan kualitas tenaga penari."
  },
  {
    "id": "FC-SENI-022",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Ruang Gerak",
    "pertanyaan": "Penari merentangkan kedua tangannya lebar-lebar sambil melompat ke udara. Gerakan ini menunjukkan penggunaan...",
    "jawabanBenar": "Ruang gerak yang luas",
    "pengecoh": [
      "Ruang gerak yang sempit",
      "Waktu yang lambat",
      "Tenaga yang lemah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Merentangkan anggota badan sejauh-jauhnya dari titik pusat tubuh merupakan pemanfaatan volume ruang gerak secara maksimal."
  },
  {
    "id": "FC-SENI-023",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tari Kreasi",
    "pertanyaan": "Sebuah tarian diciptakan dengan menggabungkan gerak tari daerah dengan gaya modern yang lebih bebas. Tarian jenis ini disebut...",
    "jawabanBenar": "Tari kreasi baru",
    "pengecoh": [
      "Tari tradisional klasik",
      "Tari kerakyatan asli",
      "Tari adat primitif"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Tari kreasi baru adalah inovasi seni tari yang tidak lagi terikat kuat dengan pakem-pakem tradisi aslinya."
  },
  {
    "id": "FC-SENI-024",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Ekspresi Mimik",
    "pertanyaan": "Saat memerankan tokoh yang sedang marah, aktor mengerutkan dahi dan menatap tajam. Perubahan wajah ini disebut...",
    "jawabanBenar": "Mimik wajah",
    "pengecoh": [
      "Gerak tubuh",
      "Tata rias",
      "Bloking panggung"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Mimik wajah adalah ekspresi raut muka pemain untuk menunjukkan emosi tokoh yang diperankannya."
  },
  {
    "id": "FC-SENI-025",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Pantomim",
    "pertanyaan": "Sebuah pertunjukan teater dilakukan tanpa dialog sama sekali, hanya menggunakan riasan putih di wajah dan gerak tubuh. Pertunjukan ini disebut...",
    "jawabanBenar": "Pantomim",
    "pengecoh": [
      "Sendratari",
      "Opera",
      "Wayang orang"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Pantomim adalah bentuk seni pertunjukan teater yang mengekspresikan cerita sepenuhnya melalui isyarat tubuh tanpa ucapan."
  },
  {
    "id": "FC-SENI-026",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Artikulasi",
    "pertanyaan": "Saat berbicara di panggung, aktor harus membuka mulut dengan baik agar setiap kata terdengar jelas oleh penonton. Ini disebut...",
    "jawabanBenar": "Artikulasi yang jelas",
    "pengecoh": [
      "Volume suara pelan",
      "Improvisasi gerak",
      "Membaca naskah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Artikulasi adalah kejelasan dalam mengucapkan kata-kata sehingga pesan dialog sampai kepada penonton tanpa kebingungan."
  },
  {
    "id": "FC-SENI-027",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Improvisasi",
    "pertanyaan": "Saat pementasan, Budi lupa sebagian dialognya. Ia kemudian membuat kalimat sendiri yang spontan namun tetap sesuai cerita. Budi melakukan...",
    "jawabanBenar": "Improvisasi",
    "pengecoh": [
      "Intonasi",
      "Evaluasi",
      "Latihan rutin"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Improvisasi adalah gerak atau dialog spontan (tanpa naskah) yang dilakukan aktor untuk menyelamatkan pementasan."
  },
  {
    "id": "FC-SENI-028",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Tata Rias",
    "pertanyaan": "Wajah seorang siswa kelas V dirias dengan garis-garis keriput dan kumis putih agar terlihat seperti kakek-kakek. Ini adalah fungsi dari...",
    "jawabanBenar": "Tata rias karakter",
    "pengecoh": [
      "Tata panggung",
      "Tata cahaya",
      "Tata suara"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Tata rias karakter berfungsi mengubah wajah asli aktor agar sesuai dengan usia, sifat, dan ciri fisik tokoh cerita."
  },
  {
    "id": "FC-SENI-029",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Bloking",
    "pertanyaan": "Sutradara mengatur agar posisi pemain di panggung tidak saling menutupi satu sama lain dan tidak membelakangi penonton. Aturan ini disebut...",
    "jawabanBenar": "Bloking panggung",
    "pengecoh": [
      "Properti pentas",
      "Tata busana",
      "Gladi bersih"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Bloking adalah pengaturan letak dan pergerakan pemain di atas panggung agar pementasan terlihat rapi dan komunikatif."
  },
  {
    "id": "FC-SENI-030",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Seni Budaya",
    "topik": "Karakter Penokohan",
    "pertanyaan": "Dalam drama Bawang Merah Bawang Putih, tokoh Bawang Merah memiliki watak jahat dan suka iri hati. Tokoh seperti ini disebut...",
    "jawabanBenar": "Tokoh antagonis",
    "pengecoh": [
      "Tokoh protagonis",
      "Tokoh figuran",
      "Tokoh pahlawan"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Tokoh antagonis adalah karakter yang memiliki watak buruk atau jahat dan biasanya selalu menentang tokoh utama."
  }
];

const filePath = 'src/engine/EducationalEngine.ts';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/m;
const match = content.match(regex);

if (match) {
  let arr;
  try {
    arr = eval(match[1]);
  } catch (err) {
    console.error('Eval error', err);
    process.exit(1);
  }
  
  const newQuestionsMap = new Map();
  newQuestions.forEach(q => newQuestionsMap.set(q.id, q));
  
  let replaced = 0;
  const updatedArr = arr.map(q => {
    if (newQuestionsMap.has(q.id)) {
      replaced++;
      const newQ = newQuestionsMap.get(q.id);
      newQuestionsMap.delete(q.id);
      return newQ;
    }
    return q;
  });
  
  if (newQuestionsMap.size > 0) {
      newQuestionsMap.forEach(q => {
          updatedArr.push(q);
      });
      console.log('Appended', newQuestionsMap.size, 'new questions.');
  }
  
  if (replaced > 0) {
      console.log('Replaced', replaced, 'questions.');
  }
  
  const updatedStr = JSON.stringify(updatedArr, null, 2);
  const newContent = content.replace(match[1], updatedStr);
  fs.writeFileSync(filePath, newContent);
  console.log('Successfully updated the array and wrote to file.');
} else {
  console.log('Could not find SAMPLE_EDUCATIONAL_CONTENT array in the file');
  process.exit(1);
}
