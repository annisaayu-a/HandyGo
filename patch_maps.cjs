const fs = require('fs');
const path = require('path');
const dir = 'frontend/src/pages/Customer';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Map.jsx') || f === 'Location.jsx' || f.endsWith('Location.jsx'));

files.forEach(f => {
  if (f === 'ShoppingMap.jsx') return; // already done

  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;

  // Fix handleMoveStart
  content = content.replace(/const handleMoveStart = \((.*?)\) => {/g, (match, args) => {
    changed = true;
    const argStr = args.trim() ? args : 'e';
    return `const handleMoveStart = (${argStr}) => {\n    if (!${argStr}?.originalEvent) return;`;
  });

  // If handleMoveStart had no args
  content = content.replace(/const handleMoveStart = \(\) => {/g, () => {
    changed = true;
    return `const handleMoveStart = (e) => {\n    if (!e?.originalEvent) return;`;
  });

  // Fix handleMoveEnd
  content = content.replace(/const handleMoveEnd = \((.*?)\) => {/g, (match, args) => {
    changed = true;
    const argStr = args.trim() ? args : 'e';
    return `const handleMoveEnd = (${argStr}) => {\n    if (!${argStr}?.originalEvent) return;`;
  });

  // Replace Mapbox geocoding with Nominatim inside handleMoveEnd timeout
  const mapboxRegex = /const token = import\.meta\.env\.VITE_MAPBOX_TOKEN;\s*const response = await fetch\(`https:\/\/api\.mapbox\.com\/geocoding\/v5\/mapbox\.places\/\$\{lng\},\$\{lat\}\.json\?access_token=\$\{token\}&language=id`\);\s*if \(!response\.ok\) \{/g;
  
  if (mapboxRegex.test(content)) {
    content = content.replace(mapboxRegex, 
      `const response = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&addressdetails=1&email=handygo-app@example.com\`);\n        \n        if (!response.ok) {`
    );

    const featureRegex = /if \(data && data\.features && data\.features\.length > 0\) \{\s*const result = data\.features\[0\];\s*setCurrentAddress\(\{[\s\S]*?name: result\.text,[\s\S]*?address: result\.place_name,/g;
    content = content.replace(featureRegex,
      `if (data && data.display_name) {\n          const nameParts = data.display_name.split(', ');\n          const name = data.name || (data.address && data.address.road) || nameParts[0];\n          setCurrentAddress({\n            name: name,\n            address: data.display_name,`
    );
  }

  if (changed) {
    fs.writeFileSync(p, content);
    console.log('Fixed ' + f);
  }
});
