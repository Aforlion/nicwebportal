const fs = require('fs');
const pdf = require('pdf-parse');

console.log('Type of pdf:', typeof pdf);
console.log('Keys of pdf:', Object.keys(pdf));

const pdfPath = 'C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\NIC_Care_Supervisor_Facility_Manager_Level_4_Course_Curriculum.pdf';

async function run() {
    const buffer = fs.readFileSync(pdfPath);
    let parseFunc = pdf;
    if (typeof pdf !== 'function' && typeof pdf.default === 'function') {
        parseFunc = pdf.default;
    }
    
    if (typeof parseFunc === 'function') {
        const data = await parseFunc(buffer);
        console.log('Successfully extracted text. Length:', data.text.length);
        fs.writeFileSync('C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\Level4_Raw.txt', data.text);
    } else {
        console.error('Could not find a valid parse function');
    }
}

run();
