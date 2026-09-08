const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const startStr = '      {/* DEDICATED SAFE ANSWER REGION (For Narrow Mobile Screens) */}';
const endStr = '      {/* BOTTOM CONTROL BAR */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    fs.writeFileSync('src/components/Arena.tsx', code);
    console.log('Removed mobile grid');
} else {
    console.log('Could not find start or end strings');
}
