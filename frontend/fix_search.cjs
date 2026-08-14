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

  const oldSearchRegex = /const token = import\.meta\.env\.VITE_MAPBOX_TOKEN;\s*const bbox = '119\.35,-5\.35,119\.55,-5\.05';\s*const response = await fetch\(`https:\/\/api\.mapbox\.com\/geocoding\/v5\/mapbox\.places\/\$\{encodeURIComponent\(query\)\}\.json\?country=id&bbox=\$\{bbox\}&access_token=\$\{token\}`\);\s*if \(response\.ok\) \{\s*const data = await response\.json\(\);\s*if \(data && data\.features\) \{\s*setSearchResults\(data\.features\);\s*\}\s*\}/g;

  const newSearch = `const response = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query)}&addressdetails=1&limit=5&viewbox=119.30,-5.00,119.55,-5.30&bounded=1&email=handygo-app@example.com\`);
          if (response.ok) {
            const data = await response.json();
            const formatted = data.map(item => {
               const nameParts = item.display_name.split(', ');
               const name = item.name || (item.address && item.address.road) || nameParts[0];
               return {
                 text: name,
                 place_name: item.display_name,
                 center: [parseFloat(item.lon), parseFloat(item.lat)]
               }
            });
            setSearchResults(formatted);
          }`;

  if (content.match(oldSearchRegex)) {
    content = content.replace(oldSearchRegex, newSearch);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Could not match oldSearchRegex in ${file}`);
  }
}
