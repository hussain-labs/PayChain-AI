import os

search_dir = '/home/muzamil-hussain/Desktop/PAYCHAIN/PayChain-AI/frontend/src/pages'
for root, _, files in os.walk(search_dir):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Fix the broken style prop
            new_content = content.replace(
                'style={ margin: "-1rem 0 2rem 0", color: "var(--text-muted)", padding: "0 1rem" }',
                'style={{ margin: "-1rem 0 2rem 0", color: "var(--text-muted)", padding: "0 1rem" }}'
            )
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")

