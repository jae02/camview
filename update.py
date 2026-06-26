import json
import os

with open('data/slrclub/updated_texts.json', 'r', encoding='utf-8') as f:
    texts = json.load(f)

for filename, clean_text in texts.items():
    filepath = os.path.join('data', 'slrclub', filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        data['critique_text'] = clean_text
        if 'critique_html' in data:
            del data['critique_html']
            
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
