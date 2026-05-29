#!/usr/bin/env python3
"""
Extract unique camera slugs from the saved timeline HTML.
"""
import json
import re
from pathlib import Path

html_file = Path(__file__).resolve().parent.parent / "data" / "cameradecision_reviews" / "_timeline_debug.html"
output_file = Path(__file__).resolve().parent.parent / "data" / "cameradecision_reviews" / "_all_slugs.json"

with open(html_file, "r", encoding="utf-8") as f:
    html = f.read()

# Extract all unique slugs from review URLs
pattern = re.compile(r'https://cameradecision\.com/review/([A-Za-z0-9\-]+)')
all_matches = pattern.findall(html)

seen = set()
cameras = []
for slug in all_matches:
    if slug in seen:
        continue
    if slug.lower() in ("compare", "best", "worst", "top", "all"):
        continue
    seen.add(slug)
    
    # Parse brand and name from slug
    parts = slug.split("-")
    brand_part = parts[0]
    brand_map = {
        "Canon": "Canon", "Sony": "Sony", "Nikon": "Nikon",
        "Fujifilm": "Fujifilm", "Panasonic": "Panasonic",
        "Olympus": "Olympus", "Leica": "Leica", "Pentax": "Pentax",
        "Ricoh": "Ricoh", "Sigma": "Sigma", "Hasselblad": "Hasselblad",
        "OM": "OM System", "GoPro": "GoPro", "DJI": "DJI",
        "Samsung": "Samsung", "Kodak": "Kodak", "Phase": "Phase One",
    }
    brand = brand_map.get(brand_part, brand_part)
    
    # Reconstruct name from slug
    name = slug.replace("-", " ")
    
    cameras.append({
        "slug": slug,
        "name": name,
        "brand": brand,
        "review_url": f"https://cameradecision.com/review/{slug}",
    })

# Save
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(cameras, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(cameras)} unique camera slugs")

# Print brand breakdown
brands = {}
for cam in cameras:
    b = cam["brand"]
    brands[b] = brands.get(b, 0) + 1

print("\nBrand breakdown:")
for brand, count in sorted(brands.items(), key=lambda x: -x[1]):
    print(f"  {brand}: {count}")
