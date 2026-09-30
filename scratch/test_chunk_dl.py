import urllib.request
import os

url = 'https://drive.google.com/uc?export=download&id=1sjthRT4VI0399YdqhngdwYhAsrYx2x1_'
pdf_path = os.path.join('scratch', 'DMIA_Curriculum_Level_1.pdf')

print("Fetching with chunked reading...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=20) as resp, open(pdf_path, 'wb') as out_f:
    total = 0
    while True:
        chunk = resp.read(64 * 1024)
        if not chunk:
            break
        out_f.write(chunk)
        total += len(chunk)
        print(f"Read {total} bytes...")

print(f"Done! Total: {total} bytes written to {pdf_path}")
