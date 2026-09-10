const fs = require('fs');

const replacements = {
  "FD-BIND-001": {
    j: "pemindahan penduduk dari daerah bahaya ke tempat aman",
    p: [
      "penyelamatan harta benda dari daerah bencana",
      "pemberian bantuan makanan dan obat-obatan",
      "peninjauan lokasi yang terkena musibah"
    ]
  },
  "FD-BIND-002": {
    j: "Peran penting hutan mangrove bagi lingkungan pesisir",
    p: [
      "Cara mencegah abrasi dengan hutan mangrove",
      "Hutan mangrove sebagai tempat berkembang biak",
      "Himbauan untuk menjaga kelestarian hutan mangrove"
    ]
  },
  "FD-BIND-003": {
    j: "Gaya hidup kurang gerak remaja mengancam kesehatan",
    p: [
      "Bermain gawai satu-satunya penyebab menurunnya kebugaran",
      "Remaja dilarang menggunakan gawai agar sehat",
      "Penyakit metabolik hanya menyerang remaja malas berolahraga"
    ]
  },
  "FD-BIND-004": {
    j: "Menggambarkan suasana dan keindahan Pantai Parangtritis",
    p: [
      "Menceritakan sejarah Pantai Parangtritis",
      "Menjelaskan proses terjadinya ombak besar",
      "Mengajak pembaca berwisata ke Pantai Parangtritis"
    ]
  },
  "FD-BIND-005": {
    j: "Oleh karena itu, diperlukan upaya mengurangi plastik.",
    p: [
      "Banyak orang masih membuang sampah di sungai.",
      "Pemerintah harus membangun lebih banyak TPA baru.",
      "Sampah plastik dapat didaur ulang menjadi kerajinan."
    ]
  },
  "FD-BIND-006": {
    j: "Semua peserta rapat harus mematuhi tata tertib.",
    p: [
      "Bagi semua peserta rapat harus mematuhi aturan.",
      "Semua peserta rapat-rapat harus mematuhi tata tertib.",
      "Peserta rapat sekalian harus mematuhi tata tertib."
    ]
  },
  "FD-BIND-007": {
    j: "Bapak Presiden Joko Widodo meresmikan jembatan Papua.",
    p: [
      "Ibu membeli pisang Ambon di pasar tradisional.",
      "sungai Kapuas adalah sungai terpanjang di Indonesia.",
      "Paman baru saja pulang dari Surabaya kemarin."
    ]
  },
  "FD-BIND-008": {
    j: "2 - 4 - 5 - 1 - 3",
    p: [
      "4 - 2 - 5 - 3 - 1",
      "2 - 5 - 4 - 1 - 3",
      "4 - 5 - 2 - 1 - 3"
    ]
  },
  "FD-BIND-009": {
    j: "Kondisi ini mungkin yang terparah dalam dekade.",
    p: [
      "BPBD mencatat 15 desa mengalami krisis air.",
      "Bantuan air bersih 10 truk tangki dikirim.",
      "Suhu udara pada siang hari 34 derajat."
    ]
  },
  "FD-BIND-010": {
    j: "Mengajak pembaca memilah sampah organik dan anorganik.",
    p: [
      "Menjelaskan perbedaan sampah organik dan anorganik.",
      "Menceritakan cara mengolah sampah menjadi pupuk.",
      "Menyajikan data penumpukan sampah di bumi."
    ]
  },
  "FD-BIND-011": {
    j: "Deretan penjelas",
    p: [
      "Identifikasi fenomena",
      "Interpretasi",
      "Pernyataan umum"
    ]
  },
  "FD-BIND-012": {
    j: "Oleh karena itu, kita harus menjaga kebersihan.",
    p: [
      "Ibu membeli, sayur ayam dan buah di pasar.",
      "Dia tidak datang, karena hari hujan deras.",
      "Budi membaca buku dan, Andi bermain komputer."
    ]
  },
  "FD-BIND-013": {
    j: "Suka menolong",
    p: [
      "Suka memukul",
      "Cepat marah",
      "Bekerja dengan cepat"
    ]
  },
  "FD-BIND-014": {
    j: "Klaim kurang kredibel karena tidak didukung riset.",
    p: [
      "Klaim benar karena selebritas memiliki informasi akurat.",
      "Klaim salah karena cokelat hanya menaikkan berat.",
      "Klaim benar asalkan mengonsumsi cokelat hitam saja."
    ]
  },
  "FD-BIND-015": {
    j: "Vitamin C menyembuhkan radang, tapi butuh air.",
    p: [
      "Vitamin C dosis tinggi merusak ginjal tanpa air.",
      "Sariawan hanya sembuh dengan vitamin C dan air.",
      "Konsumsi vitamin C berlebihan dilarang karena ginjal."
    ]
  },
  "FD-BIND-016": {
    j: "(3)",
    p: [
      "(1)",
      "(2)",
      "(4)"
    ]
  },
  "FD-BIND-017": {
    j: "Pemberani dan percaya diri",
    p: [
      "Sombong dan angkuh",
      "Licik dan penipu",
      "Penakut dan ragu-ragu"
    ]
  },
  "FD-BIND-018": {
    j: "Sore hari, di sawah",
    p: [
      "Pagi hari, di desa",
      "Siang hari, di ladang",
      "Malam hari, di hutan"
    ]
  },
  "FD-BIND-019": {
    j: "karena",
    p: [
      "tetapi",
      "kemudian",
      "sehingga"
    ]
  },
  "FD-BIND-020": {
    j: "penghijauan kembali",
    p: [
      "pembukaan lahan",
      "pemupukan tanah",
      "pembalakan liar"
    ]
  },
  "FD-BIND-021": {
    j: "Objektif dan ditulis berdasarkan fakta pengamatan langsung.",
    p: [
      "Banyak mengandung opini pribadi penulis.",
      "Ditulis menggunakan gaya bahasa kiasan dan imajinatif.",
      "Berisi alur cerita fiktif dan tokoh buatan."
    ]
  },
  "FD-BIND-022": {
    j: "Fasilitas transportasi umum belum memadai menarik minat.",
    p: [
      "Warga tidak peduli polusi udara di kotanya.",
      "Kebijakan uji emisi yang diterapkan terlalu ketat.",
      "Pemerintah tidak memberikan sosialisasi kepada masyarakat."
    ]
  },
  "FD-BIND-023": {
    j: "Apotek, nasihat, kualitas",
    p: [
      "Apotik, nasehat, kwalitas",
      "Apotek, nasehat, kualitas",
      "Apotik, nasihat, kwalitas"
    ]
  },
  "FD-BIND-024": {
    j: "Panaskan wajan di atas kompor api sedang!",
    p: [
      "Minyak goreng akan mendidih dalam tiga menit.",
      "Bumbu-bumbu yang dibutuhkan mudah ditemukan di pasar.",
      "Bawang putih memiliki aroma yang sangat tajam."
    ]
  },
  "FD-BIND-025": {
    j: "3 - 2 - 4 - 1",
    p: [
      "2 - 3 - 1 - 4",
      "3 - 1 - 2 - 4",
      "2 - 4 - 3 - 1"
    ]
  },
  "FD-BIND-026": {
    j: "Buku referensi pelajaran membosankan bagi siswa.",
    p: [
      "Membaca fiksi dapat meningkatkan empati anak.",
      "Imajinasi anak akan terstimulasi oleh cerita fiksi.",
      "Kosakata baru mudah diserap melalui narasi fiksi."
    ]
  },
  "FD-BIND-027": {
    j: "Membahas dampak curah hujan tinggi terhadap longsor.",
    p: [
      "Membahas terputusnya akses jalan raya utama.",
      "Membahas kerugian material akibat bencana longsor.",
      "Membahas banjir yang melanda daerah hilir sungai."
    ]
  },
  "FD-BIND-028": {
    j: "Kepala berita (Lead)",
    p: [
      "Tubuh berita (Body)",
      "Ekor berita (Tail)",
      "Latar belakang"
    ]
  },
  "FD-BIND-029": {
    j: "Kelicikan dan kebohongan membawa malapetaka bagi pelakunya.",
    p: [
      "Kita harus selalu membantu teman yang kesulitan.",
      "Jangan mudah percaya pada kepiting yang kuat.",
      "Menyimpan makanan untuk hari esok sangat penting."
    ]
  },
  "FD-BIND-030": {
    j: "Personifikasi",
    p: [
      "Hiperbola",
      "Metafora",
      "Simile"
    ]
  }
};

let content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
let modifiedCount = 0;

for (let id in replacements) {
    const rep = replacements[id];
    
    const idIdx = content.indexOf(`"id": "${id}"`);
    if (idIdx === -1) {
        console.log("Could not find", id);
        continue;
    }
    
    const jbMatch = /"jawabanBenar":\s*"(.*?)"(,\s*"pengecoh")/s.exec(content.substring(idIdx));
    if (jbMatch) {
        const oldJb = `"jawabanBenar": "${jbMatch[1]}"`;
        const newJ = rep.j.replace(/"/g, '\\"');
        const newJb = `"jawabanBenar": "${newJ}"`;
        content = content.replace(oldJb, newJb);
    } else {
        console.log("Could not find jawabanBenar for", id);
    }
    
    const idIdx2 = content.indexOf(`"id": "${id}"`);
    const pMatch = /"pengecoh":\s*\[(.*?)\]/s.exec(content.substring(idIdx2));
    if (pMatch) {
        const oldP = `"pengecoh": [${pMatch[1]}]`;
        const newPengecohArray = rep.p.map(x => `\n      "${x.replace(/"/g, '\\"')}"`).join(',') + '\n    ';
        const newP = `"pengecoh": [${newPengecohArray}]`;
        content = content.replace(oldP, newP);
    } else {
        console.log("Could not find pengecoh for", id);
    }
    
    modifiedCount++;
}

fs.writeFileSync('src/engine/EducationalEngine.ts', content);
console.log('Modified', modifiedCount, 'items.');
