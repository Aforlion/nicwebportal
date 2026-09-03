import os
import re
import json
import pypdf

cpd_dir = r'C:\Users\aforl\Desktop\NIC Portal\nicwebportal\Courses\CDP'

def clean_title(fname):
    name = fname.replace("NIC_CPD_", "").replace("Micro-Credential_", "").replace(".md.pdf", "").replace(".pdf", "")
    name = name.replace("_FINAL", "").replace("_Curriculum", "").replace("_", " ")
    return name.strip()

files = [f for f in sorted(os.listdir(cpd_dir)) if f.endswith('.pdf') and "(1)" not in f]

courses = []

for idx, fname in enumerate(files):
    fpath = os.path.join(cpd_dir, fname)
    reader = pypdf.PdfReader(fpath)
    
    clean_name = clean_title(fname)
    full_title = f"NIC CPD Micro-Credential: {clean_name}"
    slug = "cpd-" + re.sub(r'[^a-z0-9]+', '-', clean_name.lower()).strip('-')
    
    # Classify Tier & Pricing & Points
    lower = clean_name.lower()
    if any(k in lower for k in ['phlebotomy', 'first aid', 'wound care', 'palliative']):
        cpd_points = 12 if 'phlebotomy' in lower else (10 if 'palliative' in lower or 'first aid' in lower else 8)
        price_ngn = 27500
        member_price_ngn = 17500
        tier = "Tier 3: Advanced Clinical"
        duration_hours = 8
        level = "Level 3: Advanced"
    elif any(k in lower for k in ['dementia', 'adl', 'catheter', 'diabetes', 'mental health']):
        cpd_points = 10 if 'dementia' in lower or 'adl' in lower else 8
        price_ngn = 20000
        member_price_ngn = 12500
        tier = "Tier 2: Specialized Care"
        duration_hours = 6
        level = "Level 2: Specialized"
    else:
        cpd_points = 5
        price_ngn = 12500
        member_price_ngn = 7500
        tier = "Tier 1: Essential Standards"
        duration_hours = 5
        level = "Level 1: Core Standard"

    # Extract text from first 4 pages for description
    desc_text = ""
    for p in range(min(4, len(reader.pages))):
        page_t = reader.pages[p].extract_text()
        desc_text += page_t + "\n"
        
    # Sanitize text
    desc_clean = re.sub(r'Author:\s*Manus\s*AI', '', desc_text, flags=re.IGNORECASE)
    desc_clean = re.sub(r'Manus\s*AI', '', desc_clean, flags=re.IGNORECASE)
    desc_clean = re.sub(r'Version:\s*[\d\.]+\s*\|\s*Prepared:[^\n]+', '', desc_clean, flags=re.IGNORECASE)
    desc_clean = re.sub(r'Prepared by:[^\n]*', '', desc_clean, flags=re.IGNORECASE)
    desc_clean = re.sub(r'Document status:[^\n]*', '', desc_clean, flags=re.IGNORECASE)
    desc_clean = re.sub(r'Publication note:[^\n]*', '', desc_clean, flags=re.IGNORECASE)
    
    # Extract Course Overview paragraph
    ov_match = re.search(r'2\.\s*Course\s*overview\s*\n?([\s\S]{100,600}?)(?=\n3\.|\nStrategic|\nTarget)', desc_clean)
    overview = ov_match.group(1).strip() if ov_match else f"Comprehensive Continuing Professional Development (CPD) micro-credential on {clean_name} for professional caregivers in Nigeria."
    overview = re.sub(r'\s+', ' ', overview)

    courses.append({
        "sort_order": idx + 1,
        "title": full_title,
        "short_title": clean_name,
        "slug": slug,
        "tier": tier,
        "level": level,
        "cpd_points": cpd_points,
        "duration_hours": duration_hours,
        "price_ngn": price_ngn,
        "member_price_ngn": member_price_ngn,
        "description": overview,
        "filename": fname,
        "pages_count": len(reader.pages)
    })

with open("src/data/cpd_courses.json", "w", encoding="utf-8") as f:
    json.dump(courses, f, indent=2)

print(f"Successfully processed {len(courses)} clean CPD courses into src/data/cpd_courses.json")
