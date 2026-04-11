const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\NIC_Care_Supervisor_Facility_Manager_Level_4_Course_Curriculum.pdf';
const outputPath = 'C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\Level4_Raw.txt';

async function run() {
    console.log('Extracting text...');
    try {
        const buffer = fs.readFileSync(pdfPath);
        const data = await pdf(buffer);
        fs.writeFileSync(outputPath, data.text);
        console.log('Success! Saved to ' + outputPath);
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
