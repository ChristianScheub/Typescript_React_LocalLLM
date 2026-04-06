// Skript zum Kopieren der onnxruntime-web Assets ins public/-Verzeichnis
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../node_modules/onnxruntime-web/dist');
const destDir = path.join(__dirname, '../public');

const assetExtensions = ['.wasm', '.js', '.mjs', '.json', '.map'];

fs.readdirSync(srcDir).forEach(file => {
  if (assetExtensions.some(ext => file.endsWith(ext))) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Kopiert: ${file}`);
  }
});

console.log('onnxruntime-web Assets wurden nach public/ kopiert.');
