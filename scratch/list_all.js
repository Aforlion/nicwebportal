const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\aforl\\Desktop\\NIC Portal\\nicwebportal';
fs.readdir(dir, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    console.log(`${stat.isDirectory() ? 'DIR ' : 'FILE'} ${file} (${stat.size} bytes)`);
  });
});
