const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/(export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = )(\[[\s\S]*\]);/);
if (!match) {
  console.log("Not found array");
  process.exit(1);
}

const arr = eval(match[2]);

const changes = {
  "FD-IPS-005": {
    p: [
      "Mengubah seluruh kawasan hutan menjadi lahan pertanian",
      "Mengekspor kayu gelondongan sebanyak-banyaknya untuk devisa",
      "Melarang sama sekali penduduk masuk ke hutan"
    ]
  },
  "FD-IPS-007": {
    j: "Angka kelahiran tinggi didominasi penduduk usia muda",
    p: [
      "Angka harapan hidup tinggi, didominasi oleh lansia",
      "Angka kematian bayi sangat rendah dan kelahiran lambat",
      "Tingkat migrasi penduduk dari luar negeri sangat besar"
    ]
  },
  "FD-IPS-015": {
    j: "Letaknya strategis di Selat Malaka jalur perdagangan",
    p: [
      "Memiliki tanah vulkanik sangat subur untuk pertanian",
      "Dikelilingi oleh benteng pegunungan yang sulit ditembus musuh",
      "Merupakan satu-satunya penghasil rempah-rempah di nusantara"
    ]
  },
  "FD-IPS-017": {
    j: "Mengisi kas Belanda yang kosong akibat peperangan",
    p: [
      "Memperkenalkan jenis tanaman baru kepada petani Indonesia",
      "Meningkatkan kesejahteraan penduduk pribumi Hindia Belanda",
      "Membangun infrastruktur jalan dan rel kereta Jawa"
    ]
  },
  "FD-IPS-019": {
    j: "Memperkuat persatuan bangsa mengatasi perbedaan kedaerahan"
  },
  "FD-IPS-020": {
    j: "Perbedaan pendapat golongan tua dan muda mengenai proklamasi",
    p: [
      "Penculikan Soekarno-Hatta oleh Jepang untuk mencegah proklamasi",
      "Persiapan penyerangan militer oleh sekutu ke kota Jakarta",
      "Penyusunan naskah proklamasi rahasia di luar Jakarta"
    ]
  },
  "FD-IPS-021": {
    j: "Peningkatan gas rumah kaca memicu pemanasan global"
  },
  "FD-IPS-022": {
    p: [
      "Mengurangi kemacetan lalu lintas di kota besar",
      "Membuat harga kendaraan pribadi menjadi sangat mahal",
      "Menghilangkan profesi sopir angkutan kota sepenuhnya"
    ]
  },
  "FD-IPS-024": {
    p: [
      "Koperasi mencari keuntungan sebesar-besarnya bagi pemilik modal",
      "Keputusan tertinggi ditentukan oleh besar saham dimiliki",
      "Koperasi hanya dikelola aparatur negara dan pemda"
    ]
  },
  "FD-IPS-026": {
    j: "Tanah vulkanik subur dan kaya bahan tambang"
  },
  "FD-IPS-028": {
    j: "Berbeda suku, agama, dan budaya, tetap satu",
    p: [
      "Bangsa Indonesia menggunakan satu bahasa agar bersatu",
      "Setiap perbedaan pendapat harus diselesaikan melalui pengadilan hukum",
      "Seluruh suku bangsa dilebur menjadi satu identitas"
    ]
  },
  "FD-IPS-029": {
    j: "Mengerahkan tenaga kerja gratis membangun infrastruktur perang"
  },
  "FD-IPS-030": {
    j: "Orang tua memberikan kasih sayang, perhatian, keamanan"
  }
};

let modifiedQuestions = 0;
arr.forEach(q => {
  if (changes[q.id]) {
    if (changes[q.id].j) q.jawabanBenar = changes[q.id].j;
    if (changes[q.id].p) q.pengecoh = changes[q.id].p;
    modifiedQuestions++;
  }
});

const newArrStr = JSON.stringify(arr, null, 2);
const newContent = content.substring(0, match.index) + match[1] + newArrStr + ";" + content.substring(match.index + match[0].length);

fs.writeFileSync('src/engine/EducationalEngine.ts', newContent);
console.log(`Modified ${modifiedQuestions} questions successfully.`);
