const fs = require('fs');
let code = fs.readFileSync('src/components/Arena.tsx', 'utf-8');

const duplicate = `            const readyLabel = container.querySelector('.hotspot-ready-label') as HTMLDivElement;`;

// Replace the SECOND occurrence of it
let firstIndex = code.indexOf(duplicate);
if (firstIndex !== -1) {
    let secondIndex = code.indexOf(duplicate, firstIndex + 1);
    if (secondIndex !== -1) {
        code = code.substring(0, secondIndex) + code.substring(secondIndex + duplicate.length);
        fs.writeFileSync('src/components/Arena.tsx', code);
        console.log('Fixed duplicate declaration');
    }
}
