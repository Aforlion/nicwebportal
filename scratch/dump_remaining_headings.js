const fs = require('fs');
const path = require('path');

const SKILLS_DIR = 'C:\\Users\\aforl\\.gemini\\config\\skills';
const TARGETS = ['education-architect', 'growth-strategist', 'deep-research-director'];

async function run() {
  for (const name of TARGETS) {
    const skillFilePath = path.join(SKILLS_DIR, name, 'SKILL.md');
    if (fs.existsSync(skillFilePath)) {
      console.log(`=== Headings in: ${name} ===`);
      const content = fs.readFileSync(skillFilePath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || (trimmed.length > 0 && trimmed.length < 45 && /^[A-Z][a-zA-Z\s]+$/.test(trimmed))) {
          console.log(`  ${trimmed}`);
        }
      }
      console.log();
    }
  }
}

run().catch(console.error);
