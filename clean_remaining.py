import json
import re
from bs4 import BeautifulSoup

files_to_clean = [
    'data/slrclub/canon-eos-m6-mark-ii.json',
    'data/slrclub/canon-eos-r.json',
    'data/slrclub/canon-eos-r3.json',
    'data/slrclub/canon-eos-r5.json',
    'data/slrclub/review_829.json'
]

for filepath in files_to_clean:
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    if 'critique_html' not in data:
        continue
        
    html = data['critique_html']
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text(separator='\n')
    
    # Cleaning
    lines = text.split('\n')
    clean_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Ignore lines with garbage OCR
        if '”' in line or '~' in line or 'ig' in line or 'fs NAN' in line or 'DE NE' in line:
            # Only ignore if it doesn't have much korean
            korean_chars = len(re.findall(r'[가-힣]', line))
            if korean_chars < 5:
                continue
                
        # Stop at event strings
        if re.search(r'(이벤트기간|덧글을 남겨주신|당첨자 발표|경품 안내|응모 기간|이벤트 기간|참여방법|SLRCLUB.*이벤트)', line.replace(' ', '')):
            break
            
        clean_lines.append(line)
        
    # Extra cleanup for specific leftover garbage at the top/bottom
    final_text = '\n'.join(clean_lines)
    final_text = re.sub(r'총 평\n\*총 평 Critique\n*', '', final_text)
    final_text = re.sub(r'📷 이미지 분석 텍스트 \(OCR\)\n*', '', final_text)
    
    # Remove lines with less than 5 korean chars if they are at the end
    lines = final_text.split('\n')
    while lines and len(re.findall(r'[가-힣]', lines[-1])) < 5:
        lines.pop()
    
    while lines and len(re.findall(r'[가-힣]', lines[0])) < 5:
        lines.pop(0)
        
    data['critique_text'] = '\n'.join(lines)
    del data['critique_html']
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Cleaned {filepath}")
