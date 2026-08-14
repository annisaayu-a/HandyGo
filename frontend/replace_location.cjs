const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Customer', 'Location.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const moveEndSearch = /const response = await fetch\(`https:\/\/nominatim\.openstreetmap\.org\/reverse\?format=json&lat=\$\{center\.lat\}&lon=\$\{center\.lng\}&zoom=18&addressdetails=1&email=handygo-app@example\.com`\);\s*\n\s*if \(\!response\.ok\) \{\s*\n\s*setAddress\('Gagal memuat alamat'\);\s*\n\s*return;\s*\n\s*\}\s*\n\s*const data = await response\.json\(\);\s*\n\s*if \(data && data\.display_name\) \{\s*\n\s*setAddress\(data\.display_name\);\s*\n\s*\} else \{\s*\n\s*setAddress\('Lokasi tidak dikenal'\);\s*\n\s*\}/s;

const moveEndReplace = `const token = import.meta.env.VITE_MAPBOX_TOKEN;
        const response = await fetch(\`https://api.mapbox.com/geocoding/v5/mapbox.places/\${center.lng},\${center.lat}.json?access_token=\${token}\`);
        
        if (!response.ok) {
          setAddress('Gagal memuat alamat');
          return;
        }

        const data = await response.json();
        if (data && data.features && data.features.length > 0) {
          setAddress(data.features[0].place_name);
        } else {
          setAddress('Lokasi tidak dikenal');
        }`;

content = content.replace(moveEndSearch, moveEndReplace);
fs.writeFileSync(filePath, content);
console.log('Updated Location.jsx');
