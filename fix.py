import re

with open('frontend/src/pages/Customer/RepairDetails.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const isKelistrikan = repairTypeTitle.lower() == 'kelistrikan' or 'listrik' in repairTypeTitle.lower();", "const isKelistrikan = repairTypeTitle.toLowerCase().includes('listrik') || repairTypeTitle.toLowerCase() === 'kelistrikan';")

with open('frontend/src/pages/Customer/RepairDetails.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
