import re

with open('frontend/src/pages/Customer/RepairDetails.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_categories = """  const isKelistrikan = repairTypeTitle.lower() == 'kelistrikan' or 'listrik' in repairTypeTitle.lower();
  
  const categories = isKelistrikan ? [
    { id: 'lampu', title: 'Lampu Mati', icon: '💡' },
    { id: 'saklar', title: 'Saklar Rusak' },
    { id: 'stopkontak', title: 'Stop Kontak Biasa' },
    { id: 'mcb', title: 'MCB Turun' },
    { id: 'instalasi', title: 'Instalasi Listrik' }
  ] : [
    { id: 'tv', title: 'TV' },
    { id: 'mesin_cuci', title: 'Mesin Cuci' },
    { id: 'kulkas', title: 'Kulkas' },
    { id: 'dispenser', title: 'Dispenser' },
    { id: 'kipas', title: 'Kipas' }
  ];"""

content = re.sub(r"  const categories = \[.*?\];", new_categories, content, flags=re.DOTALL)

content = content.replace('<span className="rd-dropdown-text placeholder">Pilih kategori</span>', '<span className="rd-dropdown-text placeholder">{isKelistrikan ? "Pilih jenis listrik" : "Pilih jenis elektronik"}</span>')

with open('frontend/src/pages/Customer/RepairDetails.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
