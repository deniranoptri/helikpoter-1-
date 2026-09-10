const fs = require('fs');

const replacements = {
  "FD-INF-001": {
    j: "CPU (Central Processing Unit)",
    p: ["RAM", "Harddisk", "Monitor"]
  },
  "FD-INF-002": {
    j: "Abstraksi",
    p: ["Dekomposisi", "Algoritma", "Pengenalan Pola"]
  },
  "FD-INF-003": {
    j: "Jejak digital (Digital footprint)",
    p: ["Virus komputer", "Spam email", "Cookie web"]
  },
  "FD-INF-004": {
    j: "Kombinasi huruf besar, kecil, angka, dan simbol",
    p: [
      "Menggunakan tanggal lahir sendiri",
      "Menggunakan nama hewan peliharaan",
      "Menggunakan deretan angka berurutan"
    ]
  },
  "FD-INF-005": {
    j: "Mengekspresikan kemarahan atau berteriak",
    p: [
      "Menunjukkan rasa hormat",
      "Menandakan berita yang sangat menggembirakan",
      "Memperjelas tulisan agar mudah dibaca"
    ]
  },
  "FD-INF-006": {
    j: "Internet",
    p: ["Intranet", "Local Area Network (LAN)", "Bluetooth"]
  },
  "FD-INF-007": {
    j: "Algoritma",
    p: ["Dekomposisi", "Pseudocode", "Flowchart"]
  },
  "FD-INF-008": {
    j: "Printer",
    p: ["Scanner", "Monitor", "Proyektor"]
  },
  "FD-INF-009": {
    j: "Sistem Operasi (Operating System)",
    p: [
      "Program Antivirus",
      "Perangkat Lunak Pengolah Kata",
      "Browser Internet"
    ]
  },
  "FD-INF-010": {
    j: "2 - 4 - 1 - 3",
    p: ["1 - 2 - 3 - 4", "4 - 1 - 2 - 3", "2 - 1 - 4 - 3"]
  },
  "FD-INF-011": {
    j: "Lulus",
    p: ["Remedial", "Lulus dan Remedial", "Tidak mencetak apa-apa"]
  },
  "FD-INF-012": {
    j: "Dekomposisi",
    p: ["Pengenalan Pola", "Abstraksi", "Desain Algoritma"]
  },
  "FD-INF-013": {
    j: "37",
    p: ["35", "39", "41"]
  },
  "FD-INF-014": {
    j: "Phishing",
    p: ["Hacking", "Cyberbullying", "Defacing"]
  },
  "FD-INF-015": {
    j: "AVERAGE",
    p: ["SUM", "COUNT", "MAX"]
  },
  "FD-INF-016": {
    j: "10",
    p: ["8", "12", "14"]
  },
  "FD-INF-017": {
    j: "Wi-Fi (Hotspot)",
    p: ["Fiber Optic", "LAN Ethernet", "NFC"]
  },
  "FD-INF-018": {
    j: "Memeriksa silang dengan portal berita resmi",
    p: [
      "Langsung membagikan artikel tersebut",
      "Menulis komentar kemarahan tanpa membaca isi",
      "Menghapus akun media sosial secara permanen"
    ]
  },
  "FD-INF-019": {
    j: ".jpg atau .png",
    p: [
      ".docx atau .pdf",
      ".mp3 atau .wav",
      ".exe atau .bat"
    ]
  },
  "FD-INF-020": {
    j: "Bisa berkolaborasi di dokumen sama secara real-time",
    p: [
      "Sama sekali tidak membutuhkan koneksi internet",
      "Teks yang diketik tidak bisa dihapus",
      "Tidak memerlukan perangkat elektronik apa pun"
    ]
  },
  "FD-INF-021": {
    j: "Kondisi A dan kondisi B keduanya BENAR",
    p: [
      "Hanya kondisi A yang bernilai BENAR",
      "Salah satu kondisi bernilai BENAR",
      "Kondisi A dan kondisi B keduanya SALAH"
    ]
  },
  "FD-INF-022": {
    j: "Orang asing dapat menyalahgunakan informasi pribadi kita",
    p: [
      "Akun dihapus otomatis oleh pengembang",
      "Virus menginfeksi perangkat keras smartphone",
      "Penurunan jumlah teman dunia nyata drastis"
    ]
  },
  "FD-INF-023": {
    j: "Plagiarisme (Penjiplakan)",
    p: [
      "Paraphrasing (Parafrasa)",
      "Cyberstalking (Penguntitan siber)",
      "Open Source (Sumber Terbuka)"
    ]
  },
  "FD-INF-024": {
    j: "Mencari halaman dengan susunan kata persis utuh",
    p: [
      "Mencari gambar dan video berkaitan kata tersebut",
      "Mengecualikan kata tersebut dari hasil pencarian",
      "Mencari arti masing-masing kata di kamus"
    ]
  },
  "FD-INF-025": {
    j: "Toko fisik yang tidak beradaptasi kehilangan pembeli",
    p: [
      "Bertambahnya pabrik manufaktur di setiap desa",
      "Meningkatnya lowongan kasir supermarket besar",
      "Kualitas barang di pasar menjadi palsu"
    ]
  },
  "FD-INF-026": {
    j: "1, 3",
    p: ["1, 2, 3, 4", "1, 3, 5", "3, 5"]
  },
  "FD-INF-027": {
    j: "MAJU, MAJU, KANAN, MAJU",
    p: [
      "MAJU, KIRI, MAJU, KANAN",
      "KANAN, MAJU, KIRI, MAJU, MAJU",
      "MAJU, MAJU, KIRI, MAJU"
    ]
  },
  "FD-INF-028": {
    j: "Siswa B: Matematika 75, Bahasa Inggris 80",
    p: [
      "Siswa A: Matematika 85, Bahasa Inggris 70",
      "Siswa C: Matematika 90, Bahasa Inggris 90",
      "Siswa D: Matematika 80, Bahasa Inggris 85"
    ]
  },
  "FD-INF-029": {
    j: "CVLV",
    p: ["ATJT", "CUKV", "DWMW"]
  },
  "FD-INF-030": {
    j: "2 - 4 - 1 - 3",
    p: ["1 - 3 - 2 - 4", "2 - 1 - 3 - 4", "4 - 2 - 1 - 3"]
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
