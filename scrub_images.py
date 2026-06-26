import json
import glob
from bs4 import BeautifulSoup

files = glob.glob('data/slrclub/*.json')
count = 0

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        modified = False
        
        if 'critique_html' in data:
            old_html = data['critique_html']
            soup = BeautifulSoup(old_html, 'html.parser')
            
            # Remove img, embed, iframe, map, area
            tags_removed = 0
            for tag in soup.find_all(['img', 'embed', 'iframe', 'map', 'area']):
                tag.decompose()
                tags_removed += 1
                
            if tags_removed > 0:
                data['critique_html'] = str(soup)
                modified = True
                print(f"Removed {tags_removed} tags from {f}")
                
        if modified:
            with open(f, 'w', encoding='utf-8') as file:
                json.dump(data, file, ensure_ascii=False, indent=2)
            count += 1
            
    except Exception as e:
        print(f"Error processing {f}: {e}")

print(f"Cleaned {count} files")
