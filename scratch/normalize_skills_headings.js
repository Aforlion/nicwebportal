const fs = require('fs');
const path = require('path');

const SKILLS_DIR = 'C:\\Users\\aforl\\.gemini\\config\\skills';

function normalizeContent(content, skillName) {
  const lines = content.split('\n');
  const normalizedLines = [];
  let isFirstLine = true;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const cleanLower = trimmed.replace(/^[#\s\-\*]+/g, '').toLowerCase();
    
    // Normalize first line (Title)
    if (isFirstLine && trimmed.length > 0) {
      isFirstLine = false;
      if (!trimmed.startsWith('#')) {
        normalizedLines.push(`# ${trimmed}`);
        continue;
      }
    }
    
    // Heading mapping rules
    if (cleanLower === 'identity') {
      normalizedLines.push('## Identity');
    } else if (cleanLower === 'core responsibilities') {
      normalizedLines.push('## Core Responsibilities');
    } else if (
      cleanLower === 'methodology' || 
      cleanLower === 'review methodology' || 
      cleanLower === 'research methodology' || 
      cleanLower === 'knowledge methodology' ||
      cleanLower === 'engineering methodology' ||
      cleanLower === 'optimization methodology' ||
      cleanLower === 'curation methodology' ||
      cleanLower === 'execution methodology' ||
      cleanLower === 'engineering workflow' ||
      cleanLower === 'optimization framework' ||
      cleanLower === 'product development framework' ||
      cleanLower === 'security review framework' ||
      cleanLower === 'education design framework' ||
      cleanLower === 'growth framework'
    ) {
      normalizedLines.push('## Methodology');
    } else if (
      cleanLower === 'principles' || 
      cleanLower === 'startup principles' || 
      cleanLower === 'research principles' || 
      cleanLower === 'organizational principles' ||
      cleanLower === 'engineering principles' ||
      cleanLower === 'security principles' ||
      cleanLower === 'optimization principles' ||
      cleanLower === 'execution principles' ||
      cleanLower === 'process principles' ||
      cleanLower === 'product principles' ||
      cleanLower === 'strategic principles' ||
      cleanLower === 'curriculum principles' ||
      cleanLower === 'growth principles'
    ) {
      normalizedLines.push('## Principles');
    } else if (cleanLower === 'output format') {
      normalizedLines.push('## Output Format');
    } else if (cleanLower === 'jbk brain awareness' || cleanLower === 'jbk brain awareness policy') {
      normalizedLines.push('## JBK Brain Awareness');
    } else {
      normalizedLines.push(line);
    }
  }
  
  return normalizedLines.join('\n');
}

async function run() {
  console.log(`Normalizing skill files in: ${SKILLS_DIR}\n`);
  
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error('Skills directory does not exist!');
    return;
  }
  
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries.filter(e => e.isDirectory());
  
  for (const dir of skillDirs) {
    const skillName = dir.name;
    const skillPath = path.join(SKILLS_DIR, skillName);
    const skillFilePath = path.join(skillPath, 'SKILL.md');
    
    if (fs.existsSync(skillFilePath)) {
      console.log(`Normalizing: ${skillName}/SKILL.md`);
      const originalContent = fs.readFileSync(skillFilePath, 'utf8');
      
      const normalizedContent = normalizeContent(originalContent, skillName);
      
      fs.writeFileSync(skillFilePath, normalizedContent, 'utf8');
    }
  }
  
  console.log('\nNormalization completed successfully!');
}

run().catch(console.error);
