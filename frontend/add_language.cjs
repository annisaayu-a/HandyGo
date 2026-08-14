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
  
  // Update reverse geocoding to include language=id
  content = content.replace(
    /\.json\?access_token=\$\{token\}/g,
    '.json?access_token=${token}&language=id'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
