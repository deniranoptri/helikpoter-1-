const fs = require('fs');

const newQuestions = [
  {
    "id": "FC-PAN-001",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Perumusan Pancasila",
    "pertanyaan": "Para perumus Pancasila memiliki latar belakang yang berbeda-beda, namun mereka tetap bersatu. Sikap yang patut kita teladani dari para perumus Pancasila tersebut adalah...",
    "jawabanBenar": "Menghargai perbedaan pendapat",
    "pengecoh": [
      "Memaksakan kehendak",
      "Mementingkan golongan sendiri",
      "Menolak usulan dari orang lain"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Para tokoh pendiri bangsa menunjukkan sikap toleransi, kebersamaan, dan saling menghargai pendapat orang lain demi merumuskan dasar negara yang menyatukan seluruh rakyat."
  },
  {
    "id": "FC-PAN-002",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Perumusan Pancasila",
    "pertanyaan": "Dalam merumuskan dasar negara, tokoh-tokoh bangsa selalu mengedepankan musyawarah untuk mencapai mufakat. Hal ini menunjukkan bahwa mereka mencerminkan nilai Pancasila, khususnya sila ke-...",
    "jawabanBenar": "Keempat",
    "pengecoh": [
      "Ketiga",
      "Kedua",
      "Kesatu"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Musyawarah untuk mencapai mufakat merupakan inti pengamalan sila keempat Pancasila (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan)."
  },
  {
    "id": "FC-PAN-003",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-Nilai Pancasila",
    "pertanyaan": "Di sekolah, Edo berteman baik dengan Ali yang berbeda agama. Saat waktu ibadah tiba, Edo mempersilakan Ali untuk beribadah terlebih dahulu. Sikap Edo merupakan pengamalan Pancasila sila ke-...",
    "jawabanBenar": "Pertama",
    "pengecoh": [
      "Kedua",
      "Ketiga",
      "Kelima"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Menghargai dan memberikan kebebasan kepada pemeluk agama lain untuk beribadah adalah pengamalan sila pertama, Ketuhanan Yang Maha Esa."
  },
  {
    "id": "FC-PAN-004",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Nilai-Nilai Pancasila",
    "pertanyaan": "Terjadi bencana banjir di daerah tetangga. Sekolah Siti mengadakan penggalangan dana untuk membantu para korban. Tindakan Siti dan teman-temannya mengamalkan nilai Pancasila yang berlambang...",
    "jawabanBenar": "Rantai emas",
    "pengecoh": [
      "Bintang",
      "Pohon beringin",
      "Padi dan kapas"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Membantu korban bencana alam adalah wujud rasa kemanusiaan (sila kedua), yang dilambangkan dengan rantai emas."
  },
  {
    "id": "FC-PAN-005",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Keterkaitan Sila Pancasila",
    "pertanyaan": "Kelas V sedang bermusyawarah untuk menentukan ketua kelas. Setelah lama berdiskusi, kesepakatan mufakat tidak juga tercapai karena ada dua calon yang sama-sama kuat. Akhirnya, guru menyarankan pemungutan suara (voting). Calon A menang tipis atas calon B. Sikap terbaik yang harus ditunjukkan oleh pendukung calon B demi menjaga keutuhan kelas adalah...",
    "jawabanBenar": "Menerima hasil dan tetap bekerja sama",
    "pengecoh": [
      "Menolak hasil dan menuntut pemilihan ulang",
      "Menerima hasil tetapi menolak ikut kegiatan",
      "Meminta guru membagi kelas menjadi dua"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Dalam demokrasi dan musyawarah, jika mufakat tidak tercapai dan dilakukan pemungutan suara, hasil yang sah harus dihormati dan dilaksanakan bersama demi menjaga persatuan kelas."
  },
  {
    "id": "FC-PAN-006",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Fungsi Pancasila",
    "pertanyaan": "Pancasila berfungsi sebagai pandangan hidup bangsa Indonesia. Hal ini berarti Pancasila digunakan sebagai...",
    "jawabanBenar": "Pedoman dalam bertingkah laku sehari-hari",
    "pengecoh": [
      "Alat untuk menghukum orang bersalah",
      "Syarat untuk menjadi presiden",
      "Buku sejarah kemerdekaan Indonesia"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Sebagai pandangan hidup, nilai-nilai Pancasila menjadi penunjuk arah atau pedoman bagi masyarakat Indonesia dalam bersikap dan bertingkah laku di kehidupan sehari-hari."
  },
  {
    "id": "FC-PAN-007",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Sikap Keteladanan",
    "pertanyaan": "Para pendiri bangsa rela mengorbankan waktu, tenaga, dan pikirannya demi kemerdekaan. Sebagai siswa, bentuk rela berkorban yang bisa kamu lakukan di sekolah adalah...",
    "jawabanBenar": "Menyisihkan waktu istirahat untuk membantu teman",
    "pengecoh": [
      "Memberikan semua uang saku kepada teman",
      "Mengerjakan tugas teman agar dia bermain",
      "Rela dihukum meski tidak bersalah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Membantu teman belajar mengorbankan waktu pribadi demi kebaikan bersama. Jawaban lain adalah bentuk tindakan yang keliru (membiarkan teman malas atau menanggung hukuman salah)."
  },
  {
    "id": "FC-PAN-008",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Keterkaitan Sila Pancasila",
    "pertanyaan": "Andi melihat seorang murid baru dari luar pulau yang sedang kebingungan mencari kelas. Andi segera menolongnya dengan ramah meskipun mereka berbeda suku. Tindakan Andi merupakan wujud keterkaitan antara sila...",
    "jawabanBenar": "Sila kedua dan sila ketiga",
    "pengecoh": [
      "Sila pertama dan sila keempat",
      "Sila ketiga dan sila kelima",
      "Sila pertama dan sila kelima"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Menolong orang yang kesulitan adalah bentuk kemanusiaan (sila ke-2), dan melakukannya tanpa membedakan asal suku adalah wujud persatuan bangsa (sila ke-3)."
  },
  {
    "id": "FC-PAN-009",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Norma Masyarakat",
    "pertanyaan": "Mengucapkan permisi atau menundukkan badan sedikit saat berjalan melewati orang yang lebih tua adalah contoh penerapan norma...",
    "jawabanBenar": "Kesopanan",
    "pengecoh": [
      "Hukum",
      "Agama",
      "Kesusilaan"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Norma kesopanan bersumber dari kebiasaan atau tata krama masyarakat dalam pergaulan sehari-hari untuk saling menghargai."
  },
  {
    "id": "FC-PAN-010",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Setiap anak memiliki hak dan kewajiban di rumah. Salah satu contoh hak anak di lingkungan keluarga adalah...",
    "jawabanBenar": "Mendapat perhatian dan kasih sayang",
    "pengecoh": [
      "Membantu membersihkan halaman rumah",
      "Mematuhi nasihat orang tua",
      "Menjaga nama baik keluarga"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Hak adalah sesuatu yang harusnya didapatkan. Kasih sayang adalah hak. Sedangkan membantu, menghormati, dan menjaga nama baik adalah kewajiban anak."
  },
  {
    "id": "FC-PAN-011",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Di sekolah, setiap siswa berhak menggunakan fasilitas perpustakaan. Namun, siswa juga memiliki kewajiban terkait hak tersebut, yaitu...",
    "jawabanBenar": "Menjaga ketenangan dan merawat buku",
    "pengecoh": [
      "Membeli buku baru untuk perpustakaan",
      "Menyimpan buku perpustakaan untuk selamanya",
      "Memaksa petugas meminjamkan banyak buku"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Kewajiban yang menyertai hak menggunakan fasilitas sekolah adalah menjaganya agar tidak rusak dan tidak mengganggu orang lain."
  },
  {
    "id": "FC-PAN-012",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "UUD NRI 1945",
    "pertanyaan": "Kalimat 'Bahwa sesungguhnya Kemerdekaan itu ialah hak segala bangsa...' merupakan bunyi Pembukaan UUD NRI Tahun 1945 alinea ke-...",
    "jawabanBenar": "Pertama",
    "pengecoh": [
      "Kedua",
      "Ketiga",
      "Keempat"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Alinea pertama Pembukaan UUD 1945 menyatakan hak asasi setiap bangsa untuk merdeka dan menghapus penjajahan di atas dunia."
  },
  {
    "id": "FC-PAN-013",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Musyawarah",
    "pertanyaan": "Kelas VI sedang bermusyawarah untuk menentukan tujuan wisata belajar. Budi mengusulkan ke museum, sedangkan mayoritas kelas sepakat ke taman nasional. Sikap Budi yang tepat adalah...",
    "jawabanBenar": "Menerima dan menjalankan keputusan bersama",
    "pengecoh": [
      "Memaksa teman mengubah keputusan",
      "Marah dan menolak ikut wisata",
      "Meminta guru membatalkan wisata kelas"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Dalam musyawarah, jika keputusan sudah disepakati bersama (mufakat/suara terbanyak), setiap peserta wajib mematuhinya secara bertanggung jawab."
  },
  {
    "id": "FC-PAN-014",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Hak dan Kewajiban",
    "pertanyaan": "Setiap hari Minggu, warga RT 02 mengadakan kerja bakti membersihkan lingkungan. Ayah Budi sedang sakit parah sehingga tidak bisa ikut. Namun, keluarga Budi tetap memiliki hak untuk menggunakan fasilitas jalan dan taman yang bersih. Tindakan yang paling tepat untuk menyeimbangkan hak dan kewajiban keluarga Budi dalam situasi tersebut adalah...",
    "jawabanBenar": "Budi mewakili ayah ikut kerja bakti semampunya",
    "pengecoh": [
      "Keluarga Budi berdiam diri di rumah saja",
      "Ayah Budi memaksakan diri ikut kerja bakti",
      "Menyumbang uang agar bebas dari kerja bakti"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Menyeimbangkan hak (menikmati lingkungan bersih) dan kewajiban (menjaga kebersihan) bisa dilakukan dengan saling menggantikan peran dalam keluarga (Budi mewakili ayah) sesuai kemampuan."
  },
  {
    "id": "FC-PAN-015",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Aturan Bersama",
    "pertanyaan": "Siswa kelas V membuat kesepakatan kelas bersama, salah satunya adalah dilarang membuang sampah di laci meja. Fungsi utama dari kesepakatan tersebut adalah...",
    "jawabanBenar": "Menciptakan lingkungan yang tertib dan nyaman",
    "pengecoh": [
      "Agar guru bisa menghukum siswa",
      "Menunjukkan bahwa kelas V berkuasa",
      "Membuat siswa takut berada di kelas"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Tujuan dibuatnya aturan atau kesepakatan bersama adalah demi kepentingan dan kenyamanan seluruh anggota, bukan untuk menakut-nakuti."
  },
  {
    "id": "FC-PAN-016",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Aturan Bersama",
    "pertanyaan": "Saat bermain sepak bola saat istirahat, tim Riko kalah karena aturan yang sudah disepakati bersama sebelum bermain. Namun, Riko tidak terima dan marah-marah. Tindakan Riko menunjukkan sikap...",
    "jawabanBenar": "Tidak mematuhi kesepakatan yang telah dibuat",
    "pengecoh": [
      "Kritis terhadap aturan yang merugikan",
      "Menyuarakan kebenaran demi keadilan",
      "Taat pada nilai persahabatan"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Kesepakatan yang dibuat di awal harus ditaati hingga akhir, baik saat untung maupun rugi (kalah)."
  },
  {
    "id": "FC-PAN-017",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Tari Saman dari Aceh, Rendang dari Sumatera Barat, dan Rumah Gadang adalah kekayaan bangsa Indonesia yang menunjukkan keberagaman...",
    "jawabanBenar": "Budaya daerah",
    "pengecoh": [
      "Agama dan kepercayaan",
      "Ras dan ciri fisik",
      "Mata pencaharian"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Tarian, makanan khas, dan rumah adat adalah wujud keberagaman budaya yang ada di tiap daerah di Indonesia."
  },
  {
    "id": "FC-PAN-018",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Pak Guru menugaskan siswa untuk mempelajari lagu daerah dari provinsi lain yang bukan tempat asal mereka. Manfaat utama dari tugas tersebut adalah...",
    "jawabanBenar": "Menumbuhkan rasa menghargai keragaman budaya",
    "pengecoh": [
      "Membuktikan lagu daerah sendiri kurang bagus",
      "Menjadikan siswa penyanyi tingkat internasional",
      "Mengganti budaya asli dengan budaya luar"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Mempelajari budaya daerah lain bertujuan menanamkan rasa toleransi, pengenalan, dan kebanggaan atas kekayaan seluruh wilayah Indonesia."
  },
  {
    "id": "FC-PAN-019",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Salah satu cara tepat menjaga dan melestarikan budaya lokal di tengah arus modernisasi (pengaruh budaya luar) adalah...",
    "jawabanBenar": "Mempelajari tari tradisional atau memakai batik",
    "pengecoh": [
      "Melarang semua budaya asing masuk ke Indonesia",
      "Hanya mau menggunakan bahasa daerah",
      "Menolak menggunakan teknologi seperti internet"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Melestarikan budaya dilakukan dengan tindakan aktif mempraktikkannya, tanpa harus bersikap anti-kemajuan (teknologi) atau anti-persatuan (menolak bahasa nasional)."
  },
  {
    "id": "FC-PAN-020",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Semboyan negara Indonesia yang tertulis pada lambang Garuda Pancasila yang bermakna 'Berbeda-beda tetapi tetap satu jua' adalah...",
    "jawabanBenar": "Bhinneka Tunggal Ika",
    "pengecoh": [
      "Tut Wuri Handayani",
      "Bhinneka Sabda Budaya",
      "Bersatu Kita Teguh"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Bhinneka Tunggal Ika adalah semboyan pemersatu keberagaman bangsa Indonesia."
  },
  {
    "id": "FC-PAN-021",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Saat istirahat, kamu melihat seorang siswa baru pindahan dari provinsi lain sedang duduk sendirian. Tindakan yang sesuai dengan semangat persatuan adalah...",
    "jawabanBenar": "Mengajaknya berkenalan dan bermain bersama",
    "pengecoh": [
      "Membiarkannya karena belum mengenalnya",
      "Mengejek logat bicaranya yang berbeda",
      "Menyuruhnya bermain dengan teman sedaerah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Tindakan merangkul tanpa melihat perbedaan latar belakang daerah asal memperkuat semangat persatuan di sekolah."
  },
  {
    "id": "FC-PAN-022",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Sekolah mengadakan pameran makanan daerah. Kelompok Siti membawa makanan khas daerahnya yang memiliki aroma sangat tajam. Kelompok Doni yang stannya bersebelahan merasa terganggu dan berniat membuang makanan tersebut. Sebagai ketua kelas, tindakan terbaik yang harus kamu lakukan adalah...",
    "jawabanBenar": "Mengingatkan Doni dan menyarankan Siti menggeser makanannya",
    "pengecoh": [
      "Membiarkan Doni membuang makanan tersebut",
      "Memarahi Doni di depan para pengunjung",
      "Menyuruh Siti membawa pulang makanannya"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Tindakan terbaik adalah mencari jalan tengah (win-win solution) melalui dialog, saling menghargai keberagaman budaya (Bhinneka Tunggal Ika), dan menjaga kerukunan tanpa ada yang merasa dirugikan."
  },
  {
    "id": "FC-PAN-023",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Bhinneka Tunggal Ika",
    "pertanyaan": "Masyarakat Indonesia terdiri dari banyak suku bangsa, seperti suku Jawa, Sunda, Batak, Dayak, dan Asmat. Keberagaman ini seharusnya kita pandang sebagai...",
    "jawabanBenar": "Kekayaan bangsa yang harus dijaga bersama",
    "pengecoh": [
      "Penghalang utama dalam pembangunan negara",
      "Penyebab perpecahan di masa depan",
      "Alasan memisahkan daerah di Indonesia"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Keberagaman suku bangsa bukanlah ancaman, melainkan aset dan identitas bangsa Indonesia yang menjadikannya unik dan kaya."
  },
  {
    "id": "FC-PAN-024",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Setiap provinsi di Indonesia terbagi menjadi beberapa wilayah administratif yang lebih kecil. Wilayah yang kedudukannya setingkat (sejajar) dengan kabupaten adalah...",
    "jawabanBenar": "Kota",
    "pengecoh": [
      "Kecamatan",
      "Kelurahan",
      "Desa"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Dalam struktur pemerintahan NKRI, provinsi dibagi menjadi wilayah Kabupaten dan wilayah Kota."
  },
  {
    "id": "FC-PAN-025",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Warga desa Sukamaju memiliki tradisi membangun pos kamling atau memperbaiki jalan yang rusak secara bersama-sama tanpa dibayar. Kegiatan ini mencerminkan tradisi...",
    "jawabanBenar": "Gotong royong",
    "pengecoh": [
      "Kerja paksa",
      "Rapat desa",
      "Pemilihan umum"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Bekerja bersama-sama demi kepentingan umum secara sukarela adalah ciri khas budaya gotong royong masyarakat Indonesia."
  },
  {
    "id": "FC-PAN-026",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Indonesia dikenal sebagai Negara Kesatuan. Makna dasar dari negara kesatuan adalah...",
    "jawabanBenar": "Negara utuh tanpa negara bagian",
    "pengecoh": [
      "Negara dengan satu partai politik",
      "Gabungan dari beberapa negara merdeka",
      "Negara yang hanya mengakui satu budaya"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Negara kesatuan (NKRI) memiliki pemerintahan pusat yang berdaulat, wilayahnya merupakan satu kesatuan utuh tanpa adanya negara di dalam negara."
  },
  {
    "id": "FC-PAN-027",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Di lingkungan tempat tinggal Rio sedang dibangun tempat ibadah. Meskipun mayoritas warga berbeda agama, mereka ikut menjaga keamanan dan kelancaran pembangunan. Hal ini menunjukkan...",
    "jawabanBenar": "Toleransi umat beragama menjaga persatuan",
    "pengecoh": [
      "Mencari pujian dari kepala daerah",
      "Tidak peduli asalkan lingkungannya bersih",
      "Takut mendapat hukuman dari pemerintah"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Toleransi antar umat beragama dalam masyarakat sangat penting untuk memelihara kedamaian dan keutuhan Negara Kesatuan Republik Indonesia."
  },
  {
    "id": "FC-PAN-028",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Wilayah tempat kita tinggal saat ini (desa/kelurahan, kecamatan, kabupaten, hingga provinsi) semuanya adalah bagian yang tak terpisahkan dari...",
    "jawabanBenar": "Negara Kesatuan Republik Indonesia",
    "pengecoh": [
      "Perserikatan Bangsa-Bangsa",
      "Organisasi negara Asia Tenggara",
      "Negara Persemakmuran"
    ],
    "difficulty": "EASY",
    "challengeType": "IDENTIFY",
    "explanation": "Seluruh wilayah pemerintahan daerah dari tingkat bawah hingga provinsi adalah komponen pembentuk keutuhan wilayah NKRI."
  },
  {
    "id": "FC-PAN-029",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Negara Kesatuan Republik Indonesia",
    "pertanyaan": "Sebagai pelajar, kita harus bangga terhadap identitas kita sebagai bangsa Indonesia. Salah satu perilaku yang menunjukkan rasa bangga tersebut di kehidupan sehari-hari adalah...",
    "jawabanBenar": "Bangga menggunakan barang buatan dalam negeri",
    "pengecoh": [
      "Menghindari produk lokal karena kurang keren",
      "Memamerkan barang mahal dari luar negeri",
      "Menjelek-jelekkan negara di media sosial"
    ],
    "difficulty": "MEDIUM",
    "challengeType": "IDENTIFY",
    "explanation": "Mencintai produk dalam negeri membuktikan adanya rasa cinta tanah air dan kebanggaan atas karya bangsa sendiri, yang mendukung kemajuan ekonomi negara."
  },
  {
    "id": "FC-PAN-030",
    "jenjang": "SD",
    "kelasAtauFase": "Fase C",
    "mataPelajaran": "Pendidikan Pancasila",
    "topik": "Kerjasama Antardaerah NKRI",
    "pertanyaan": "Desa Makmur dan Desa Sejahtera dipisahkan oleh sebuah sungai. Jembatan bambu yang menghubungkan kedua desa tersebut putus akibat banjir. Akibatnya, anak-anak dari Desa Makmur tidak bisa pergi ke sekolah yang terletak di Desa Sejahtera. Solusi terbaik yang mencerminkan semangat persatuan dan gotong royong adalah...",
    "jawabanBenar": "Warga kedua desa bergotong royong memperbaiki jembatan",
    "pengecoh": [
      "Kepala desa melarang anak-anak ke sekolah",
      "Warga menolak membantu perbaikan jembatan",
      "Memindahkan sekolah agar tidak menyeberang sungai"
    ],
    "difficulty": "HARD",
    "challengeType": "IDENTIFY",
    "explanation": "Dalam semangat persatuan NKRI, masalah bersama antarwilayah (meskipun di tingkat desa) diselesaikan dengan gotong royong dan kerja sama demi kepentingan bersama, terutama pendidikan anak."
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
  
  // Create a map for the new questions
  const newQuestionsMap = new Map();
  newQuestions.forEach(q => newQuestionsMap.set(q.id, q));
  
  let replaced = 0;
  // Replace in place
  const updatedArr = arr.map(q => {
    if (newQuestionsMap.has(q.id)) {
      replaced++;
      const newQ = newQuestionsMap.get(q.id);
      // verify fields that should not change didn't change
      if (q.pertanyaan !== newQ.pertanyaan) {
          console.warn("PERTANYAAN DIFFERS FOR", q.id);
      }
      return newQ;
    }
    return q;
  });
  
  if (replaced !== 30) {
     console.error('Replaced', replaced, 'expected 30');
     process.exit(1);
  }
  
  const updatedStr = JSON.stringify(updatedArr, null, 2);
  const newContent = content.replace(match[1], updatedStr);
  fs.writeFileSync(filePath, newContent);
  console.log('Successfully updated the array and wrote to file.');
} else {
  console.log('Could not find SAMPLE_EDUCATIONAL_CONTENT array in the file');
  process.exit(1);
}
