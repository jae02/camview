import json
import sys
import re

def strip_html(text):
    return re.sub('<[^<]+>', '', text)

def main():
    file_path = sys.argv[1]
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    text = data.get('critique_text', '')
    if not text:
        html = data.get('critique_html', '')
        text = strip_html(html)
    
    print(f"---TEXT_START---\n{text}\n---TEXT_END---")

if __name__ == '__main__':
    main()
