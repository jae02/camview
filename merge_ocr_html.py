import json
import glob
import re

files = glob.glob('data/slrclub/*.json')
count = 0

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        modified = False
        
        ocr_text = data.get('critique_ocr_text', '')
        html = data.get('critique_html', '')
        
        if ocr_text:
            # Clean up the OCR text
            # Split by "--- OCR Image:" 
            sections = re.split(r'--- OCR Image: [^-]+ ---', ocr_text)
            
            clean_paragraphs = []
            for sec in sections:
                sec = sec.strip()
                if sec:
                    # Convert newlines to <br/> or wrap in <p>
                    # It's better to just use <p> for paragraphs
                    paragraphs = [p.strip() for p in sec.split('\n\n') if p.strip()]
                    for p in paragraphs:
                        # Replace single newlines inside paragraph with <br/>
                        p = p.replace('\n', '<br/>')
                        clean_paragraphs.append(f'<p style="margin-bottom: 1em; color: var(--text-primary); line-height: 1.6;">{p}</p>')
            
            if clean_paragraphs:
                # Merge into html
                merged_html = html + '\n<div class="merged-ocr-content" style="margin-top: 40px; padding-top: 20px; border-top: 2px dashed var(--border-color);">'
                merged_html += '\n<h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 1rem; color: var(--brand-primary);">📷 이미지 분석 텍스트 (OCR)</h3>\n'
                merged_html += '\n'.join(clean_paragraphs)
                merged_html += '\n</div>'
                
                data['critique_html'] = merged_html
                del data['critique_ocr_text'] # Remove the original to signify it's merged
                modified = True
                
        if modified:
            with open(f, 'w', encoding='utf-8') as file:
                json.dump(data, file, ensure_ascii=False, indent=2)
            count += 1
            
    except Exception as e:
        print(f"Error processing {f}: {e}")

print(f"Merged OCR text in {count} files")
