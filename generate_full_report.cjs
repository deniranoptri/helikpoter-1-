const fs = require('fs');
const data = JSON.parse(fs.readFileSync('audit_data.json', 'utf8'));

let criticalCount = 0;
let highCount = 0;
let watchCount = 0;

data.longOptions.forEach(opt => {
    if (opt.words > 12) criticalCount++;
    else if (opt.words >= 9) highCount++;
    else watchCount++;
});

let status = 'PASS';
if (criticalCount > 0 || highCount > 0) status = 'NEEDS REVISION';
else if (watchCount > 0) status = 'WATCH';

let md = `GLOBAL ANSWER OPTION LENGTH AUDIT

Status:
${status}

Banks audited:
${data.totalBanks}
Questions audited:
${data.totalQuestions}
Options audited:
${data.totalOptions}

≤6 words:
${data.lengths.len1_2 + data.lengths.len3_4 + data.lengths.len5_6}
7–8 words:
${data.lengths.len7_8}
>8 words:
${data.lengths.gt8}

Longest option:
${data.longestId} — ${data.longest} words

Critical issues:
${criticalCount}

High-priority issues:
${highCount}

Watch issues:
${watchCount}

Source modified:
NO

==================================================
GLOBAL STATISTICS
==================================================

TOTAL BANKS: ${data.totalBanks}
TOTAL QUESTIONS: ${data.totalQuestions}
TOTAL ANSWER OPTIONS: ${data.totalOptions}

OPTION LENGTH DISTRIBUTION:

1–2 words: ${data.lengths.len1_2}
3–4 words: ${data.lengths.len3_4}
5–6 words: ${data.lengths.len5_6}
7–8 words: ${data.lengths.len7_8}
>8 words: ${data.lengths.gt8}

% options ≤6 words: ${((data.lengths.len1_2 + data.lengths.len3_4 + data.lengths.len5_6) / data.totalOptions * 100).toFixed(2)}%
% options 7–8 words: ${(data.lengths.len7_8 / data.totalOptions * 100).toFixed(2)}%
% options >8 words: ${(data.lengths.gt8 / data.totalOptions * 100).toFixed(2)}%

Shortest option: ${data.shortest} words
Longest option: ${data.longest} words
Average option length: ${(data.totalWords / data.totalOptions).toFixed(2)} words
Median option length: ${data.optionLengths.sort((a,b)=>a-b)[Math.floor(data.optionLengths.length / 2)]} words
Maximum word count: ${data.longest} words

==================================================
BREAKDOWN BY JENJANG
==================================================

`;

for (let j in data.jenjangs) {
    const jd = data.jenjangs[j];
    md += `${j}
Banks: ${jd.banks}
Questions: ${jd.questions}
Options: ${jd.options}
≤6 words: ${jd.le6}
7–8 words: ${jd.len7_8}
>8 words: ${jd.gt8}
Longest option: "${jd.longestOption}" (${jd.maxWords} words)\n\n`;
}

md += `==================================================
BREAKDOWN BY BANK
==================================================

| Jenjang | Fase | Mapel | Questions | Options | ≤6 | 7–8 | >8 | Max Words |
|---------|------|-------|-----------|---------|----|-----|----|-----------|
`;

for (let bKey in data.banks) {
    const b = data.banks[bKey];
    md += `| ${b.jenjang} | ${b.fase} | ${b.mapel} | ${b.questions} | ${b.options} | ${b.le6} | ${b.len7_8} | ${b.gt8} | ${b.maxWords} |\n`;
}

md += `\n==================================================
REPORT EVERY LONG OPTION
==================================================\n\n`;

data.longOptions.forEach(opt => {
    md += `Jenjang: ${opt.jenjang}
Fase/Kelas: ${opt.fase}
Mata Pelajaran: ${opt.mapel}
Question ID: ${opt.id}
Question: ${opt.pertanyaan}
Option Type: ${opt.type}
Option Text: "${opt.text}"
Word Count: ${opt.words}
Classification: ${opt.class}
Reason it may affect compact Arena UI: ${opt.reason}\n\n`;
});

fs.writeFileSync('audit_report_full.md', md);
