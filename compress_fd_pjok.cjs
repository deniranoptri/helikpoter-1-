const fs = require('fs');

const replacements = {
  "FD-PJOK-001": {
    j: "Meningkatkan suhu tubuh dan menyiapkan otot",
    p: [
      "Mengurangi cairan tubuh agar cepat berkeringat",
      "Membuat tubuh lelah sebelum pertandingan dimulai",
      "Meningkatkan massa otot secara instan"
    ]
  },
  "FD-PJOK-002": {
    j: "Mengembalikan detak jantung ke kondisi normal",
    p: [
      "Menghentikan produksi keringat secara drastis",
      "Menambah kecepatan lari pada sesi berikutnya",
      "Menghilangkan rasa haus tanpa minum air"
    ]
  },
  "FD-PJOK-003": {
    j: "Dribbling",
    p: ["Passing", "Shooting", "Rebound"]
  },
  "FD-PJOK-004": {
    j: "Kaki bagian dalam",
    p: ["Ujung jari kaki (sepatu)", "Kaki bagian luar", "Tumit kaki"]
  },
  "FD-PJOK-005": {
    j: "Satu kaki melangkah ke depan (kuda-kuda)",
    p: [
      "Kedua kaki dirapatkan sejajar",
      "Satu kaki diangkat tinggi-tinggi",
      "Kedua kaki disilangkan di belakang"
    ]
  },
  "FD-PJOK-006": {
    j: "Smash",
    p: ["Lob", "Dropshot", "Drive"]
  },
  "FD-PJOK-007": {
    j: "Start jongkok",
    p: ["Start berdiri", "Start melayang", "Start melompat"]
  },
  "FD-PJOK-008": {
    j: "Mengistirahatkan kaki dan mengompresnya dengan es",
    p: [
      "Mengoleskan balsem panas dan memijatnya keras",
      "Memaksanya terus berjalan agar tidak kaku",
      "Merendam kaki ke dalam air mendidih"
    ]
  },
  "FD-PJOK-009": {
    j: "Kekuatan otot lengan dan dada",
    p: [
      "Kelenturan otot punggung",
      "Kecepatan lari kaki",
      "Daya tahan paru-paru (kardiovaskular)"
    ]
  },
  "FD-PJOK-010": {
    j: "Mencegah dehidrasi dan mengganti cairan tubuh",
    p: [
      "Meningkatkan berat badan agar tenaga besar",
      "Mencegah perut terasa lapar",
      "Menurunkan kadar oksigen dalam darah"
    ]
  },
  "FD-PJOK-011": {
    j: "Fase pendinginan setelah olahraga inti",
    p: [
      "Tengah malam sebelum tidur",
      "Fase inti pertandingan bola basket",
      "Saat sedang berlari sprint"
    ]
  },
  "FD-PJOK-012": {
    j: "Daya tahan jantung dan paru-paru",
    p: [
      "Kekuatan otot jari tangan",
      "Kelenturan persendian panggul",
      "Kecepatan reaksi mata"
    ]
  },
  "FD-PJOK-013": {
    j: "Passing bawah (dig) merapatkan kedua lengan",
    p: [
      "Passing atas menggunakan ujung-ujung jari",
      "Menendang bola menggunakan kaki",
      "Menghindari bola dan membiarkannya jatuh"
    ]
  },
  "FD-PJOK-014": {
    j: "Forehand grip",
    p: ["Backhand grip", "Penhold grip", "American grip"]
  },
  "FD-PJOK-015": {
    j: "Tumpuan (Take-off)",
    p: ["Awalan (Run-up)", "Melayang (Flight)", "Mendarat (Landing)"]
  },
  "FD-PJOK-016": {
    j: "Dagu merapat ke dada, tengkuk menyentuh matras",
    p: [
      "Kepala mendongak, dahi menyentuh matras",
      "Kaki diluruskan kaku sejak awal",
      "Mata terpejam, tubuh dijatuhkan ke samping"
    ]
  },
  "FD-PJOK-017": {
    j: "Gaya dada",
    p: ["Gaya bebas", "Gaya punggung", "Gaya kupu-kupu"]
  },
  "FD-PJOK-018": {
    j: "60 menit (1 jam) setiap hari",
    p: [
      "10 menit setiap minggu",
      "3 jam tanpa henti setiap hari",
      "Hanya saat pelajaran PJOK saja"
    ]
  },
  "FD-PJOK-019": {
    j: "Mencegah pertumbuhan jamur dan bakteri",
    p: [
      "Agar pakaian olahraga tidak cepat pudar",
      "Supaya tubuh merasa kepanasan lebih lama",
      "Hanya untuk mematuhi peraturan sekolah"
    ]
  },
  "FD-PJOK-020": {
    j: "Kelelahan panas (Heat exhaustion) atau dehidrasi",
    p: [
      "Peningkatan massa otot lengan",
      "Cedera otot robek (strain)",
      "Patah tulang ringan"
    ]
  },
  "FD-PJOK-021": {
    j: "Meningkatkan estetika, keteraturan, dan keseimbangan gerakan",
    p: [
      "Mengurangi jumlah kalori yang terbakar",
      "Membuat tubuh cepat merasa lelah",
      "Menghilangkan kebutuhan akan pemanasan"
    ]
  },
  "FD-PJOK-022": {
    j: "Sikap siaga untuk pembelaan maupun serangan",
    p: [
      "Cara memberikan penghormatan kepada wasit",
      "Sikap beristirahat di tengah pertandingan",
      "Gerakan pemanasan pergelangan tangan saja"
    ]
  },
  "FD-PJOK-023": {
    j: "Mengubah arah tubuh cepat tanpa hilang keseimbangan",
    p: [
      "Berlari lintasan lurus dengan kecepatan konstan",
      "Mengangkat beban maksimal di tempat",
      "Meregangkan otot punggung sejauh mungkin"
    ]
  },
  "FD-PJOK-024": {
    j: "Mengurangi stres dan menciptakan perasaan bahagia",
    p: [
      "Meningkatkan rasa kantuk berlebih di pagi hari",
      "Membuat seseorang mudah marah pada teman",
      "Menghentikan kerja otak saat berkonsentrasi belajar"
    ]
  },
  "FD-PJOK-025": {
    j: "Memaksimalkan momentum yang diubah menjadi jarak lompatan",
    p: [
      "Menghemat tenaga saat mendarat di pasir",
      "Menghindari gesekan udara agar tubuh ringan",
      "Membiasakan kaki tidak menyentuh papan tolak"
    ]
  },
  "FD-PJOK-026": {
    j: "Membuang bola keluar agar medis dapat menolong",
    p: [
      "Meninggalkan teman untuk menyamakan kedudukan",
      "Memarahi teman karena merusak strategi tim",
      "Meminta waktu dihentikan lalu pulang ke rumah"
    ]
  },
  "FD-PJOK-027": {
    j: "4 - 2 - 3 - 1",
    p: ["1 - 4 - 2 - 3", "2 - 4 - 3 - 1", "4 - 3 - 2 - 1"]
  },
  "FD-PJOK-028": {
    j: "Mengangkat beban dengan postur tulang belakang melengkung",
    p: [
      "Siswa terlalu banyak minum sebelum mengangkat beban",
      "Beban yang diangkat terbuat dari bahan plastik",
      "Siswa bernapas melalui hidung saat mengangkat beban"
    ]
  },
  "FD-PJOK-029": {
    j: "Melakukan gerakan memotong (cutting) membebaskan teman",
    p: [
      "Semua pemain berdiri diam menunggu bola",
      "Semua pemain berkumpul berdesakan di bawah ring",
      "Berlari lambat dalam formasi satu baris"
    ]
  },
  "FD-PJOK-030": {
    j: "Menurunkan suhu inti tubuh melalui penguapan",
    p: [
      "Membuang cadangan lemak melalui pori-pori",
      "Meningkatkan suhu tubuh agar tahan dingin",
      "Menambah volume sel darah di otot lengan"
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
