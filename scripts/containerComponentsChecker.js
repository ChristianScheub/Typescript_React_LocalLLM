/**
 * Container Components Checker
 * - No input/button HTML tags in containers (must be in UI components)
 * - No UI component imports in containers (only Views and Services)
 * - Tag count limits (div, p, span, label, h1, h2)
 * - Naming convention for Components
 */

import fs from 'fs';
import path from 'path';
import { walkDir, getProjectPaths, getRelativePath } from './checkUtils.js';

export function checkContainerComponents() {
  const violations = [];
  const { projectRoot, srcDir } = getProjectPaths();

  // 1. Component File Naming Convention Check
  console.log('Checking components folder naming convention...');
  const componentsDir = path.join(srcDir, 'components');
  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      const fileName = path.basename(file);
      // Only check .tsx files
      if (!fileName.endsWith('.tsx')) {
        return;
      }
      
      // App.tsx is allowed as an exception (root component)
      if (fileName === 'App.tsx') {
        return;
      }
      
      // Check naming convention
      const isValid = fileName.endsWith('Container.tsx');

      if (!isValid) {
        violations.push(
          `FileName Check (components): File '${getRelativePath(file, projectRoot)}' does not match naming convention. ` +
          `Expected: *Container.tsx`
        );
      }
    });
  }

  // 2. Layer Boundary Check - Containers must not import from ui/
  console.log('Checking layer boundary: containers must not import UI components...');

  const FORBIDDEN_IMPORTS_IN_CONTAINERS = [
    { pattern: /from\s+['"][^'"]*\/ui\//, label: 'ui/' },
  ];

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      FORBIDDEN_IMPORTS_IN_CONTAINERS.forEach(({ pattern, label }) => {
        if (pattern.test(content)) {
          violations.push(
            `Layer Boundary Check (containers): File '${relFile}' imports from forbidden layer '${label}'. ` +
            `Containers must not directly import UI components. All UI must flow through Views to maintain clean architecture.`
          );
        }
      });
    });
  }

  // 2.5. Service Facade Import Check - Only whole services can be imported, not individual logic files
  console.log('Checking service import restrictions in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      // Regex: Matches imports from services/ with more than one slash after that (e.g., /services/TaxService/logic/...)
      // Pattern explanation:
      // - from\s+['"]: matches "from" keyword
      // - [^/]*\/services\/ : matches path to services folder
      // - [^'"]+ : matches the rest of the path inside quotes
      // Check if path has multiple slashes after /services/
      const serviceImportPattern = /from\s+['"]([^'"]*\/services\/[^'"]+\/[^'"]+\/)/;

      const matches = serviceImportPattern.exec(content);
      if (matches) {
        const importPath = matches[1];
        violations.push(
          `Service Import Check (containers): File '${relFile}' contains deep service import: '${importPath}'. ` +
          `Services must be imported as complete facades. ` +
          `BAD: import { calc } from '../services/TaxService/logic/Calc.ts' ` +
          `GOOD: import TaxService from '../services/TaxService'`
        );
      }
    });
  }

  // 3. HTML Tag Restrictions in Containers
  console.log('Checking HTML tag restrictions in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      // Only check Container files
      if (!relFile.endsWith('Container.tsx')) return;

      // Check for forbidden input and button tags
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
    });
  }

  // 3.5. Storage & Database Access Restrictions in Containers
  console.log('Checking storage and database operations in containers...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');

      // Only check Container files
      if (!relFile.endsWith('Container.tsx')) return;

      // Check for localStorage, sessionStorage, indexedDB operations
      if (/localStorage\./i.test(content)) {
        violations.push(
          `Storage Access Check (containers): File '${relFile}' accesses localStorage. ` +
          `All storage operations must be delegated to a Service. ` +
          `Create a dedicated Service and use dependency injection instead.`
        );
      }

      if (/sessionStorage\./i.test(content)) {
        violations.push(
          `Storage Access Check (containers): File '${relFile}' accesses sessionStorage. ` +
          `All storage operations must be delegated to a Service. ` +
          `Create a dedicated Service and use dependency injection instead.`
        );
      }

      if (/indexedDB\./i.test(content)) {
        violations.push(
          `Database Access Check (containers): File '${relFile}' accesses indexedDB. ` +
          `All database operations must be delegated to a Service. ` +
          `Create a dedicated Service and use dependency injection instead.`
        );
      }
    });
  }

  // 4. Tag Count Check (div, p, span, label, h1, h2)
  console.log('Checking tag count limits in components...');

  if (fs.existsSync(componentsDir)) {
    walkDir(componentsDir, (file) => {
      if (!file.endsWith('.tsx')) return;

      const relFile = getRelativePath(file, projectRoot);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // Check div, p, span, label, h1, h2 tag count
      const tagMatches = content.match(/<(div|p|span|label|h1|h2)[\s>]/g) || [];
      const tagCount = tagMatches.length;
      const lineCount = lines.length;
      const maxAllowed = Math.max(5, Math.ceil(lineCount * 0.1));

      if (tagCount > maxAllowed) {
        violations.push(
          `Tag Count Check (components): File '${relFile}' has ${tagCount} div/p/span/label/h1/h2 tags, ` +
          `but maximum allowed is ${maxAllowed} (10 or 10% of ${lineCount} lines). ` +
          `Consider breaking this component into smaller sub-components or even better stupid UI components with views.`
        );
      }
    });
  }

  return violations;
}
