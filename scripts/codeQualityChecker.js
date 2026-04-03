/**
 * Code Quality Checker
 * - Magic Number detection (identifies unnamed numeric constants)
 * - console.log violations (should use Logger instead)
 * - Style tags check (should use CSS classes)
 * - Tag count for UI components
 */

import fs from 'fs';
import path from 'path';
import { walkDir, getProjectPaths, getRelativePath } from './checkUtils.js';

export function checkCodeQuality() {
  const violations = [];
  const { projectRoot, srcDir } = getProjectPaths();

  // 1. Magic Number Check - calculator files in services/
  console.log('Checking services for magic numbers...');

  const servicesDir = path.join(srcDir, 'services');
  
  // Config files are exempt - they ARE the named-constant definitions
  const MAGIC_NUMBER_FILE_IGNORE_PATTERNS = [
    /Config\.ts$/,
    /config\.ts$/,
    /\.test\./,
  ];

  // Numbers that are universally acceptable without a named constant:
  //   12  → months per year
  //   0   → zero/guard value
  //   1   → identity/unit
  //   100 → percentage base
  //   2   → factor (e.g. "both ways")
  //   0.01 → convergence epsilon / rounding guard
  const MAGIC_NUMBER_WHITELIST = new Set([0, 1, 2, 12, 100]);
  const MAGIC_NUMBER_EPSILON = 0.01; // any float <= this is treated as a convergence guard

  // Matches a bare numeric literal used as an operand in an arithmetic expression
  const MAGIC_NUMBER_REGEX =
    /(?:[\*\/\+\-]\s*|-\s*)(\d+(?:\.\d+)?)(?!\s*[:,}\]])/g;

  if (fs.existsSync(servicesDir)) {
    walkDir(servicesDir, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
      if (MAGIC_NUMBER_FILE_IGNORE_PATTERNS.some((p) => p.test(file))) return;

      const relFile = getRelativePath(file, projectRoot);
      const lines = fs.readFileSync(file, 'utf8').split('\n');

      lines.forEach((line, idx) => {
        // Skip comment lines and import lines
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import')) return;

        // Strip inline comments before matching
        const codePart = line.replace(/\/\/.*$/, '');

        let m;
        MAGIC_NUMBER_REGEX.lastIndex = 0;
        while ((m = MAGIC_NUMBER_REGEX.exec(codePart)) !== null) {
          const num = parseFloat(m[1]);
          if (MAGIC_NUMBER_WHITELIST.has(num)) continue;
          if (num <= MAGIC_NUMBER_EPSILON) continue; // convergence epsilon guard

          // Warning only – does not block the build
          console.warn(
            `\x1b[33m⚠ Magic Number Check (services): File '${relFile}' line ${idx + 1}: ` +
            `bare number '${m[1]}' used directly in calculation. Consider extracting it into a named constant in a *Config.ts file.\x1b[0m`
          );
        }
      });
    });
  }

  // 2. Console Log Check
  console.log('Checking for console.log violations...');
  const consoleLogViolations = [];
  
  walkDir(srcDir, (file) => {
    if (
      file.includes(`${path.sep}scripts${path.sep}`) ||
      file.includes(`${path.sep}workers${path.sep}`) ||
      file.includes('.test.') || // Allow console.log in .test. files
      file.includes('logger') // Allow console.log in logger files
    ) {
      return;
    }
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    
    const content = fs.readFileSync(file, 'utf8');
    if (/console\.log\(/.test(content)) {
      const relFile = getRelativePath(file, projectRoot);
      consoleLogViolations.push(
        `Console Log Check: Found 'console.log' in file ${relFile}. Use the Logger service instead.`
      );
    }
  });

  if (consoleLogViolations.length > 0) {
    violations.push(...consoleLogViolations);
  }

  // 3. Style Tags & Div/P/Span Tag Count Check in UI components
  console.log('Checking for style tags in UI components...');

  const STYLE_AND_TAG_CHECK_FOLDERS = ['ui', 'components'];

  STYLE_AND_TAG_CHECK_FOLDERS.forEach((folderName) => {
    const folderPath = path.join(srcDir, folderName);
    if (!fs.existsSync(folderPath)) return;

    walkDir(folderPath, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // Check for style tags (aber nicht className)
      if (/<style[\s>]/.test(content)) {
        violations.push(
          `Style Tags Check (${folderName}): File '${relFile}' contains <style> tags. ` +
          `Use CSS classes instead of inline style tags.`
        );
      }

      // Check div, p, span, label, h1, h2 tag count
      const tagMatches = content.match(/<(div|p|span|label|h1|h2)[\s>]/g) || [];
      const tagCount = tagMatches.length;
      const lineCount = lines.length;
      const maxAllowed = Math.max(5, Math.ceil(lineCount * 0.1));

      if (tagCount > maxAllowed) {
        violations.push(
          `Tag Count Check (${folderName}): File '${relFile}' has ${tagCount} div/p/span/label/h1/h2 tags, ` +
          `but maximum allowed is ${maxAllowed} (10 or 10% of ${lineCount} lines). ` +
          `Consider breaking this component into smaller sub-components.`
        );
      }
    });
  });

  // 4. Absolute Import Path Check - All imports must use defined @ aliases
  console.log('Checking for absolute import paths with proper @ aliases...');

  // Define allowed import aliases
  const allowedAliases = ['@services', '@components', '@views', '@ui', '@config', '@types'];

  walkDir(srcDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (file.includes('.test.')) return; // Allow any imports in test files

    const relFile = getRelativePath(file, projectRoot);
    const content = fs.readFileSync(file, 'utf8');

    // Regex to find all import statements
    const importRegex = /^import\s+.*?\s+from\s+['"]([^'"]+)['"]/gm;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // Skip external packages (packages without @ prefix)
      // e.g. 'react', 'react-dom/client', 'vite', etc. - these are allowed
      if (!importPath.startsWith('@')) {
        continue; // External package - allowed
      }

      // Check 1: No relative paths allowed (../, ./, /)
      if (importPath.startsWith('../') || importPath.startsWith('./') || importPath.startsWith('/')) {
        violations.push(
          `Absolute Import Check: File '${relFile}' uses relative import path '${importPath}'. ` +
          `All imports must use absolute paths with @ aliases. ` +
          `GOOD: 'import Model from "@services/model"'`
        );
        continue;
      }

      // Check 2: Must use one of our valid aliases
      const hasValidAlias = allowedAliases.some(alias => importPath.startsWith(alias));
      if (!hasValidAlias) {
        violations.push(
          `Import Alias Check: File '${relFile}' uses invalid import path '${importPath}'. ` +
          `Must use: @services, @components, @views, @ui, @config, @types. ` +
          `GOOD: 'import Model from "@services/model"'`
        );
        continue;
      }

      // Check 3: No deep imports into service logic folders (unless FROM inside that service)
      // e.g., you can't do: import X from '@services/logger/logic/LoggerImpl' (unless you're inside logger/)
      // BUT within a service facade (index.ts), importing from your own logic/ is allowed
      if (importPath.startsWith('@services/')) {
        const parts = importPath.split('/');
        const importedService = parts[1]; // e.g., 'logger' from '@services/logger/logic/...'
        
        // Check if this file is inside a service folder
        const isFileInsideService = relFile.includes(`services/${importedService}/`);
        
        // If accessing logic or interface from OUTSIDE the service, that's forbidden
        if (!isFileInsideService && parts.length > 2 && (parts[2] === 'logic' || parts.includes('IService'))) {
          violations.push(
            `Deep Service Import Check: File '${relFile}' bypasses service facade with '${importPath}'. ` +
            `Import service facades only. GOOD: '@services/logger'`
          );
        }
      }
    }
  });

  return violations;
}

