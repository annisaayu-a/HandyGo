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

const mapTagSearch = /<Map\s*\n\s*ref=\{mapRef\}\s*\n\s*mapboxAccessToken=\{import\.meta\.env\.VITE_MAPBOX_TOKEN\}/g;

const mapTagReplace = `<Map
          ref={mapRef}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          maxBounds={[[119.30, -5.30], [119.55, -5.00]]}`;

for (const file of mapFiles) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('maxBounds')) {
    console.log(`maxBounds already in ${file}`);
    continue;
  }
  
  content = content.replace(mapTagSearch, mapTagReplace);
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
