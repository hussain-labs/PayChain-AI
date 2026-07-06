import re

with open('index.css', 'r') as f:
    content = f.read()

# Update .navbar padding
content = re.sub(r'(\.navbar\s*\{[^}]*?padding:\s*)1\.5rem(\s*0;)', r'\g<1>0.75rem\g<2>', content)
content = re.sub(r'(\.navbar\.scrolled\s*\{[^}]*?padding:\s*)1rem(\s*0;)', r'\g<1>0.5rem\g<2>', content)

# Update .dashboard-header padding
# Target:
# padding: 1.5rem 3rem; -> padding: 0.75rem 3rem;
# padding: 1rem; -> padding: 0.75rem;

content = re.sub(r'(\.dashboard-header\s*\{[^}]*?padding:\s*)1\.5rem\s+3rem(;)', r'\g<1>0.75rem 3rem\g<2>', content)
content = re.sub(r'(\.dashboard-header\s*\{[^}]*?padding:\s*)1rem(;)', r'\g<1>0.75rem\g<2>', content)

with open('index.css', 'w') as f:
    f.write(content)

