const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const WORKSPACE_DIR = path.resolve(__dirname, '..');
const SCRATCH_DIR = __dirname;

async function extractPdf(filename) {
    const inputPath = path.join(WORKSPACE_DIR, filename);
    const outputPath = path.join(SCRATCH_DIR, filename.replace(/\.[^/.]+$/, "") + '.txt');
    console.log(`Extracting PDF: ${filename} -> ${outputPath}`);
    
    if (!fs.existsSync(inputPath)) {
        console.warn(`File not found: ${inputPath}`);
        return;
    }
    
    const buffer = fs.readFileSync(inputPath);
    try {
        let textResult = '';
        if (pdf.PDFParse) {
            const parser = new pdf.PDFParse(buffer);
            const result = await parser.getText();
            textResult = typeof result === 'string' ? result : (result.text || '');
        } else {
            const parse = (typeof pdf === 'function') ? pdf : (pdf.default || pdf);
            const result = await parse(buffer);
            textResult = result.text || '';
        }
        fs.writeFileSync(outputPath, textResult);
        console.log(`Successfully extracted ${filename} (${textResult.length} chars)`);
    } catch (e) {
        console.error(`Error extracting ${filename}:`, e);
    }
}

async function extractDocx(filename) {
    const inputPath = path.join(WORKSPACE_DIR, filename);
    const outputPath = path.join(SCRATCH_DIR, filename.replace(/\.[^/.]+$/, "") + '.txt');
    console.log(`Extracting DOCX: ${filename} -> ${outputPath}`);
    
    if (!fs.existsSync(inputPath)) {
        console.warn(`File not found: ${inputPath}`);
        return;
    }
    
    try {
        const result = await mammoth.extractRawText({ path: inputPath });
        fs.writeFileSync(outputPath, result.value);
        console.log(`Successfully extracted ${filename} (${result.value.length} chars)`);
    } catch (e) {
        console.error(`Error extracting ${filename}:`, e);
    }
}

async function run() {
    await extractPdf('CFJ-Founding Members NIC copy.pdf');
    await extractPdf('NIC Company Profile.pdf');
    await extractPdf('NIC Founders.pdf');
    await extractPdf('level4.pdf');
    await extractDocx('NIC_Founding_Members_Final.docx');
}

run();
