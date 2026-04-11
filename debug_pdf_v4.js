const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\NIC_Care_Supervisor_Facility_Manager_Level_4_Course_Curriculum.pdf';

async function run() {
    console.log('Final Attempt with pdf.PDFParse...');
    const buffer = fs.readFileSync(pdfPath);
    try {
        // If pdf-parse is exported as an object with PDFParse
        const data = await pdf(buffer); 
        console.log('Success? Text length:', data.text.length);
        fs.writeFileSync('C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\Level4_Raw.txt', data.text);
    } catch (e) {
        console.log('Caught error. Trying pdf.PDFParse directly...');
        try {
            // Some versions require 'new' or have it as a property
            // But usually pdf-parse is a function.
            // If it failed with "pdf is not a function", let's check what it is
            console.log('typeof pdf:', typeof pdf);
            console.log('Object.keys(pdf):', Object.keys(pdf));
            
            // This is a common pattern for some builds
            const parse = (typeof pdf === 'function') ? pdf : (pdf.default || pdf.PDFParse);
            const result = await parse(buffer);
            fs.writeFileSync('C:\\Users\\Olatunji\\Desktop\\NIC Docs\\Advanced\\Level4_Raw.txt', result.text);
            console.log('Successfully saved text!');
        } catch (e2) {
            console.error('Total failure:', e2);
        }
    }
}

run();
