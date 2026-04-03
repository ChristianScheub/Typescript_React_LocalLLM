#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');

// Helper function to recursively walk through directories
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

// Determine if we're in dev mode (skip tests for faster startup)
const isDev = process.env.NODE_ENV === 'development' || process.argv.some(arg => arg.includes('vite'));
const skipTests = process.env.SKIP_PREBUILD_TESTS === 'true' || isDev;

console.log('\n\x1b[36m🔍 Running Pre-Build Checks...\x1b[0m\n');
if (skipTests) {
  console.log('\x1b[33m⚠️  Skipping tests (dev mode). Run npm run build to run full checks.\x1b[0m\n');
}

// 1. Run Tests (only in build mode, not dev mode)
if (!skipTests) {
  console.log('Running tests...');
  try {
    execSync('npm test -- --run', { stdio: 'inherit' });
    console.log('\n\x1b[32m✅ All tests passed!\x1b[0m\n');
  } catch (error) {
    console.error('\n\x1b[31m❌ Tests failed!\x1b[0m\n');
    console.error('\x1b[33mPlease fix the test failures above before building.\x1b[0m\n');
    process.exit(1);
  }
}

const violations = [];

// 2. FileName Check - views folder (View.tsx, ViewProps.tsx, or .css)
console.log('Checking views folder naming convention...');
const viewsDir = path.join(srcDir, 'views');
if (fs.existsSync(viewsDir)) {
  walkDir(viewsDir, (file) => {
    const fileName = path.basename(file);
    // Skip directories and allow only specific extensions
    if (
      !file.endsWith('.tsx') &&
      !file.endsWith('.css') &&
      !file.endsWith('.ts')
    ) {
      return;
    }
    // Check naming convention
    const isValid =
      fileName.endsWith('View.tsx') ||
      fileName.endsWith('ViewProps.tsx') ||
      fileName.endsWith('.css');

    if (!isValid) {
      violations.push(
        `FileName Check (views): File '${path.relative(projectRoot, file)}' does not match naming convention. ` +
          `Expected: *View.tsx, *ViewProps.tsx, or *.css`
      );
    }
  });
}

// 3. FileName Check - components folder (Container.tsx)
console.log('Checking components folder naming convention...');
const componentsDir = path.join(srcDir, 'components');
if (fs.existsSync(componentsDir)) {
  walkDir(componentsDir, (file) => {
    const fileName = path.basename(file);
    // Only check .tsx files
    if (!fileName.endsWith('.tsx')) {
      return;
    }
    // Check naming convention
    const isValid = fileName.endsWith('Container.tsx');

    if (!isValid) {
      violations.push(
        `FileName Check (components): File '${path.relative(projectRoot, file)}' does not match naming convention. ` +
          `Expected: *Container.tsx`
      );
    }
  });
}

// 4. FileName Check - ui folder (.tsx or .css)
console.log('Checking ui folder naming convention...');
const uiDir = path.join(srcDir, 'ui');
if (fs.existsSync(uiDir)) {
  walkDir(uiDir, (file) => {
    const fileName = path.basename(file);
    // Check if it's a .tsx or .css file
    const isValid = fileName.endsWith('.tsx') || fileName.endsWith('.css');

    if (!isValid) {
      violations.push(
        `FileName Check (ui): File '${path.relative(projectRoot, file)}' does not match naming convention. ` +
          `Expected: *.tsx or *.css`
      );
    }
  });
}

// 5. Logic/State/Redux/Navigation Hook Check in ui and views folders
console.log('Checking ui and views folders for forbidden logic/state/redux/navigation hooks...');

const FORBIDDEN_PATTERNS = [
  // React Hooks (Logik-Bausteine)
  { pattern: /\buseEffect\b/,        label: 'useEffect' },
  { pattern: /\buseState\b/,         label: 'useState' },
  { pattern: /\buseCallback\b/,      label: 'useCallback' },
  { pattern: /\buseMemo\b/,          label: 'useMemo' },
  { pattern: /\buseContext\b/,       label: 'useContext' },
  // Redux
  { pattern: /\buseSelector\b/,      label: 'useSelector' },
  { pattern: /\buseReducer\b/,       label: 'useReducer' },
  { pattern: /\bRootState\b/,        label: 'RootState' },
  // Navigation
  { pattern: /\buseLocation\b/,      label: 'useLocation' },
  { pattern: /\bNavigateFunction\b/, label: 'NavigateFunction' },
];

// Files to skip entirely (relative paths from project root, using forward slashes)
const HOOK_CHECK_IGNORED_FILES = [
  'src/views/Navbar/NavbarView.tsx',
];

// Per-file pattern allowlists (relative paths → set of allowed labels)
const HOOK_CHECK_FILE_ALLOWLIST = {
  'src/views/settings/SettingsView.tsx': new Set(['useNavigate', 'NavigateFunction']),
};

const foldersToCheck = ['ui', 'views'];

foldersToCheck.forEach((folderName) => {
  const folderPath = path.join(srcDir, folderName);
  if (!fs.existsSync(folderPath)) return;

  walkDir(folderPath, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

    const relFile = path.relative(projectRoot, file).split(path.sep).join('/');

    // Skip ignored files entirely
    if (HOOK_CHECK_IGNORED_FILES.includes(relFile)) return;

    const content = fs.readFileSync(file, 'utf8');
    const allowedLabels = HOOK_CHECK_FILE_ALLOWLIST[relFile] ?? new Set();

    FORBIDDEN_PATTERNS.forEach(({ pattern, label }) => {
      if (allowedLabels.has(label)) return;
      if (pattern.test(content)) {
        violations.push(
          `Logic/Hook Check (${folderName}): File '${relFile}' contains forbidden pattern '${label}'. ` +
          `Files in '${folderName}/' must be pure presentational components without logic, state, redux or navigation hooks.`
        );
      }
    });
  });
});

// 6. Unused Exports Check - services folder
console.log('Checking services folder for unused exports...');

const servicesDir = path.join(srcDir, 'services');

if (fs.existsSync(servicesDir)) {
  // Collect all non-test src files for usage search
  const allSrcFiles = [];
  walkDir(srcDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (file.includes('.test.')) return;
    allSrcFiles.push(file);
  });

  // Regex to extract named exports from service files:
  //   export const foo ...
  //   export function foo ...
  //   export async function foo ...
  //   export default function foo ... (named)
  //   export default class Foo ...
  //   export class Foo ...
  //   export abstract class Foo ...
  const EXPORT_NAME_REGEX =
    /^export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|abstract\s+class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm;

  walkDir(servicesDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (file.includes('.test.')) return;

    const content = fs.readFileSync(file, 'utf8');
    const relFile = path.relative(projectRoot, file).split(path.sep).join('/');

    // Usage content = all non-test src files EXCEPT the file being checked itself
    const usageContents = allSrcFiles
      .filter((f) => f !== file)
      .map((f) => fs.readFileSync(f, 'utf8'))
      .join('\n');

    let match;
    EXPORT_NAME_REGEX.lastIndex = 0;
    while ((match = EXPORT_NAME_REGEX.exec(content)) !== null) {
      const exportName = match[1];

      const usageRegex = new RegExp(`\\b${exportName}\\b`);
      if (!usageRegex.test(usageContents)) {
        violations.push(
          `Unused Export Check (services): '${exportName}' in '${relFile}' is exported but never used in src (excluding test files).`
        );
      }
    }
  });
}

// 7. Layer Boundary / Import Check
console.log('Checking layer boundary import rules...');

// views/ and ui/ must not import from services/ or stateManagement/
const PRESENTATION_LAYER_FOLDERS = ['views', 'ui'];
const FORBIDDEN_IMPORTS_IN_PRESENTATION = [
  { pattern: /from\s+['"][^'"]*\/services\//, label: 'services/' },
  { pattern: /from\s+['"][^'"]*\/stateManagement\//, label: 'stateManagement/' },
];

// Per-file import allowlists (relative paths → set of allowed forbidden labels)
const IMPORT_CHECK_FILE_ALLOWLIST = {
  'src/views/TaxCalculator/TaxCalculatorView.tsx': new Set(['services/']),
};

PRESENTATION_LAYER_FOLDERS.forEach((folderName) => {
  const folderPath = path.join(srcDir, folderName);
  if (!fs.existsSync(folderPath)) return;

  walkDir(folderPath, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

    const relFile = path.relative(projectRoot, file).split(path.sep).join('/');
    const content = fs.readFileSync(file, 'utf8');
    const allowedLabels = IMPORT_CHECK_FILE_ALLOWLIST[relFile] ?? new Set();

    FORBIDDEN_IMPORTS_IN_PRESENTATION.forEach(({ pattern, label }) => {
      if (allowedLabels.has(label)) return;
      if (pattern.test(content)) {
        violations.push(
          `Layer Boundary Check (${folderName}): File '${relFile}' imports from forbidden layer '${label}'. ` +
          `Presentational files must not depend on services or state management directly.`
        );
      }
    });
  });
});

// services/ must not import from components/, views/, or ui/
const FORBIDDEN_IMPORTS_IN_SERVICES = [
  { pattern: /from\s+['"][^'"]*\/components\//, label: 'components/' },
  { pattern: /from\s+['"][^'"]*\/views\//, label: 'views/' },
  { pattern: /from\s+['"][^'"]*\/ui\//, label: 'ui/' },
];

if (fs.existsSync(servicesDir)) {
  walkDir(servicesDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

    const relFile = path.relative(projectRoot, file).split(path.sep).join('/');
    const content = fs.readFileSync(file, 'utf8');

    FORBIDDEN_IMPORTS_IN_SERVICES.forEach(({ pattern, label }) => {
      if (pattern.test(content)) {
        violations.push(
          `Layer Boundary Check (services): File '${relFile}' imports from forbidden layer '${label}'. ` +
          `Services are pure business logic and must not know about UI, components, or views.`
        );
      }
    });
  });
}

// components/ (containers) must not import from ui/
// Containers are "directors" - they should only render Views or other Containers, never UI components directly
const FORBIDDEN_IMPORTS_IN_COMPONENTS = [
  { pattern: /from\s+['"][^'"]*\/ui\//, label: 'ui/' },
];

if (fs.existsSync(componentsDir)) {
  walkDir(componentsDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

    const relFile = path.relative(projectRoot, file).split(path.sep).join('/');
    const content = fs.readFileSync(file, 'utf8');

    FORBIDDEN_IMPORTS_IN_COMPONENTS.forEach(({ pattern, label }) => {
      if (pattern.test(content)) {
        violations.push(
          `Layer Boundary Check (containers): File '${relFile}' imports from forbidden layer '${label}'. ` +
          `Containers must not directly import UI components. All UI must flow through Views to maintain clean architecture.`
        );
      }
    });
  });
}

// ui/ must not import from services/, components/, or views/
const FORBIDDEN_IMPORTS_IN_UI = [
  { pattern: /from\s+['"][^'"]*\/services\//, label: 'services/' },
  { pattern: /from\s+['"][^'"]*\/components\//, label: 'components/' },
  { pattern: /from\s+['"][^'"]*\/views\//, label: 'views/' },
];

if (fs.existsSync(uiDir)) {
  walkDir(uiDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

    const relFile = path.relative(projectRoot, file).split(path.sep).join('/');
    const content = fs.readFileSync(file, 'utf8');

    FORBIDDEN_IMPORTS_IN_UI.forEach(({ pattern, label }) => {
      if (pattern.test(content)) {
        violations.push(
          `Layer Boundary Check (ui): File '${relFile}' imports from forbidden layer '${label}'. ` +
          `UI components are pure presentational and must not depend on services, containers, or views.`
        );
      }
    });
  });
}

// 8. Magic Number Check - calculator files in services/
console.log('Checking services calculator files for magic numbers...');

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

// Matches a bare numeric literal used as an operand in an arithmetic expression:
//   * 0.055   /12   + 52.14   - 18.4
// Excludes numbers inside object literals (property: VALUE) — those belong in config files
const MAGIC_NUMBER_REGEX =
  /(?:[\*\/\+\-]\s*|-\s*)(\d+(?:\.\d+)?)(?!\s*[:,}\]])/g;

if (fs.existsSync(servicesDir)) {
  walkDir(servicesDir, (file) => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (MAGIC_NUMBER_FILE_IGNORE_PATTERNS.some((p) => p.test(file))) return;

    const relFile = path.relative(projectRoot, file).split(path.sep).join('/');
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

// 10. Console Log Check
console.log('Checking for console.log violations...');
const consoleLogViolations = [];
walkDir(srcDir, (file) => {
  if (
    file.includes(`${path.sep}scripts${path.sep}`) ||
    file.includes(`${path.sep}workers${path.sep}`) ||
    file.includes('.test.') || // Allow console.log in .test. files
    file.endsWith('logger.ts') // Allow console.log in logger.ts
  ) {
    return;
  }
  if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
  const content = fs.readFileSync(file, 'utf8');
  if (/console\.log\(/.test(content)) {
    consoleLogViolations.push(
      `Console Log Check: Found 'console.log' in file ${path.relative(projectRoot, file)}.`
    );
  }
});

if (consoleLogViolations.length > 0) {
  violations.push(...consoleLogViolations);
}

// 11. Style Tags & Div/P/Span Tag Count Check
console.log('Checking for style tags and div/p/span tag limits...');

const STYLE_AND_TAG_CHECK_FOLDERS = ['ui', 'components'];

STYLE_AND_TAG_CHECK_FOLDERS.forEach((folderName) => {
  const folderPath = path.join(srcDir, folderName);
  if (!fs.existsSync(folderPath)) return;

  walkDir(folderPath, (file) => {
    if (!file.endsWith('.tsx')) return;

    const relFile = path.relative(projectRoot, file).split(path.sep).join('/');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    // 1. Check for style tags (aber nicht className)
    if (/<style[\s>]/.test(content)) {
      violations.push(
        `Style Tags Check (${folderName}): File '${relFile}' contains <style> tags. ` +
        `Use CSS classes instead of inline style tags.`
      );
    }

    // 2. Check for forbidden input and button tags in Container files
    if (file.endsWith('Container.tsx')) {
      if (/<input[\s>]/i.test(content)) {
        violations.push(
          `Input Tag Check (containers): File '${relFile}' contains <input> tags. ` +
          `Input fields must be in UI components, not in Container components.`
        );
      }
      if (/<button[\s>]/i.test(content)) {
        violations.push(
          `Button Tag Check (containers): File '${relFile}' contains <button> tags. ` +
          `Buttons must be in UI components, not in Container components.`
        );
      }
    }

    // 3. Check div, p, span, label, h1, h2 tag count
    const tagMatches = content.match(/<(div|p|span|label|h1|h2)[\s>]/g) || [];
    const tagCount = tagMatches.length;
    const lineCount = lines.length;
    const maxAllowed = Math.max(5, Math.ceil(lineCount * 0.1));

    if (tagCount > maxAllowed) {
      violations.push(
        `Tag Count Check (${folderName}): File '${relFile}' has ${tagCount} div/p/span/label/h1/h2 tags, ` +
        `but maximum allowed is ${maxAllowed} (10 or 10% of ${lineCount} lines). ` +
        `Consider breaking this component into smaller sub-components or even better stupid UI components with views.`
      );
    }
  });
});

// 12. Modular Facade Service Architecture Check
console.log('Checking Modular Facade Service Architecture compliance...');
const servicesRootDir = path.join(srcDir, 'services');

if (fs.existsSync(servicesRootDir)) {
  // Check 0: No .ts/.tsx files allowed directly in services/ folder
  const filesInServicesRoot = fs.readdirSync(servicesRootDir);
  const tsFilesInRoot = filesInServicesRoot.filter(name => 
    (name.endsWith('.ts') || name.endsWith('.tsx')) && name !== 'README.md'
  );

  if (tsFilesInRoot.length > 0) {
    violations.push(
      `Service Structure (Modular Facade Pattern): Found individual .ts/.tsx files directly in 'src/services/': [${tsFilesInRoot.join(', ')}]. ` +
      `Services must be organized in folders. Each service must have its own folder with index.ts, I[ServiceName]Service.ts, and a logic/ subfolder.`
    );
  }

  const serviceFolderNames = fs.readdirSync(servicesRootDir)
    .filter(name => {
      const fullPath = path.join(servicesRootDir, name);
      const isDir = fs.statSync(fullPath).isDirectory();
      return isDir && name !== 'README.md';
    });

  serviceFolderNames.forEach((serviceName) => {
    const servicePath = path.join(servicesRootDir, serviceName);
    const files = fs.readdirSync(servicePath);
    const isDir = fs.statSync(servicePath).isDirectory();

    if (!isDir) return;

    // Check for required files in main service folder
    const hasIndexTs = files.includes('index.ts');
    const interfaceFiles = files.filter(f => f.match(/^I[A-Z]\w*Service\.ts$/));
    const logicFolder = files.includes('logic');
    
    // Files that should only be in main folder
    const mainFolderFiles = ['index.ts', ...interfaceFiles];
    const otherFiles = files.filter(f => 
      !mainFolderFiles.includes(f) && f !== 'logic' && !f.startsWith('.')
    );

    const relPath = path.relative(projectRoot, servicePath).split(path.sep).join('/');

    // Check 1: Must have index.ts (Facade)
    if (!hasIndexTs) {
      violations.push(
        `Service Structure (Modular Facade Pattern): Service '${relPath}' missing 'index.ts'. ` +
        `Each service must have a Facade index.ts that exports typed methods.`
      );
    }

    // Check 2: Must have exactly one interface file (IServiceNameService.ts)
    if (interfaceFiles.length === 0) {
      violations.push(
        `Service Structure (Modular Facade Pattern): Service '${relPath}' missing interface file. ` +
        `Expected: I${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Service.ts (pure interface definition).`
      );
    } else if (interfaceFiles.length > 1) {
      violations.push(
        `Service Structure (Modular Facade Pattern): Service '${relPath}' has ${interfaceFiles.length} interface files. ` +
        `Expected exactly one: I${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Service.ts`
      );
    }

    // Check 3: Must have logic folder for implementation
    if (!logicFolder) {
      violations.push(
        `Service Structure (Modular Facade Pattern): Service '${relPath}' missing 'logic' folder. ` +
        `All implementation logic must be in a './logic/' subfolder.`
      );
    }

    // Check 4: No implementation files in main folder (only index.ts and I*Service.ts allowed)
    if (otherFiles.length > 0) {
      const invalidFiles = otherFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
      if (invalidFiles.length > 0) {
        violations.push(
          `Service Structure (Modular Facade Pattern): Service '${relPath}' has implementation files in main folder: [${invalidFiles.join(', ')}]. ` +
          `Only 'index.ts' and 'I*Service.ts' interface files are allowed in main folder. Implementation must be in './logic/' subfolder.`
        );
      }
    }

    // Check 5: Validate index.ts (should only import and export façade object)
    if (hasIndexTs) {
      const indexPath = path.join(servicePath, 'index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const indexLines = indexContent.split('\n');
      
      // Count export statements (should be exactly 1)
      const exportLines = indexLines.filter(line => 
        /^export\s+(const|default)\s+\w+/.test(line.trim())
      );
      
      if (exportLines.length !== 1) {
        violations.push(
          `Facade Pattern (${relPath}/index.ts): Must have exactly 1 export statement (the Facade object). ` +
          `Found ${exportLines.length}. The facade should export a single typed object aggregating all methods.`
        );
      }

      // Check if it imports from logic subfolder
      const hasLogicImports = indexContent.includes("from './logic/");
      if (!hasLogicImports && logicFolder) {
        violations.push(
          `Facade Pattern (${relPath}/index.ts): Should import implementation from './logic/' subfolder. ` +
          `The facade orchestrates logic functions into a typed object.`
        );
      }

      // Check for implementation logic in index.ts (forbidden)
      if (/^\s*(function|const.*=\s*[\(\{]|class|interface|type.*=)[\s\S]*?[\{\(\[]/.test(indexContent)) {
        const hasLogicIndicators = 
          /(?<!\/\/)(?:\{[\s\S]*?\}|=>|function|\bif\s*\(|\bfor\s*\(|\bwhile\s*\(|\bswitch\s*\()/.test(
            indexContent.split('from')[0] || ''
          );
        
        if (hasLogicIndicators) {
          violations.push(
            `Facade Pattern (${relPath}/index.ts): Contains implementation logic. ` +
            `Index.ts (facade) must only contain imports and a typed object export. All logic belongs in './logic/' subfolder.`
          );
        }
      }
    }

    // Check 6: Validate interface file (should only contain interface definition, no logic)
    if (interfaceFiles.length === 1) {
      const interfacePath = path.join(servicePath, interfaceFiles[0]);
      const interfaceContent = fs.readFileSync(interfacePath, 'utf8');
      
      // Check for non-interface exports
      if (/^export\s+(const|class|function|enum|let|var)\s+/m.test(interfaceContent)) {
        violations.push(
          `Service Interface (${relPath}/${interfaceFiles[0]}): Must only contain interface definitions. ` +
          `Found const, class, function, enum, let, or var exports. Interface files must be pure type definitions.`
        );
      }

      // Check for implementation logic indicators
      const interfaceBody = interfaceContent.split('interface')[1] || '';
      if (/\{[\s\S]*?(?:=>|if\s*\(|for\s*\(|while\s*\(|switch\s*\(|\/\/|:)[\s\S]*?\}/.test(interfaceBody)) {
        const hasImplementation = /=>|function[\s\(]|{\s*[\w\s\n]*[^}]+\n\s*}|if\s*\(|for\s*\(|while\s*\(/.test(interfaceBody);
        if (hasImplementation) {
          violations.push(
            `Service Interface (${relPath}/${interfaceFiles[0]}): Contains implementation logic inside interface. ` +
            `Interface files must only have type definitions, no implementation or method bodies.`
          );
        }
      }
    }

    // Check 7: Validate logic folder (if exists)
    if (logicFolder) {
      const logicPath = path.join(servicePath, 'logic');
      const logicIsDir = fs.statSync(logicPath).isDirectory();
      
      if (logicIsDir) {
        walkDir(logicPath, (file) => {
          if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
          
          const relFile = path.relative(projectRoot, file).split(path.sep).join('/');
          const content = fs.readFileSync(file, 'utf8');
          
          // Count exports (max 2 per file for atomization)
          const exportCount = (content.match(/^export\s+(?:const|function|class|default)/gm) || []).length;
          
          if (exportCount > 2) {
            violations.push(
              `Service Atomization (${relFile}): Exports ${exportCount} items. ` +
              `Maximum 2 exports per file in logic subfolder. Keep files focused on a single responsibility.`
            );
          }
        });
      }
    }
  });
}

// Output results
if (violations.length > 0) {
  console.error('\n\x1b[31m❌ Pre-Build Checks failed!\x1b[0m\n');
  violations.forEach((msg) => console.error('- ' + msg));
  console.error('\n\x1b[33mPlease fix the violations above before building.\x1b[0m\n');
  process.exit(1);
}

console.log('\n\x1b[32m✅ All Pre-Build Checks passed!\x1b[0m\n');
process.exit(0);