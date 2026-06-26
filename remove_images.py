import json
import glob
import re

files = glob.glob('data/slrclub/*.json')
count = 0

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        data = json.load(file)
        
    modified = False
    
    if 'critique_html' in data and data['critique_html']:
        html = data['critique_html']
        new_html = re.sub(r'<img[^>]*>', '', html)
        if html != new_html:
            data['critique_html'] = new_html
            modified = True
            
    if 'downloaded_images' in data and data['downloaded_images']:
        data['downloaded_images'] = []
        modified = True
        
    if modified:
        with open(f, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=2)
        count += 1

print(f"Modified {count} files")
