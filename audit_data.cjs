const fs = require('fs');

const filePath = 'src/engine/EducationalEngine.ts';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /export const SAMPLE_EDUCATIONAL_CONTENT: EducationalContent\[\] = (\[[\s\S]*\]);/m;
const match = content.match(regex);

if (!match) {
    console.error('No match found');
    process.exit(1);
}

const data = eval(match[1]);

const result = {
    totalBanks: 0,
    totalQuestions: data.length,
    totalOptions: 0,
    lengths: {
        len1_2: 0,
        len3_4: 0,
        len5_6: 0,
        len7_8: 0,
        gt8: 0
    },
    shortest: Infinity,
    longest: 0,
    longestId: '',
    totalWords: 0,
    optionLengths: [],
    banks: {},
    jenjangs: {},
    longOptions: []
};

const countWords = str => str.trim().split(/\s+/).length;

data.forEach(q => {
    const bankKey = `${q.jenjang} | ${q.kelasAtauFase} | ${q.mataPelajaran}`;
    if (!result.banks[bankKey]) {
        result.banks[bankKey] = {
            jenjang: q.jenjang,
            fase: q.kelasAtauFase,
            mapel: q.mataPelajaran,
            questions: 0,
            options: 0,
            le6: 0,
            len7_8: 0,
            gt8: 0,
            maxWords: 0
        };
    }
    result.banks[bankKey].questions++;

    if (!result.jenjangs[q.jenjang]) {
        result.jenjangs[q.jenjang] = {
            banks: new Set(),
            questions: 0,
            options: 0,
            le6: 0,
            len7_8: 0,
            gt8: 0,
            maxWords: 0,
            longestOption: ''
        };
    }
    result.jenjangs[q.jenjang].banks.add(bankKey);
    result.jenjangs[q.jenjang].questions++;

    const opts = [
        { type: 'jawabanBenar', text: q.jawabanBenar },
        ...q.pengecoh.map(p => ({ type: 'pengecoh', text: p }))
    ];

    opts.forEach(o => {
        result.totalOptions++;
        result.banks[bankKey].options++;
        result.jenjangs[q.jenjang].options++;

        const words = countWords(o.text);
        result.totalWords += words;
        result.optionLengths.push(words);

        if (words < result.shortest) result.shortest = words;
        if (words > result.longest) {
            result.longest = words;
            result.longestId = q.id;
        }
        if (words > result.banks[bankKey].maxWords) result.banks[bankKey].maxWords = words;
        if (words > result.jenjangs[q.jenjang].maxWords) {
            result.jenjangs[q.jenjang].maxWords = words;
            result.jenjangs[q.jenjang].longestOption = o.text;
        }

        if (words <= 2) result.lengths.len1_2++;
        else if (words <= 4) result.lengths.len3_4++;
        else if (words <= 6) result.lengths.len5_6++;
        else if (words <= 8) result.lengths.len7_8++;
        else result.lengths.gt8++;

        if (words <= 6) {
            result.banks[bankKey].le6++;
            result.jenjangs[q.jenjang].le6++;
        } else if (words <= 8) {
            result.banks[bankKey].len7_8++;
            result.jenjangs[q.jenjang].len7_8++;
            result.longOptions.push({
                jenjang: q.jenjang,
                fase: q.kelasAtauFase,
                mapel: q.mataPelajaran,
                id: q.id,
                pertanyaan: q.pertanyaan,
                type: o.type,
                text: o.text,
                words: words,
                class: 'WATCH',
                reason: 'Approaching UI limit for compact display; may line-wrap awkwardly.'
            });
        } else {
            result.banks[bankKey].gt8++;
            result.jenjangs[q.jenjang].gt8++;
            result.longOptions.push({
                jenjang: q.jenjang,
                fase: q.kelasAtauFase,
                mapel: q.mataPelajaran,
                id: q.id,
                pertanyaan: q.pertanyaan,
                type: o.type,
                text: o.text,
                words: words,
                class: 'NEEDS REVISION',
                reason: 'Exceeds 8-word strict limit. Very likely to break or overcrowd Arena UI.'
            });
        }
    });
});

result.totalBanks = Object.keys(result.banks).length;
// convert sets to sizes for JSON
for (let j in result.jenjangs) {
    result.jenjangs[j].banks = result.jenjangs[j].banks.size;
}

fs.writeFileSync('audit_data.json', JSON.stringify(result, null, 2));
console.log('Audit data generated.');
