const fs = require('fs');

const replacements = {
  "FC-KKA-001": {
    j: "1 - 2 - 3 - 4",
    p: ["2 - 1 - 4 - 3", "3 - 1 - 2 - 4", "4 - 3 - 2 - 1"]
  },
  "FC-KKA-002": {
    j: "Hijau",
    p: ["Merah", "Kuning", "Biru"]
  },
  "FC-KKA-003": {
    j: "Mengelompokkan benda berdasarkan jenis (klasifikasi)",
    p: [
      "Menghancurkan benda agar muat",
      "Mencampur semua benda tanpa aturan",
      "Menyembunyikan benda dari pandangan"
    ]
  },
  "FC-KKA-004": {
    j: "Maju, Maju, Belok Kanan",
    p: [
      "Maju, Belok Kanan, Maju",
      "Belok Kanan, Maju, Maju",
      "Maju, Belok Kiri, Maju"
    ]
  },
  "FC-KKA-005": {
    j: "Menguraikan masalah (Dekomposisi)",
    p: [
      "Menemukan pola gambar",
      "Membuat prediksi cuaca",
      "Menulis huruf abjad"
    ]
  },
  "FC-KKA-006": {
    j: "Permainan berlanjut di level yang sama",
    p: [
      "Pemain langsung naik level",
      "Permainan tamat seketika (Game Over)",
      "Koin bintang direset menjadi nol"
    ]
  },
  "FC-KKA-007": {
    j: "Mengeringkan tangan (3) seharusnya setelah membilas (4)",
    p: [
      "Nyalakan keran air (1) dilakukan paling akhir",
      "Pakai sabun (2) sebelum menyalakan keran air",
      "Bilas air (4) seharusnya dihapus dari daftar"
    ]
  },
  "FC-KKA-008": {
    j: "Majalah dipisah, lalu Buku Bahasa, kemudian Matematika",
    p: [
      "Buku Matematika, Buku Bahasa, lalu Majalah",
      "Semuanya dicampur karena sama-sama bahan bacaan",
      "Majalah di antara Buku Bahasa dan Matematika"
    ]
  },
  "FC-KKA-009": {
    j: "Alamat rumah dan kata sandi akun kita",
    p: [
      "Warna kesukaan dan nama kartun favorit",
      "Judul lagu yang sering kita dengarkan",
      "Negara dan benua tempat kita tinggal"
    ]
  },
  "FC-KKA-010": {
    j: "Mencari informasi edukasi untuk membantu tugas sekolah",
    p: [
      "Bermain game online seharian tanpa henti",
      "Mengejek foto teman di media sosial",
      "Mengunduh aplikasi berbayar diam-diam dengan uang"
    ]
  },
  "FC-KKA-011": {
    j: "Didampingi dan diawasi orang tua saat berinternet",
    p: [
      "Mengunci kamar agar tidak ketahuan",
      "Mengobrol dengan orang asing yang menjanjikan hadiah",
      "Mengeklik semua iklan berkedip di layar komputer"
    ]
  },
  "FC-KKA-012": {
    j: "Apakah pesanku sopan dan tidak menyakiti teman?",
    p: [
      "Apakah pesan ini menghabiskan kuota internet temanku?",
      "Berapa banyak stiker lucu yang bisa dikirim?",
      "Bagaimana caranya pamer dan terlihat paling hebat?"
    ]
  },
  "FC-KKA-013": {
    j: "Abaikan pesan, jangan klik tautan, dan laporkan",
    p: [
      "Langsung memberikan nomor rekening dan alamat rumah",
      "Mengirimkan pesan tersebut ke seluruh anggota keluarga",
      "Menelepon nomor tersebut agar hadiah cepat dikirim"
    ]
  },
  "FC-KKA-014": {
    j: "Kurang sopan, huruf kapital sering diartikan berteriak",
    p: [
      "Sangat baik, memudahkan teman membaca teks",
      "Keren, membuat teks terlihat lebih penting",
      "Biasa saja, internet tidak memiliki aturan kesopanan"
    ]
  },
  "FC-KKA-015": {
    j: "Ilustrasi anak membaca buku dan kalimat ajakan",
    p: [
      "Foto artis bermain film tanpa tulisan",
      "Video 30 menit tentang cara mencetak kertas",
      "Daftar nilai rapor seluruh siswa kelas 6"
    ]
  },
  "FC-KKA-016": {
    j: "Bertanya kepada orang dewasa atau mencari informasi",
    p: [
      "Langsung percaya dan berhenti minum air putih",
      "Segera menyebarkan artikel ke media sosial",
      "Mengejek teman karena artikel tersebut dianggap sihir"
    ]
  },
  "FC-KKA-017": {
    j: "Program komputer untuk meniru kecerdasan manusia",
    p: [
      "Robot besi mainan yang bisa berjalan lambat",
      "Mesin ajaib yang menjawab tanpa diajari manusia",
      "Lampu lalu lintas yang berubah warna"
    ]
  },
  "FC-KKA-018": {
    j: "Fitur pembuka kunci layar mengenali pola wajah",
    p: [
      "Kipas angin yang selalu menengok kanan-kiri",
      "Kompor gas yang mengeluarkan api biru",
      "Pintu lemari es yang bisa menutup sendiri"
    ]
  },
  "FC-KKA-019": {
    j: "Manusia memiliki perasaan, hati nurani, dan empati",
    p: [
      "Manusia tidak pernah salah, mesin selalu salah",
      "Manusia menyimpan triliunan data tanpa pernah lupa",
      "Manusia tidak memerlukan energi untuk bekerja"
    ]
  },
  "FC-KKA-020": {
    j: "Membantu dan mempermudah pekerjaan manusia",
    p: [
      "Menggantikan manusia agar tidak perlu belajar lagi",
      "Membuat mesin yang bisa memerintah manusia",
      "Menghabiskan listrik agar bumi menjadi gelap"
    ]
  },
  "FC-KKA-021": {
    j: "Manusia pemiliknya, karena robot diprogram",
    p: [
      "Robot itu sendiri harus dihukum",
      "Pabrik pot bunga karena potnya mudah pecah",
      "Tetangga rumah karena tidak menjaga rumah kita"
    ]
  },
  "FC-KKA-022": {
    j: "Menggunakan sensor penglihatan seperti kamera digital",
    p: [
      "Memiliki mata biologis kecil di balik layar",
      "Melihat dengan mendengarkan suara dari pengeras suara",
      "Langsung menebak tanpa menggunakan alat apa pun"
    ]
  },
  "FC-KKA-023": {
    j: "Andi tidak jujur dan kehilangan proses belajar",
    p: [
      "Tulisan komputer selalu lebih jelek dari manusia",
      "Aplikasi AI selalu meminta uang",
      "Guru lebih suka cerita fiksi tentang hewan"
    ]
  },
  "FC-KKA-024": {
    j: "Klasifikasi (Pengelompokan) benda berdasarkan warna",
    p: [
      "Menghitung jumlah balok terbanyak",
      "Mengubah semua warna balok menjadi merah",
      "Membuang semua balok agar keranjang rapi"
    ]
  },
  "FC-KKA-025": {
    j: "Melatih aplikasi dengan ratusan contoh foto buah",
    p: [
      "Membiarkan aplikasi mencari tahu sendiri di kebun",
      "Menyemprotkan aroma buah ke layar komputer",
      "Mengetikkan kata \"Enak\" berulang-ulang ke aplikasi"
    ]
  },
  "FC-KKA-026": {
    j: "Rekomendasi berdasarkan pola lagu yang sering didengarkan",
    p: [
      "Mesin ajaib yang bisa membaca pikiranmu",
      "Tebakan acak yang kebetulan selalu benar",
      "Aplikasi diam-diam menyadap pembicaraanmu dengan orang tua"
    ]
  },
  "FC-KKA-027": {
    j: "Masukan (Input)",
    p: [
      "Keluaran (Output)",
      "Proses (Processing)",
      "Penyimpanan (Storage)"
    ]
  },
  "FC-KKA-028": {
    j: "Keluaran berubah lebih detail sesuai permintaan baru",
    p: [
      "Keluaran tetap kucing biasa",
      "Aplikasi meledak karena permintaan Siti terlalu panjang",
      "Komputer akan menghapus gambar kucing dari internet"
    ]
  },
  "FC-KKA-029": {
    j: "Salah menebak karena belum mempelajari data truk",
    p: [
      "Sangat pintar mengenali semua jenis kendaraan",
      "Mengubah truk gandeng menjadi mobil sedan",
      "Menertawakan Dito karena memberikan ujian terlalu mudah"
    ]
  },
  "FC-KKA-030": {
    j: "Menyebut BUKU karena terpaku pada pola KOTAK",
    p: [
      "Menyebut KOTAK PENSIL karena tahu fungsinya",
      "Menyebut BOLA karena benda bisa menggelinding",
      "Marah dan menolak mengeluarkan suara"
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
