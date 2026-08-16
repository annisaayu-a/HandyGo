const fs = require('fs');

const FILES = [
  'frontend/src/pages/Customer/RepairMap.jsx',
  'frontend/src/pages/Customer/CleaningMap.jsx',
  'frontend/src/pages/Customer/ShoppingMap.jsx',
  'frontend/src/pages/Customer/TransportMap.jsx',
  'frontend/src/pages/Customer/DeliveryMap.jsx',
  'frontend/src/pages/Customer/Location.jsx'
];

const oldNormalSvgRegex = /<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#034078" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">\s*<circle cx="12" cy="12" r="3"\/>\s*<path d="M12 2v3M12 19v3M2 12h3M19 12h3"\/>\s*<circle cx="12" cy="12" r="8" opacity="0\.2" fill="#034078"\/>\s*<\/svg>/g;

const oldLoadingSvgRegex = /<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#034078" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>/g;

const newNormalSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2.5" fill="#3b82f6"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>`;

const newLoadingSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>`;


let successCount = 0;

FILES.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    
    if (oldNormalSvgRegex.test(content)) {
      content = content.replace(oldNormalSvgRegex, newNormalSvg);
      modified = true;
    }
    
    if (oldLoadingSvgRegex.test(content)) {
      content = content.replace(oldLoadingSvgRegex, newLoadingSvg);
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Patched icon in: ${filePath}`);
      successCount++;
    } else {
      console.log(`⏭️ No match found or already patched in: ${filePath}`);
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log(`\nDone. ${successCount} files updated.`);
