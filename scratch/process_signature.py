from PIL import Image

def process_signature(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        r, g, b, a = item
        # Calculate brightness / threshold
        brightness = (r + g + b) / 3.0

        # If background is bright (white/off-white background), make transparent
        if r > 190 and g > 190 and b > 190:
            new_data.append((255, 255, 255, 0))
        else:
            # Signature ink: make dark navy/midnight blue (#0f172a) for crisp official contrast
            # Calculate alpha based on ink dark intensity
            alpha = int(max(0, 255 - brightness * 1.1))
            new_data.append((15, 23, 42, min(255, alpha * 2 + 50)))

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Processed signature saved to {output_path}")

process_signature("public/signature.jpg", "public/signature.png")
