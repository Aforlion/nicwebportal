const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\NIC_Care_Supervisor_Facility_Manager_Level_4_Course_Curriculum.pdf';

async function run() {
    console.log('Using pdf.PDFParse directly...');
    const buffer = fs.readFileSync(pdfPath);
    try {
        // If pdf is an object and has PDFParse
        const parseFunc = (typeof pdf === 'function') ? pdf : pdf.PDFParse;
        
        if (typeof parseFunc === 'function') {
            const data = await parseFunc(buffer);
            console.log('Success! Length:', data.text.length);
            fs.writeFileSync('C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\Level4_Raw.txt', data.text);
        } else {
            console.error('Available keys:', Object.keys(pdf));
        }
    } catch (e) {
        console.error('Error during parse:', e);
    }
}

run();
