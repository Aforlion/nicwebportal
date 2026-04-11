const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\NIC_Care_Supervisor_Facility_Manager_Level_4_Course_Curriculum.pdf';

async function run() {
    console.log('Using new pdf.PDFParse()...');
    const buffer = fs.readFileSync(pdfPath);
    try {
        let text = '';
        if (typeof pdf === 'function') {
            const data = await pdf(buffer);
            text = data.text;
        } else if (pdf.PDFParse) {
            // In some versions it's a class
            // But usually the library exports a function
            // Let's try to find the actual parse function
            const data = await pdf(buffer);
            text = data.text;
        }
        
        // Wait, if it failed before with 'pdf is not a function' 
        // let's try another approach for this specific installed version
        // Maybe it's a different pdf-parse
        console.log('Extracting text...');
        const data = await pdf(buffer);
        console.log('Success! Length:', data.text.length);
        fs.writeFileSync('C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\Level4_Raw.txt', data.text);
    } catch (e) {
        console.error('Final Error:', e);
    }
}

run();
