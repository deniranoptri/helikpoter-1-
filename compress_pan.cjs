const fs = require('fs');

const replacements = {
  "FD-PAN-001": {
    j: "Hak perlindungan dan kewajiban menaati tata tertib",
    p: [
      "Hak mendapat pujian dan kewajiban membelikan makanan",
      "Kewajiban menghukum teman dan hak dijauhi guru",
      "Hak mengabaikan aturan dan kewajiban menghentikan guru"
    ]
  },
  "FD-PAN-002": {
    j: "Rela berkorban untuk kepentingan bangsa dan negara",
    p: [
      "Mengutamakan kepentingan keluarga di atas kepentingan negara",
      "Menyerang budaya negara lain yang berbeda",
      "Hanya berteman dengan orang dari suku sama"
    ]
  },
  "FD-PAN-003": {
    j: "Kebebasan untuk menganut agama dan beribadah",
    p: [
      "Kewajiban untuk tunduk pada perintah atasan",
      "Mendapatkan pendidikan gratis dari pemerintah",
      "Hak memilih pemimpin negara dalam pemilihan"
    ]
  },
  "FD-PAN-004": {
    j: "Melaporkannya kepada guru atau pihak berwenang",
    p: [
      "Ikut menertawakan teman agar tidak ikut dibully",
      "Merekam kejadian dan menyebarkannya di media sosial",
      "Membalas dengan kekerasan secara diam-diam"
    ]
  },
  "FD-PAN-005": {
    j: "Mendengarkan usulan orang lain dengan menghargai perbedaan",
    p: [
      "Memaksakan kehendak agar keputusannya cepat disetujui",
      "Meninggalkan ruang musyawarah saat terjadi perbedaan",
      "Menyela pembicaraan karena merasa idenya paling benar"
    ]
  },
  "FD-PAN-006": {
    j: "Berbeda-beda tetapi tetap satu jua",
    p: [
      "Bersatu kita teguh bercerai kita runtuh",
      "Keberagaman adalah sumber konflik yang harus diseragamkan",
      "Satu bangsa dengan satu bahasa ibu sama"
    ]
  },
  "FD-PAN-007": {
    j: "Bekerja sama membersihkan kelas dan halaman sekolah",
    p: [
      "Bekerja sama saat ujian agar nilai bagus",
      "Mengumpulkan uang saku untuk membeli jajan bersama",
      "Berkumpul di kantin saat jam pelajaran kosong"
    ]
  },
  "FD-PAN-008": {
    j: "Kewajiban",
    p: ["Hak", "Penghargaan", "Keadilan"]
  },
  "FD-PAN-009": {
    j: "Dasar Negara",
    p: ["Pandangan Hidup", "Kepribadian Bangsa", "Ideologi Tertutup"]
  },
  "FD-PAN-010": {
    j: "Pandangan hidup bangsa",
    p: ["Perjanjian luhur bangsa", "Dasar hukum negara", "Identitas pemerintahan"]
  },
  "FD-PAN-011": {
    j: "Peraturan di bawahnya tidak boleh bertentangan UUD",
    p: [
      "Peraturan daerah dapat mengabaikan UUD 1945",
      "UUD hanya berlaku bagi pejabat negara",
      "UUD dapat digantikan oleh Peraturan Pemerintah"
    ]
  },
  "FD-PAN-012": {
    j: "Kesopanan",
    p: ["Hukum", "Kesusilaan", "Agama"]
  },
  "FD-PAN-013": {
    j: "Tiga",
    p: ["Satu", "Dua", "Lima"]
  },
  "FD-PAN-014": {
    j: "Menerima kekalahan dan mendukung program ketua terpilih",
    p: [
      "Menolak hasil karena menganggap ada kecurangan",
      "Tidak mau lagi ikut kegiatan OSIS",
      "Membujuk teman agar tidak mematuhi ketua baru"
    ]
  },
  "FD-PAN-015": {
    j: "Rakyat pemegang kekuasaan tertinggi diwakilkan melalui pemilu",
    p: [
      "Rakyat bebas bertindak tanpa perlu mematuhi hukum",
      "Presiden memegang kekuasaan mutlak mengatur rakyat",
      "Kekuasaan negara dipegang tentara dan kepolisian"
    ]
  },
  "FD-PAN-016": {
    j: "Belajar rajin untuk berprestasi dan memajukan bangsa",
    p: [
      "Membeli senjata tajam untuk menjaga keamanan lingkungan",
      "Ikut berperang di daerah perbatasan negara",
      "Melakukan unjuk rasa setiap hari mengkritik pemerintah"
    ]
  },
  "FD-PAN-017": {
    j: "Bekerja sama dan menghargai tanpa mempermasalahkan suku",
    p: [
      "Menyerahkan tugas kepada siswa paling pintar sukunya",
      "Hanya mau berdiskusi menggunakan bahasa daerah",
      "Memisahkan tugas berdasarkan latar belakang budaya"
    ]
  },
  "FD-PAN-018": {
    j: "Menghormati pemeluk agama lain dalam menjalankan ibadah",
    p: [
      "Mencampuradukkan ajaran berbagai agama menjadi agama baru",
      "Ikut merayakan semua ritual keagamaan umat lain",
      "Membatasi waktu ibadah agama lain"
    ]
  },
  "FD-PAN-019": {
    j: "Melakukan pemungutan suara (voting) menjaga persatuan",
    p: [
      "Membatalkan seluruh rencana pentas seni",
      "Menyerahkan keputusan sepihak kepada kepala sekolah",
      "Memaksa satu pihak mengalah dengan intimidasi"
    ]
  },
  "FD-PAN-020": {
    j: "Hak diperoleh setelah melaksanakan kewajiban dan tanggung jawab",
    p: [
      "Pemerintah hanya mendengarkan yang rajin membayar pajak",
      "Hak asasi tidak berlaku di negara berkembang",
      "Kewajiban lebih mudah dilakukan daripada menuntut hak"
    ]
  },
  "FD-PAN-021": {
    j: "HAM universal, sedangkan Hak Warga Negara dibatasi kewarganegaraan",
    p: [
      "HAM diberikan pemerintah, Hak Warga Negara dari Tuhan",
      "HAM bagi dewasa, Hak Warga Negara sejak lahir",
      "HAM bisa dicabut, Hak Warga Negara mutlak selamanya"
    ]
  },
  "FD-PAN-022": {
    j: "Identitas nasional bangsa",
    p: ["Ideologi liberalisme", "Nasionalisme chauvinisme", "Globalisasi budaya"]
  },
  "FD-PAN-023": {
    j: "Keberagaman adalah kekayaan bangsa yang harus ditoleransi",
    p: [
      "Keberagaman adalah ancaman laten yang memecah belah",
      "Keberagaman harus dihilangkan perlahan agar negara seragam",
      "Keberagaman membuktikan Indonesia tidak siap menjadi modern"
    ]
  },
  "FD-PAN-024": {
    j: "Membatasi kekuasaan pemerintah agar tidak bertindak sewenang-wenang",
    p: [
      "Memberi kekuasaan mutlak presiden keadaan darurat",
      "Menentukan agama resmi seluruh warga negara",
      "Meniadakan hak asasi demi kepentingan keamanan militer"
    ]
  },
  "FD-PAN-025": {
    j: "Tanggung jawab menjaga ketertiban lingkungan bersama",
    p: [
      "Hak untuk mendapatkan bayaran dari ketua RT",
      "Kewajiban menakut-nakuti pendatang baru di kampung",
      "Keinginan untuk mencampuri urusan pribadi tetangga"
    ]
  },
  "FD-PAN-026": {
    j: "Berhasil menerapkan sebagai Dasar Negara, gagal Pandangan Hidup",
    p: [
      "Melanggar hukum tata negara mencampurkan nilai agama",
      "Sikap angkuh dibenarkan karena jabatannya lebih tinggi",
      "Pancasila tidak berlaku untuk kehidupan pribadi bupati"
    ]
  },
  "FD-PAN-027": {
    j: "Hak asasi seseorang dibatasi oleh hak orang lain",
    p: [
      "Budi benar karena kebebasan berekspresi dijamin UUD",
      "Tetangga salah karena tidak memiliki ruang kedap suara",
      "Budi boleh memutar musik jika membayar kompensasi"
    ]
  },
  "FD-PAN-028": {
    j: "Berdialog mencari akar masalah dan bermusyawarah mufakat",
    p: [
      "Menjatuhkan denda besar agar mereka jera",
      "Kelompok yang anggotanya banyak dinyatakan sebagai pemenang",
      "Menangkap seluruh pemuda tanpa memintai keterangan"
    ]
  },
  "FD-PAN-029": {
    j: "Mengubahnya berarti membubarkan Negara Kesatuan Republik Indonesia",
    p: [
      "Pembukaan UUD ditulis dengan bahasa kuno",
      "Aturan internasional melarang mengubah teks kemerdekaan",
      "Proses mengubah butuh persetujuan Perserikatan Bangsa-Bangsa"
    ]
  },
  "FD-PAN-030": {
    j: "Menyaring informasi menggunakan nilai Pancasila dan mengambil positif",
    p: [
      "Menutup akses internet agar tidak terkontaminasi budaya luar",
      "Menerima seluruh tren asing agar bangsa dianggap modern",
      "Hanya berteman dengan orang luar negeri agar keren"
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

