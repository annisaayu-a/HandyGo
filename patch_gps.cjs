const fs = require('fs');

const FILES = [
  'frontend/src/pages/Customer/CleaningMap.jsx',
  'frontend/src/pages/Customer/ShoppingMap.jsx',
  'frontend/src/pages/Customer/TransportMap.jsx',
  'frontend/src/pages/Customer/DeliveryMap.jsx',
];

const REVERSE_GEOCODE_FN = `
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        \`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&addressdetails=1&email=handygo-app@example.com\`
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.display_name) {
        const nameParts = data.display_name.split(', ');
        const name = data.name || (data.address && data.address.road) || nameParts[0];
        return { name, address: data.display_name, lat, lng };
      }
    } catch (e) { console.error(e); }
    return null;
  };

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur Lokasi saat ini.');
      return;
    }
    setIsFetchingLocation(true);
    setCurrentAddress(prev => ({ ...prev, name: 'Mendapatkan lokasi...', address: '' }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 17, duration: 1200 });
        const result = await reverseGeocode(lat, lng);
        if (result) {
          setCurrentAddress(result);
        } else {
          setCurrentAddress({ name: 'Lokasi Anda', address: \`\${lat.toFixed(5)}, \${lng.toFixed(5)}\`, lat, lng });
        }
        setIsFetchingLocation(false);
      },
      (err) => {
        console.error(err);
        setCurrentAddress(prev => ({ ...prev, name: 'Gagal mendapatkan lokasi', address: 'Izinkan akses lokasi di browser Anda.' }));
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
`;

const GPS_BUTTON_JSX = `
        {/* GPS Fetch Location Button */}
        <button
          onClick={handleFetchLocation}
          disabled={isFetchingLocation}
          style={{
            position: 'absolute',
            right: '16px',
            bottom: 'calc(50% + 80px)',
            zIndex: 500,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: isFetchingLocation ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          title="Gunakan lokasi saya"
        >
          {isFetchingLocation ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#034078" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#034078" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              <circle cx="12" cy="12" r="8" opacity="0.2" fill="#034078"/>
            </svg>
          )}
        </button>
`;

let successCount = 0;
FILES.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('isFetchingLocation')) {
    // These files use CRLF, so we look for the CRLF variant
    const insertAfter = '    }, 500);\r\n  };';
    const insertAfterIdx = content.lastIndexOf(insertAfter);
    if (insertAfterIdx === -1) {
      // try just LF variant
      const insertAfterLF = '    }, 500);\n  };';
      const idxLF = content.lastIndexOf(insertAfterLF);
      if (idxLF === -1) {
        console.log(`Could not find insertion point in ${filePath}`);
        return;
      }
      content = content.slice(0, idxLF + insertAfterLF.length) + '\n' + REVERSE_GEOCODE_FN + content.slice(idxLF + insertAfterLF.length);
    } else {
      content = content.slice(0, insertAfterIdx + insertAfter.length) + '\r\n' + REVERSE_GEOCODE_FN + content.slice(insertAfterIdx + insertAfter.length);
    }

    const pinMarker = '{/* Custom Map Pin (Static in Center) */}';
    if (!content.includes(pinMarker)) {
      console.log(`Could not find map pin marker in ${filePath}`);
    } else {
      content = content.replace(pinMarker, GPS_BUTTON_JSX + '\n        ' + pinMarker);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Patched: ${filePath}`);
    successCount++;
  } else {
    console.log(`⏭️  Already patched: ${filePath}`);
  }
});

console.log(`\nDone. ${successCount} files patched.`);
