const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'controllers', 'authController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the powershell mess
content = content.replace(/profile_picture: (.*?)\.profile_picture,`n        role: (.*?)\.role/g, 'profile_picture: $1.profile_picture,\n        role: $2.role');

// Ensure role is present in all user objects
// We want default_location, profile_picture, and role to be included anywhere we return the user object.
fs.writeFileSync(filePath, content);
console.log('Fixed powershell string literal issue');
