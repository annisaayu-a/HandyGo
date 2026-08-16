const fs = require('fs');

const files = [
  'frontend/src/pages/Customer/Cleaning.css',
  'frontend/src/pages/Customer/DeliveryLocation.css',
  'frontend/src/pages/Customer/Location.css',
  'frontend/src/pages/Customer/Repair.css',
  'frontend/src/pages/Customer/ShoppingMap.css',
  'frontend/src/pages/Customer/ShoppingOrder.css'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('padding: 12px 0;') && content.includes('.location-input {')) {
        content = content.replace(/\.location-input \{/, '.location-input {\n  padding: 12px 0;');
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
  }
});
console.log('Done');
