const fs = require('fs');
const pdfExport = require('pdf-parse');

console.log('pdfExport:', pdfExport);

// Try to guess
if (typeof pdfExport === 'function') {
    const dataBuffer = fs.readFileSync('CFJ-Founding Members NIC copy.pdf');
    pdfExport(dataBuffer).then(data => console.log(data.text))
        .catch(e => console.error(e));
}
