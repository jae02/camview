import json
import glob
import re

files = glob.glob('data/slrclub/*.json')
count = 0

def clean_html(html):
    if not html: return html
    idx = html.find('당첨자 발표')
    if idx == -1:
        idx = html.find('댓글 이벤트')
    
    if idx != -1:
        # Find the preceding div to cleanly cut the section if possible
        div_idx = html.rfind('<div', 0, idx)
        if div_idx != -1 and (idx - div_idx) < 200:
            return html[:div_idx].strip()
        else:
            # Fallback to cutting at the preceding line break or paragraph
            br_idx = max(html.rfind('<br', 0, idx), html.rfind('<p', 0, idx))
            if br_idx != -1 and (idx - br_idx) < 200:
                return html[:br_idx].strip()
            return html[:idx].strip()
    return html

def clean_text(text):
    if not text: return text
    keywords = ['당첨자 발표', '댓글 이벤트', '이벤트 기간', '이벤트 당첨자']
    min_idx = len(text)
    for kw in keywords:
        idx = text.find(kw)
        if idx != -1 and idx < min_idx:
            min_idx = idx
            
    if min_idx < len(text):
        # Go back a bit to the previous newline
        nl_idx = text.rfind('\n', 0, min_idx)
        if nl_idx != -1:
            return text[:nl_idx].strip()
        return text[:min_idx].strip()
    return text

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        modified = False
        
        if 'critique_html' in data:
            old_val = data['critique_html']
            new_val = clean_html(old_val)
            if old_val != new_val:
                data['critique_html'] = new_val
                modified = True
                
        if 'critique_text' in data:
            old_val = data['critique_text']
            new_val = clean_text(old_val)
            if old_val != new_val:
                data['critique_text'] = new_val
                modified = True
                
        if 'critique_ocr_text' in data:
            old_val = data['critique_ocr_text']
            new_val = clean_text(old_val)
            if old_val != new_val:
                data['critique_ocr_text'] = new_val
                modified = True
                
        if modified:
            with open(f, 'w', encoding='utf-8') as file:
                json.dump(data, file, ensure_ascii=False, indent=2)
            count += 1
    except Exception as e:
        print(f"Error processing {f}: {e}")

print(f"Modified {count} files")
