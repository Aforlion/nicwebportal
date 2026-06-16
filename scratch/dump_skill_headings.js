const fs = require('fs');
const path = require('path');

const SKILLS_DIR = 'C:\\Users\\aforl\\.gemini\\config\\skills';

async function run() {
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries.filter(e => e.isDirectory());
  
  for (const dir of skillDirs) {
    const skillFilePath = path.join(SKILLS_DIR, dir.name, 'SKILL.md');
    if (fs.existsSync(skillFilePath)) {
      console.log(`=== Headings in: ${dir.name} ===`);
      const content = fs.readFileSync(skillFilePath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Print lines that start with # or are capitalized single lines (potential plain-text headings)
        if (trimmed.startsWith('#') || (trimmed.length > 0 && trimmed.length < 40 && /^[A-Z][a-zA-Z\s]+$/.test(trimmed))) {
          console.log(`  ${trimmed}`);
        }
      }
      console.log();
    }
  }
}

run().catch(console.error);
