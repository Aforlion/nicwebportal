const fs = require('fs');
const path = require('path');

const file = 'c:\\Users\\aforl\\Desktop\\NIC Portal\\nicwebportal\\.env.local';
if (fs.existsSync(file)) {
  console.log('.env.local EXISTS!');
  console.log(fs.readFileSync(file, 'utf-8'));
} else {
  console.log('.env.local DOES NOT EXIST');
}
