import re
import os

path = r'C:\Users\aforl\.gemini\antigravity-ide\brain\a7f87e76-9b5a-44eb-910b-1b73708cbc1d\.system_generated\steps\475\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

print('Length of content.md:', len(text))
matches = re.findall(r'"([^"]{15,300})"', text)
keywords = ['module', 'caregiver', 'curriculum', 'patient', 'health', 'level', 'training', 'nursing', 'hygiene', 'safety', 'ethics', 'dmia']
found = [m for m in matches if any(k in m.lower() for k in keywords) and 'http' not in m and 'function' not in m]
print(f'Found {len(found)} candidate phrases:')
for item in found[:30]:
    print('-', item)
