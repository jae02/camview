import json
import sys

def main():
    file_path = sys.argv[1]
    summary_path = sys.argv[2]
    
    with open(summary_path, 'r', encoding='utf-8') as f:
        summary = f.read()

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data['critique_summary'] = summary
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Updated {file_path}")

if __name__ == '__main__':
    main()
