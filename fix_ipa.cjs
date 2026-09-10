const fs = require('fs');

const content = fs.readFileSync('src/engine/EducationalEngine.ts', 'utf8');
const match = content.match(/(export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = )(\[[\s\S]*\]);/);
if (!match) {
  console.log("Not found array");
  process.exit(1);
}

const arr = eval(match[2]);

const changes = {
  "FD-IPA-002": {
    j: "Sel tumbuhan memiliki dinding sel dan kloroplas.",
    p: [
      "Sel hewan memiliki vakuola besar, tumbuhan tidak.",
      "Sel tumbuhan tidak memiliki membran sel.",
      "Sel tumbuhan tidak memiliki inti sel."
    ]
  },
  "FD-IPA-003": {
    j: "Sel->Jaringan->Organ->Sistem Organ->Organisme",
    p: [
      "Sel->Organ->Jaringan->Sistem Organ->Organisme",
      "Jaringan->Sel->Organ->Sistem Organ->Organisme",
      "Organisme->Sistem Organ->Organ->Jaringan->Sel"
    ]
  },
  "FD-IPA-004": {
    j: "Membunuh kuman pada makanan dan mengaktifkan pepsinogen"
  },
  "FD-IPA-006": {
    j: "Bilik kiri->Aorta->Seluruh tubuh->Vena Cava->Serambi kanan",
    p: [
      "Bilik kanan->Arteri pulmonalis->Paru-paru->Vena pulmonalis->Serambi kiri",
      "Serambi kiri->Bilik kiri->Aorta->Paru-paru->Serambi kanan",
      "Bilik kiri->Vena Cava->Seluruh tubuh->Aorta->Serambi kanan"
    ]
  },
  "FD-IPA-009": {
    j: "Massa jenis benda lebih kecil dari air",
    p: [
      "Massa jenis benda lebih besar dari air",
      "Massa benda lebih besar dari massa air",
      "Volume benda lebih besar dari volume air"
    ]
  },
  "FD-IPA-016": {
    j: "Luas penampang kecil menghasilkan tekanan yang besar",
    p: [
      "Luas penampang besar menghasilkan gaya yang besar",
      "Massa pisau tajam lebih ringan, mudah diayunkan",
      "Gaya gesek pisau tajam lebih besar"
    ]
  },
  "FD-IPA-027": {
    j: "Populasi belalang meningkat, populasi ular menurun"
  },
  "FD-IPA-029": {
    j: "Gas rumah kaca memerangkap radiasi panas bumi",
    p: [
      "Lapisan ozon berlubang, sinar ultraviolet banyak masuk",
      "Atmosfer memfokuskan panas matahari seperti lensa cembung",
      "Aktivitas inti bumi merambat ke kerak bumi"
    ]
  },
  "FD-IPA-030": {
    j: "Perbedaan musim di bumi utara dan selatan",
    p: [
      "Terjadinya siang dan malam",
      "Gerak semu harian dari timur ke barat",
      "Perbedaan waktu di berbagai wilayah bumi"
    ]
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
