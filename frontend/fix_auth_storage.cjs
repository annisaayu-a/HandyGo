const fs = require('fs');
const path = require('path');

const authDir = path.join(__dirname, 'src', 'pages', 'Auth');
const files = fs.readdirSync(authDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(authDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace { name: data.user.full_name, email: data.user.email, phone: data.user.phone_number, id: data.user.id }
  const regex1 = /const user = \{ name: data\.user\.full_name, email: data\.user\.email, phone: data\.user\.phone_number, id: data\.user\.id \};/g;
  if (content.match(regex1)) {
    content = content.replace(regex1, 'const user = { name: data.user.full_name, email: data.user.email, phone: data.user.phone_number, id: data.user.id, default_location: data.user.default_location, profile_picture: data.user.profile_picture };');
    changed = true;
  }

  // VerifyMagicLink.jsx
  const regex2 = /const userObj = \{ id: user\.id, email: user\.email, name: user\.full_name, phone: user\.phone_number \};/g;
  if (content.match(regex2)) {
    content = content.replace(regex2, 'const userObj = { id: user.id, email: user.email, name: user.full_name, phone: user.phone_number, default_location: user.default_location, profile_picture: user.profile_picture };');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
