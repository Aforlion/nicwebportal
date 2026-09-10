import pypdf

pdf_path = r'C:\Users\aforl\Desktop\NIC Portal\nicwebportal\Courses\CDP\NIC_CPD_Dementia_Care_Communication_Behaviour_Support.md.pdf'
reader = pypdf.PdfReader(pdf_path)

output_lines = [f"Total Pages: {len(reader.pages)}\n"]

for i in range(min(10, len(reader.pages))):
    output_lines.append(f"=== PAGE {i+1} ===")
    output_lines.append(reader.pages[i].extract_text())

with open("scratch/sample_cpd_text.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

print("Extracted first 10 pages to scratch/sample_cpd_text.txt")
