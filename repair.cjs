const fs = require('fs');

const replacements = {
  "FD-KKA-001": {
    j: "Menyaring atau mengurutkan data pada kolom Eskul",
    p: [
      "Membaca daftar nama siswa secara berulang",
      "Menghapus semua data siswa dari memori",
      "Membuat tabel baru untuk setiap siswa"
    ]
  },
  "FD-KKA-002": {
    j: "Mengikuti langkah resep memasak dari awal",
    p: [
      "Menggambar bebas di kertas tanpa tujuan",
      "Berbicara spontan saat menceritakan dongeng",
      "Memilih baju secara acak dari lemari"
    ]
  },
  "FD-KKA-003": {
    j: "Dekomposisi",
    p: ["Pengenalan Pola", "Abstraksi", "Desain Algoritma"]
  },
  "FD-KKA-004": {
    j: "Sistem menolak diskon karena syarat tidak terpenuhi",
    p: [
      "Sistem memberi diskon karena harganya mendekati",
      "Sistem membatalkan transaksi karena uang kurang",
      "Sistem memberikan diskon secara acak"
    ]
  },
  "FD-KKA-005": {
    j: "2 - 3 - 4 - 1",
    p: ["3 - 2 - 4 - 1", "2 - 4 - 3 - 1", "1 - 2 - 3 - 4"]
  },
  "FD-KKA-006": {
    j: "Abstraksi",
    p: ["Dekomposisi", "Evaluasi Data", "Debug Algoritma"]
  },
  "FD-KKA-007": {
    j: "Pengenalan Pola",
    p: ["Pengulangan Logika", "Penyandian Data", "Pembuatan Pseudocode"]
  },
  "FD-KKA-008": {
    j: "Langkah 3 menahan pejalan kaki menyeberang",
    p: [
      "Langkah 1 salah, mobil harusnya berhenti",
      "Lampu kuning seharusnya dilewati dari algoritma",
      "Algoritma sudah benar dan aman"
    ]
  },
  "FD-KKA-009": {
    j: "Gempa magnitudo 5.0 terjadi hari Senin",
    p: [
      "Cuaca pantai selatan indah setiap Senin",
      "Gempa bumi adalah bencana paling menakutkan",
      "Semua orang harus pindah dari pesisir"
    ]
  },
  "FD-KKA-010": {
    j: ".edu, .ac.id, atau .go.id",
    p: [".com, .net, atau .biz", ".blogspot.com atau .wordpress.com", ".tv, .shop, atau .info"]
  },
  "FD-KKA-011": {
    j: "Atribusi (mencantumkan sumber atau nama pencipta)",
    p: [
      "Mengubah warna agar terlihat buatan sendiri",
      "Mengaku menggambar ilustrasi tersebut semalaman",
      "Membayar uang sebagai biaya izin presentasi"
    ]
  },
  "FD-KKA-012": {
    j: "Pencurian identitas dan penipuan finansial",
    p: [
      "Memori server penuh dan akun terhapus",
      "Akun otomatis berubah menjadi premium",
      "Perangkat smartphone rusak atau korsleting"
    ]
  },
  "FD-KKA-013": {
    j: "Infografis",
    p: [
      "Audio Podcast berdurasi satu jam",
      "Dokumen PDF sebanyak sepuluh halaman",
      "Video resolusi 4K berisi layar kosong"
    ]
  },
  "FD-KKA-014": {
    j: "Judul sensasional tanpa sumber ahli medis",
    p: [
      "Menyertakan kutipan resmi jurnal kedokteran",
      "Ditulis baku, tenang, dan tertata rapi",
      "Pengumuman resmi dari kepala sekolah"
    ]
  },
  "FD-KKA-015": {
    j: "Pelanggaran etika berujung pada cyberbullying",
    p: [
      "Konten komedi selalu kebal aturan etika",
      "Aman selama tidak menulis nama asli",
      "Dihargai sebagai karya jurnalistik dokumenter"
    ]
  },
  "FD-KKA-016": {
    j: "Dilatih membaca pola teks data besar",
    p: [
      "Memiliki otak biologis di dalam komputer",
      "Langsung mengetahui segalanya sejak dihidupkan",
      "Memiliki ruh dan perasaan empati manusia"
    ]
  },
  "FD-KKA-017": {
    j: "Halusinasi (Hallucination)",
    p: ["Kloning suara (Voice Cloning)", "Verifikasi dua langkah (2FA)", "Virus Ransomware"]
  },
  "FD-KKA-018": {
    j: "AI tidak memiliki empati dan moral",
    p: [
      "AI tidak mampu menjumlahkan angka",
      "AI butuh bertahun-tahun untuk membalas",
      "AI tidak bisa disambungkan listrik"
    ]
  },
  "FD-KKA-019": {
    j: "Andi wajib memverifikasi hasil kerja AI",
    p: [
      "Program AI selalu disalahkan atas kesalahan",
      "Perusahaan AI tidak pernah memberi peringatan",
      "Guru sejarah memberi tugas terlalu sulit"
    ]
  },
  "FD-KKA-020": {
    j: "Deepfake",
    p: ["Augmented Reality (AR)", "Virtual Reality (VR)", "Stop Motion Animation"]
  },
  "FD-KKA-021": {
    j: "Bias Algoritma (AI Bias)",
    p: ["Bug Visualisasi Data", "Halusinasi Geografis", "Kecerdasan Super (Superintelligence)"]
  },
  "FD-KKA-022": {
    j: "Lakukan verifikasi silang dengan buku resmi",
    p: [
      "Menghafalnya karena AI tidak pernah salah",
      "Menyalin dan membagikan jawaban tanpa membacanya",
      "Mematikan komputer karena AI dilarang"
    ]
  },
  "FD-KKA-023": {
    j: "Data sensitif berisiko terekspos di server",
    p: [
      "AI otomatis menelepon orang tua Dina",
      "AI langsung mogok karena keluhan pribadi",
      "Diawasi langsung oleh dokter sungguhan"
    ]
  },
  "FD-KKA-024": {
    j: "Menyusun prompt yang jelas dan spesifik",
    p: [
      "Menulis satu kata pendek saja",
      "Memasukkan gambar kode biner pencarian",
      "Mematikan internet sebelum menekan tombol"
    ]
  },
  "FD-KKA-025": {
    j: "Meminta penjelasan sains dengan perumpamaan sederhana",
    p: [
      "Menyuruh AI membuat seluruh karangan esai",
      "Menjawab soal ujian saat guru lengah",
      "Meretas sistem keamanan WiFi sekolah"
    ]
  },
  "FD-KKA-026": {
    j: "Berikan 3 ide unik dan slogan",
    p: [
      "Bagaimana cara membersihkan lingkungan sekolah?",
      "Buat kampanye menjaga kebersihan.",
      "Tuliskan semua hal tentang sampah."
    ]
  },
  "FD-KKA-027": {
    j: "Input membingungkan menghasilkan output tidak bermutu",
    p: [
      "AI otomatis membuang file memori sampah",
      "Gunakan huruf kapital untuk menghindari sampah",
      "Kata rumit menyebabkan perangkat keras terbakar"
    ]
  },
  "FD-KKA-028": {
    j: "Gunakan sebagai inspirasi lalu tulis ulang",
    p: [
      "Langsung mencetak teks tanpa membacanya",
      "Mengklaim karya tersebut ciptaan dari nol",
      "Menyalin tanpa mengubah satu huruf pun"
    ]
  },
  "FD-KKA-029": {
    j: "2 - 4 - 1 - 3",
    p: ["1 - 2 - 4 - 3", "4 - 2 - 3 - 1", "2 - 1 - 4 - 3"]
  },
  "FD-KKA-030": {
    j: "Tolong revisi jadwal dengan menambah istirahat",
    p: [
      "Jadwalmu membuatku pusing, perbaiki sedikit.",
      "Manusia butuh tidur dan makan.",
      "Hapus jadwal matematika tanpa terkecuali."
    ]
  }
};

let content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');

// Match the full object by ID and modify it.
for (let id in replacements) {
    const rep = replacements[id];
    
    // We need to match the object with this ID.
    // We'll use a replacer function on the whole file, but it's safer to parse, update, and stringify.
    // Wait, parsing the whole file might lose formatting if it's TS.
    // Let's do it via regex carefully.
    
    // Find the JawabanBenar line:
    const jRegex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?jawabanBenar:\\s*["'])([^"']*)(["'])`);
    content = content.replace(jRegex, `$1${rep.j}$3`);
    
    // For pengecoh, we can find the block:
    const pRegex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?pengecoh:\\s*\\[)([^\\]]*)(\\])`);
    content = content.replace(pRegex, (match, p1, p2, p3) => {
        const newPengecoh = rep.p.map(x => `\n      "${x}"`).join(',') + '\n    ';
        return p1 + newPengecoh + p3;
    });
}

fs.writeFileSync('src/engine/EducationalEngine.ts', content);
console.log('Done replacement.');
