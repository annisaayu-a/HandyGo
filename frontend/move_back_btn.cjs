const fs = require('fs');
const path = require('path');

const mapFiles = [
  'CleaningMap.jsx',
  'DeliveryMap.jsx',
  'RepairMap.jsx',
  'ShoppingMap.jsx',
  'TransportMap.jsx',
  'Location.jsx'
];

const dir = path.join(__dirname, 'src', 'pages', 'Customer');

for (const file of mapFiles) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Remove the back button from map-floating-header
  const backBtnRegex = /\s*\{\/\*\s*Back Button\s*\*\/\}\s*<button\s+className="map-back-btn"\s+onClick=\{[^}]+\}\s*>\s*<ArrowLeft[^>]+>\s*<\/button>/g;
  
  if (content.match(backBtnRegex)) {
    content = content.replace(backBtnRegex, '');
    changed = true;
  }

  // 2. Insert the back button into bottom-sheet
  const bottomSheetRegex = /(<div className="(?:bottom-sheet|location-bottom-sheet)"[^>]*>)/;
  
  const backBtnInsert = `$1\n        {/* Floating Back Button */}\n        <button \n          className="map-back-btn floating-back-btn" \n          onClick={() => navigate(-1)}\n        >\n          <ArrowLeft size={24} color="#1e293b" />\n        </button>`;

  if (changed && content.match(bottomSheetRegex)) {
    // Only replace the first match
    content = content.replace(bottomSheetRegex, backBtnInsert);
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
