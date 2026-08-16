const fs = require('fs');

const FILES = [
  'frontend/src/pages/Customer/RepairMap.jsx',
  'frontend/src/pages/Customer/CleaningMap.jsx',
  'frontend/src/pages/Customer/ShoppingMap.jsx',
  'frontend/src/pages/Customer/TransportMap.jsx',
  'frontend/src/pages/Customer/DeliveryMap.jsx',
  'frontend/src/pages/Customer/Location.jsx'
];

FILES.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if we already moved it by looking for bottom: 'calc(100% + 16px)'
  if (content.includes("bottom: 'calc(100% + 16px)'") && content.includes("right: '16px'")) {
    console.log(`⏭️ Already moved in: ${filePath}`);
    return;
  }

  // Define the old GPS button block to match and replace
  // Since formatting might vary, we'll try to match it using Regex
  
  const gpsBlockRegex = /\s*\{\/\* GPS Fetch Location Button \*\/\}\s*<button[\s\S]*?<\/button>\s*/;
  
  const match = content.match(gpsBlockRegex);
  if (!match) {
    console.log(`❌ GPS button not found in: ${filePath}`);
    return;
  }
  
  let gpsButtonCode = match[0];
  
  // Remove GPS button from its current place
  content = content.replace(gpsBlockRegex, '\n');
  
  // Update the bottom CSS value in the button string
  gpsButtonCode = gpsButtonCode.replace(/bottom:\s*['"]calc\(50% \+ 80px\)['"]/, "bottom: 'calc(100% + 16px)'");
  
  // Find injection point: just before or after the floating back button inside bottom-sheet
  // We'll inject it inside the <div className="bottom-sheet" ...>
  
  const injectionMarker = '{/* Floating Back Button */}';
  if (!content.includes(injectionMarker)) {
    console.log(`❌ Bottom sheet marker not found in: ${filePath}`);
    return;
  }
  
  content = content.replace(injectionMarker, gpsButtonCode + '        ' + injectionMarker);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Moved GPS button in: ${filePath}`);
});

console.log('Done.');
