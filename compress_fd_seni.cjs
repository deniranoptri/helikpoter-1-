const fs = require('fs');

const replacements = {
  "FD-SENI-001": {
    j: "Garis",
    p: ["Bidang", "Bentuk", "Ruang"]
  },
  "FD-SENI-002": {
    j: "Jingga (Oranye)",
    p: ["Hijau", "Ungu", "Cokelat"]
  },
  "FD-SENI-003": {
    j: "Seni Rupa Terapan (Applied Art)",
    p: [
      "Seni Rupa Murni (Fine Art)",
      "Seni Instalasi",
      "Seni Lukis Abstrak"
    ]
  },
  "FD-SENI-004": {
    j: "Tempo",
    p: ["Dinamika", "Nada", "Irama"]
  },
  "FD-SENI-005": {
    j: "Keras",
    p: ["Lembut", "Cepat", "Lambat"]
  },
  "FD-SENI-006": {
    j: "Musik Ansambel Campuran",
    p: [
      "Musik Ansambel Sejenis",
      "Paduan Suara (Koor)",
      "Vokal Grup"
    ]
  },
  "FD-SENI-007": {
    j: "Pola Lantai",
    p: ["Level Gerak", "Ruang Tari", "Desain Atas"]
  },
  "FD-SENI-008": {
    j: "Piring",
    p: ["Selendang", "Kipas", "Payung"]
  },
  "FD-SENI-009": {
    j: "Mimik muka (Ekspresi wajah)",
    p: ["Pantomim", "Bloking", "Artikulasi"]
  },
  "FD-SENI-010": {
    j: "Proporsi (Kesebandingan)",
    p: [
      "Irama (Ritme)",
      "Kesatuan (Unity)",
      "Pusat Perhatian (Center of Interest)"
    ]
  },
  "FD-SENI-011": {
    j: "Aquarel",
    p: ["Plakat", "Pointilis", "Impasto"]
  },
  "FD-SENI-012": {
    j: "Pahat / Ukir",
    p: ["Butsir", "Cor (Casting)", "Cetak (Molding)"]
  },
  "FD-SENI-013": {
    j: "Waktu (Tempo/Irama gerak)",
    p: ["Ruang", "Tenaga", "Properti"]
  },
  "FD-SENI-014": {
    j: "Level Rendah",
    p: ["Level Sedang", "Level Tinggi", "Level Vertikal"]
  },
  "FD-SENI-015": {
    j: "Ukuran tabung bambu yang digoyangkan",
    p: [
      "Ketebalan senar yang dipetik",
      "Kekerasan pukulan selaput kulit membran",
      "Panjang pendek lubang tiup ditutup"
    ]
  },
  "FD-SENI-016": {
    j: "Sopran",
    p: ["Alto", "Tenor", "Bass"]
  },
  "FD-SENI-017": {
    j: "Panggung (Setting/Scenery)",
    p: [
      "Rias dan Busana",
      "Cahaya (Lighting)",
      "Suara (Sound)"
    ]
  },
  "FD-SENI-018": {
    j: "Antagonis",
    p: ["Tritagonis", "Figuran", "Sutradara"]
  },
  "FD-SENI-019": {
    j: "Deskripsi",
    p: ["Analisis Formal", "Interpretasi", "Evaluasi"]
  },
  "FD-SENI-020": {
    j: "Dipetik",
    p: ["Ditiup", "Dipukul", "Digesek"]
  },
  "FD-SENI-021": {
    j: "Menciptakan hubungan padu dan saling mendukung antar unsur",
    p: [
      "Membuat bagian tengah lukisan terlihat lebih mencolok",
      "Memberikan kesan gelap terang tiba-tiba tanpa gradasi",
      "Memastikan semua objek lukisan memiliki ukuran persis"
    ]
  },
  "FD-SENI-022": {
    j: "3 - 1 - 2 - 4",
    p: ["1 - 2 - 3 - 4", "2 - 3 - 1 - 4", "3 - 2 - 1 - 4"]
  },
  "FD-SENI-023": {
    j: "Improvisasi",
    p: ["Gladi bersih", "Observasi", "Pantomim"]
  },
  "FD-SENI-024": {
    j: "Tidak terikat ketat pada aturan baku tari tradisional",
    p: [
      "Hanya boleh menggunakan iringan musik pop mancanegara",
      "Tidak memperbolehkan penggunaan pola lantai sama sekali",
      "Pakaian penari harus meniru budaya Eropa masa lalu"
    ]
  },
  "FD-SENI-025": {
    j: "Gagal secara fungsi karena kontras warna yang rendah",
    p: [
      "Sangat berhasil karena warna kuning dan putih bersih",
      "Melanggar aturan hak cipta karena menggunakan ilustrasi",
      "Terlalu tradisional untuk diterapkan di zaman modern"
    ]
  },
  "FD-SENI-026": {
    j: "Muram, sepi, dan penuh penderitaan",
    p: [
      "Gembira, meriah, dan penuh harapan",
      "Mencekam, horor, dan mengancam jiwa",
      "Mewah, elegan, dan penuh kekayaan"
    ]
  },
  "FD-SENI-027": {
    j: "Kehilangan keseimbangan musikal, melodi utama tertutup suara pengiring",
    p: [
      "Harmoni terdengar jauh lebih indah dan dramatis",
      "Suara Bass otomatis berubah menjadi melodi utama",
      "Lagu akan secara otomatis bertambah temponya cepat"
    ]
  },
  "FD-SENI-028": {
    j: "Mengutamakan kekompakan ritmis internal dan formasi baris rapat",
    p: [
      "Mengandalkan eksplorasi ruang luas dengan lompatan tinggi",
      "Sangat bergantung pada melodi gamelan jawa kompleks",
      "Memiliki desain gerak asimetris dan individualistik"
    ]
  },
  "FD-SENI-029": {
    j: "Semakin jauh tiang listrik, digambar semakin kecil menyempit",
    p: [
      "Semua tiang listrik harus digambar sama persis ukurannya",
      "Tiang listrik kejauhan digambar lebih besar karena pembiasan",
      "Jalan raya digambar semakin melebar mendekati garis cakrawala"
    ]
  },
  "FD-SENI-030": {
    j: "Tiongkok (China)",
    p: [
      "India (Hindu-Buddha)",
      "Timur Tengah (Arab)",
      "Eropa (Belanda)"
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
