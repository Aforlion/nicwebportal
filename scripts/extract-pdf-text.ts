import * as fs from 'fs';
import * as pdf from 'pdf-parse';

const pdfPath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/NIC_Care_Supervisor_Facility_Manager_Level_4_Course_Curriculum.pdf';
const outputPath = 'C:/Users/Olatunji/Desktop/NIC Docs/Advanced/Level4_Extracted.txt';

async function extractText() {
  console.log('Extracting text from PDF...');
  const dataBuffer = fs.readFileSync(pdfPath);
  
  // Use any to avoid TS errors with the CJS/ESM interop
  const pdfParser = (pdf as any).default || pdf;
  const data = await pdfParser(dataBuffer);
  
  fs.writeFileSync(outputPath, data.text);
  console.log(`Text extracted successfully to ${outputPath}`);
  console.log(`Total Pages: ${data.numpages}`);
}

extractText();
