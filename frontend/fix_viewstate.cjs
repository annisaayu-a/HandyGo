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
  
  // Update viewState destructuring
  content = content.replace(
    /const \{ lng, lat \} = e\.viewState;/g,
    'const { longitude: lng, latitude: lat } = e.viewState;'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
