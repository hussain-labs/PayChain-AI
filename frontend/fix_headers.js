import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

const targetHeaderActionsRegex = /<div className="header-actions">[\s\S]*?(?=<\/header>)/;

const desiredHeaderActions = `<div className="header-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
              <i className={\`bx \${theme === 'dark' ? 'bx-sun' : 'bx-moon'}\`} />
            </button>
            <button className="icon-btn"><i className='bx bx-bell' /></button>
            <div className="user-profile" style={{ position: 'relative' }}>
              <img src={user?.avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(user?.name || 'U')}&background=4B1D8F&color=fff\`} alt="User" />
              {(user?.plan === 'pro' || user?.plan === 'pro_plus') && (
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px', 
                  background: 'linear-gradient(45deg, #f59e0b, #fbbf24)', 
                  color: '#fff', fontSize: '0.6rem', fontWeight: 800, 
                  padding: '2px 6px', borderRadius: '10px', 
                  border: '2px solid var(--surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {user.plan === 'pro_plus' ? 'PRO+' : 'PRO'}
                </div>
              )}
            </div>
          </div>
        `;

files.forEach(file => {
  if (['Login.jsx', 'Register.jsx', 'Home.jsx', 'About.jsx'].includes(file)) return;
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('<header className="dashboard-header">')) {
    // Check if useTheme is imported
    if (!content.includes('useTheme')) {
        content = `import { useTheme } from '../context/ThemeContext';\n` + content;
    }
    // Check if toggleTheme is destructured
    if (!content.includes('toggleTheme')) {
        content = content.replace(/(const \[user,)/, 'const { theme, toggleTheme } = useTheme();\n  $1');
        // Handle cases where user state doesn't exist or is formatted differently
        if (!content.includes('const { theme, toggleTheme }')) {
             content = content.replace(/(const.*?=.*?useNavigate.*?;)/, '$1\n  const { theme, toggleTheme } = useTheme();');
        }
    }

    content = content.replace(targetHeaderActionsRegex, desiredHeaderActions);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
