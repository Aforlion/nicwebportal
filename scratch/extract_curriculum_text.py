import urllib.request
import pypdf
import os

url = 'https://drive.google.com/uc?export=download&id=1sjthRT4VI0399YdqhngdwYhAsrYx2x1_'
pdf_path = os.path.join('scratch', 'DMIA_Curriculum_Level_1.pdf')
txt_path = os.path.join('scratch', 'DMIA_Curriculum_Level_1.txt')

print("Downloading PDF from Google Drive...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp, open(pdf_path, 'wb') as out_f:
    out_f.write(resp.read())

file_size = os.path.getsize(pdf_path)
print(f"Downloaded PDF size: {file_size} bytes")

print("Extracting text with pypdf...")
reader = pypdf.PdfReader(pdf_path)
print(f"Total Pages: {len(reader.pages)}")

all_text = []
for i, page in enumerate(reader.pages):
    page_text = page.extract_text() or ""
    all_text.append(f"\n--- PAGE {i+1} ---\n{page_text}")

with open(txt_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(all_text))

print(f"Text successfully extracted to {txt_path} ({len(all_text)} pages processed)")
