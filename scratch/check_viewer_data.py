import re

path = r'C:\Users\aforl\.gemini\antigravity-ide\brain\a7f87e76-9b5a-44eb-910b-1b73708cbc1d\.system_generated\steps\475\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('window.viewerData')
if idx != -1:
    snippet = text[idx:idx+3000]
    print("ViewerData snippet:\n", snippet)
else:
    print("Not found")
