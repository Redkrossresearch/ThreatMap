import os
import glob

frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')
tsx_files = glob.glob(os.path.join(frontend_dir, '**', '*.tsx'), recursive=True)

for file_path in tsx_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace('http://127.0.0.1:8000', '/_/backend')
    new_content = new_content.replace('http://localhost:8000', '/_/backend')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

print("Done URL replacement.")
