const fs = require('fs');
const path = require('path');

const SKILLS_DIR = 'C:\\Users\\aforl\\.gemini\\config\\skills';

const REQUIRED_SECTIONS = [
  '## Identity',
  '## Core Responsibilities',
  '## Methodology',
  '## Principles',
  '## Output Format',
  '## JBK Brain Awareness'
];

async function run() {
  console.log(`Checking skills compliance in: ${SKILLS_DIR}\n`);
  
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error('Skills directory does not exist!');
    return;
  }
  
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries.filter(e => e.isDirectory());
  
  console.log(`Found ${skillDirs.length} skill folders.\n`);
  
  const results = [];
  
  for (const dir of skillDirs) {
    const skillName = dir.name;
    const skillPath = path.join(SKILLS_DIR, skillName);
    const skillFilePath = path.join(skillPath, 'SKILL.md');
    
    const result = {
      name: skillName,
      hasSkillMd: false,
      missingSections: []
    };
    
    if (fs.existsSync(skillFilePath)) {
      result.hasSkillMd = true;
      const content = fs.readFileSync(skillFilePath, 'utf8');
      
      for (const section of REQUIRED_SECTIONS) {
        // Simple string check (case insensitive to be flexible, but strict on heading prefix)
        const lowerContent = content.toLowerCase();
        const lowerSection = section.toLowerCase();
        if (!lowerContent.includes(lowerSection)) {
          result.missingSections.push(section);
        }
      }
    }
    
    results.push(result);
  }
  
  // Format results in a table
  console.log('| Skill Folder | SKILL.md Exists? | Compliant? | Missing Sections |');
  console.log('|--------------|------------------|------------|------------------|');
  
  for (const r of results) {
    const exists = r.hasSkillMd ? '✅ Yes' : '❌ No';
    let compliant = '❌ No';
    let missing = 'N/A';
    
    if (r.hasSkillMd) {
      if (r.missingSections.length === 0) {
        compliant = '✅ Yes';
        missing = 'None';
      } else {
        compliant = '⚠️ Partial';
        missing = r.missingSections.join(', ');
      }
    } else {
      missing = 'SKILL.md file missing';
    }
    
    console.log(`| ${r.name} | ${exists} | ${compliant} | ${missing} |`);
  }
}

run().catch(console.error);
