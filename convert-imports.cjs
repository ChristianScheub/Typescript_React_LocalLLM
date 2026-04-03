const fs = require('fs');
const path = require('path');

// Map relative paths to absolute aliases
function convertImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const fileDir = path.dirname(filePath);
    const srcDir = path.join(__dirname, 'src');

    // Resolve relative import to absolute path from src
    const resolveToSrc = (relativePath, fromDir) => {
      // Remove extensions and trailing index
      let cleanPath = relativePath.replace(/\.(tsx?|jsx?)$/, '').replace(/\/index$/, '');
      
      // Resolve relative path
      const resolved = path.normalize(path.join(fromDir, cleanPath));
      
      // Get path relative to src
      const rel = path.relative(srcDir, resolved).replace(/\\/g, '/');
      
      return rel;
    };

    // Get the part of the file path relative to src
    const fileRelPath = path.relative(srcDir, filePath).replace(/\\/g, '/').replace(/\.(tsx?)$/, '');
    const filePartDir = path.dirname(fileRelPath);

    // Replace relative imports with absolute @ imports
    content = content.replace(/from\s+['"](\.[^'"]*)['"]/g, (match, importPath) => {
      const resolved = resolveToSrc(importPath, fileDir);
      
      // Determine alias based on the first folder
      let alias = '';
      if (resolved.startsWith('services/')) {
        alias = '@services/' + resolved.replace('services/', '');
      } else if (resolved.startsWith('components/')) {
        alias = '@components/' + resolved.replace('components/', '');
      } else if (resolved.startsWith('views/')) {
        alias = '@views/' + resolved.replace('views/', '');
      } else if (resolved.startsWith('ui/')) {
        alias = '@ui/' + resolved.replace('ui/', '');
      } else if (resolved.startsWith('config/')) {
        alias = '@config/' + resolved.replace('config/', '');
      } else if (resolved === 'types') {
        alias = '@types';
      } else {
        console.warn(`⚠ Could not map: ${filePath} imports ${importPath}`);
        return match;
      }

      // Clean up double slashes and trailing slashes
      alias = alias.replace(/\/+/g, '/').replace(/\/$/, '');

      return `from '${alias}'`;
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ ${filePath}: ${error.message}`);
    return false;
  }
}

// Walk directory and convert all files
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(fullPath);
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.includes('.test.')) {
      convertImportsInFile(fullPath);
    }
  }
}

console.log('Converting all relative imports to @ aliases...\n');
const srcPath = path.join(__dirname, 'src');
walkDir(srcPath);
console.log('\n✅ Done!');

