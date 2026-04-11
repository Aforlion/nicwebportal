const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/NIC_Care_Supervisor_Facility_Manager_Level_4_Course_Curriculum.pdf';
const outputPath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/Level4_Extracted.txt';

async function extractText() {
    console.log('Extracting text from Level 4 PDF...');
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        
        fs.writeFileSync(outputPath, data.text);
        console.log(`✅ Text extracted successfully to ${outputPath}`);
        console.log(`Total Pages: ${data.numpages}`);
    } catch (err) {
        console.error('❌ Extraction failed:', err);
    }
}

extractText();
