const fs = require('fs');
const path = require('path');

const targetStr = `<div className="user-profile" style={{ position: 'relative' }}>
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
            </div>`;

const files = [
  'src/pages/Cards.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Settings.jsx',
  'src/pages/Statistics.jsx',
  'src/pages/Support.jsx',
  'src/pages/Transfers.jsx',
  'src/pages/Upgrade.jsx',
  'src/pages/admin/AdminSupport.jsx',
  'src/pages/admin/AdminUsers.jsx',
  'src/pages/WalletOverview.jsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the profile block
  if (content.includes('className="user-profile"')) {
    // Regex to match the block more flexibly
    const regex = /<div className="user-profile".*?<\/div>\s*<\/div>/s;
    content = content.replace(targetStr, '<UserProfilePopup user={user} />');
    
    // Fallback if exact string replacement fails
    if (!content.includes('<UserProfilePopup user={user} />')) {
        console.log("Fallback regex for: " + file);
        content = content.replace(/<div className="user-profile" style={{ position: 'relative' }}>[\s\S]*?<\/div>\s*<\/div>/, '<UserProfilePopup user={user} />\n            </div>');
    }
  }

  // Add the import if not present
  if (!content.includes('UserProfilePopup')) {
    const depth = file.split('/').length - 2;
    const importPath = depth > 1 ? '../'.repeat(depth) + 'components/UserProfilePopup' : '../components/UserProfilePopup';
    content = `import UserProfilePopup from '${importPath}';\n` + content;
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
