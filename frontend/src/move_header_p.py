import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find <header className="dashboard-header"...> ... </header>
    # This might be tricky if there are nested elements.
    # Instead, let's find the exact block:
    # <div className="header-greeting">
    #   <h1>...</h1>
    #   <p>...</p>
    # </div>
    # And we know it's inside <header ...> ... </header>
    # We want to move the <p>...</p> to immediately after </header>
    
    # We can use a state machine or regex.
    # Let's find </header> first, but there could be multiple. Usually only one per page.
    if '</header>' not in content:
        return

    # Find the p tag inside header-greeting
    pattern = re.compile(r'(<div className="header-greeting"[^>]*>\s*<h1[^>]*>.*?</h1>\s*)(<p[^>]*>.*?</p>)(\s*</div>)', re.DOTALL)
    
    match = pattern.search(content)
    if not match:
        return
        
    p_tag_content = match.group(2)
    
    # Remove p tag from header-greeting
    new_content = pattern.sub(r'\1\3', content)
    
    # Insert p tag after </header>
    # Wrap it in a div for styling
    replacement = f'</header>\n\n          <div className="page-header-description" style={{ margin: "-1rem 0 2rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>\n            {p_tag_content}\n          </div>'
    new_content = new_content.replace('</header>', replacement, 1)

    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Updated {filepath}")

search_dir = '/home/muzamil-hussain/Desktop/PAYCHAIN/PayChain-AI/frontend/src/pages'
for root, _, files in os.walk(search_dir):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

