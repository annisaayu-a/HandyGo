const fs = require('fs');
const path = require('path');

const mapFiles = [
  'CleaningMap.jsx',
  'DeliveryMap.jsx',
  'RepairMap.jsx',
  'ShoppingMap.jsx',
  'TransportMap.jsx'
];

const dir = path.join(__dirname, 'src', 'pages', 'Customer');

const useEffectSearch = /fetch\(`https:\/\/nominatim\.openstreetmap\.org\/reverse\?format=json&lat=\$\{defaultPosition\[0\]\}&lon=\$\{defaultPosition\[1\]\}&zoom=18&addressdetails=1&email=handygo-app@example\.com`\)\s*\n\s*\.then\(res => res\.json\(\)\)\s*\n\s*\.then\(data => \{\s*\n\s*if\(data && data\.display_name\) \{\s*\n\s*const nameParts = data\.display_name\.split\(', '\);\s*\n\s*const name = data\.name \|\| \(data\.address && data\.address\.road\) \|\| nameParts\[0\];\s*\n\s*setCurrentAddress\(prev => \(\{ \.\.\.prev, name: name, address: data\.display_name \}\)\);\s*\n\s*\}\s*\n\s*\}\)\.catch\(console\.error\);/s;

const useEffectReplace = `const token = import.meta.env.VITE_MAPBOX_TOKEN;
    fetch(\`https://api.mapbox.com/geocoding/v5/mapbox.places/\${defaultPosition[1]},\${defaultPosition[0]}.json?access_token=\${token}\`)
      .then(res => res.json())
      .then(data => {
        if(data && data.features && data.features.length > 0) {
          const result = data.features[0];
          setCurrentAddress(prev => ({ ...prev, name: result.text, address: result.place_name }));
        }
      }).catch(console.error);`;


const moveEndSearch = /const response = await fetch\(`https:\/\/nominatim\.openstreetmap\.org\/reverse\?format=json&lat=\$\{lat\}&lon=\$\{lng\}&zoom=18&addressdetails=1&email=handygo-app@example\.com`\);\s*\n\s*if \(\!response\.ok\) \{\s*\n\s*if \(response\.status === 429 \|\| response\.status === 403\) \{\s*\n\s*setCurrentAddress\(\{ name: 'Terlalu banyak klik', address: 'Sistem peta membatasi akses sementara\. Mohon tunggu 1-2 menit\.', lat, lng \}\);\s*\n\s*\} else \{\s*\n\s*setCurrentAddress\(\{ name: 'Gagal memuat', address: 'Layanan peta sedang gangguan', lat, lng \}\);\s*\n\s*\}\s*\n\s*return;\s*\n\s*\}\s*\n\s*const data = await response\.json\(\);\s*\n\s*if \(data && data\.display_name\) \{\s*\n\s*const nameParts = data\.display_name\.split\(', '\);\s*\n\s*const name = data\.name \|\| \(data\.address && data\.address\.road\) \|\| nameParts\[0\];\s*\n\s*setCurrentAddress\(\{\s*\n\s*name: name,\s*\n\s*address: data\.display_name,\s*\n\s*lat,\s*\n\s*lng\s*\n\s*\}\);\s*\n\s*\} else \{\s*\n\s*setCurrentAddress\(\{ name: 'Lokasi tidak dikenal', address: 'Tidak dapat menemukan alamat di titik ini', lat, lng \}\);\s*\n\s*\}/s;

const moveEndReplace = `const token = import.meta.env.VITE_MAPBOX_TOKEN;
        const response = await fetch(\`https://api.mapbox.com/geocoding/v5/mapbox.places/\${lng},\${lat}.json?access_token=\${token}\`);
        
        if (!response.ok) {
          setCurrentAddress({ name: 'Gagal memuat', address: 'Layanan peta sedang gangguan', lat, lng });
          return;
        }

        const data = await response.json();
        
        if (data && data.features && data.features.length > 0) {
          const result = data.features[0];
          setCurrentAddress({
            name: result.text,
            address: result.place_name,
            lat,
            lng
          });
        } else {
          setCurrentAddress({ name: 'Lokasi tidak dikenal', address: 'Tidak dapat menemukan alamat di titik ini', lat, lng });
        }`;

for (const file of mapFiles) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(useEffectSearch, useEffectReplace);
  content = content.replace(moveEndSearch, moveEndReplace);
  fs.writeFileSync(filePath, content);
  console.log('Updated', file);
}
