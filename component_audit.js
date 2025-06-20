#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the components directory
const componentsDir = path.join(process.cwd(), 'src', 'components');

// Function to recursively find all component files
function findComponentFiles(dir, componentFiles = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findComponentFiles(filePath, componentFiles);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        componentFiles.push(filePath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return componentFiles;
}

// Function to extract component names from a file
function extractComponentNames(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const components = [];
    
    // Match exported components
    const exportRegex = /export\s+(?:const|function|default)\s+([A-Z][a-zA-Z0-9]*)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      components.push(match[1]);
    }
    
    // Match React.FC components
    const fcRegex = /(?:const|function)\s+([A-Z][a-zA-Z0-9]*)\s*:\s*React\.FC/g;
    while ((match = fcRegex.exec(content)) !== null) {
      if (!components.includes(match[1])) {
        components.push(match[1]);
      }
    }
    
    return components;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Function to check if a component is properly implemented
function checkComponentImplementation(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for basic implementation
    if (content.length < 100) {
      issues.push('File too short - likely a stub');
    }
    
    // Check for proper imports
    if (!content.includes('import React') && !content.includes('import { React')) {
      issues.push('Missing React import');
    }
    
    // Check for TSX syntax
    if (filePath.endsWith('.tsx') && !content.includes('<') && !content.includes('JSX')) {
      issues.push('No JSX found in TSX file');
    }
    
    // Check for export
    if (!content.includes('export')) {
      issues.push('No exports found');
    }
    
    return issues;
  } catch (error) {
    return [`Error reading file: ${error.message}`];
  }
}

// Main audit function
function auditComponents() {
  console.log('🔍 Starting Component Audit...\n');
  
  if (!fs.existsSync(componentsDir)) {
    console.error('❌ Components directory not found:', componentsDir);
    return;
  }
  
  const componentFiles = findComponentFiles(componentsDir);
  console.log(`📁 Found ${componentFiles.length} component files\n`);
  
  const audit = {
    totalFiles: componentFiles.length,
    totalComponents: 0,
    implementedComponents: 0,
    stubComponents: 0,
    brokenComponents: 0,
    duplicateComponents: 0,
    issues: [],
    components: {}
  };
  
  const componentNames = new Set();
  const duplicates = new Set();
  
  componentFiles.forEach(filePath => {
    const relativePath = path.relative(componentsDir, filePath);
    const components = extractComponentNames(filePath);
    const issues = checkComponentImplementation(filePath);
    
    audit.totalComponents += components.length;
    
    components.forEach(name => {
      if (componentNames.has(name)) {
        duplicates.add(name);
        audit.duplicateComponents++;
      } else {
        componentNames.add(name);
      }
    });
    
    if (issues.length === 0) {
      audit.implementedComponents += components.length;
    } else if (issues.some(issue => issue.includes('stub'))) {
      audit.stubComponents += components.length;
    } else {
      audit.brokenComponents += components.length;
    }
    
    audit.components[relativePath] = {
      components,
      issues,
      status: issues.length === 0 ? 'implemented' : 
              issues.some(issue => issue.includes('stub')) ? 'stub' : 'broken'
    };
  });
  
  // Generate report
  console.log('📊 COMPONENT AUDIT RESULTS');
  console.log('=' + '='.repeat(50));
  console.log(`📁 Total Files: ${audit.totalFiles}`);
  console.log(`🧩 Total Components: ${audit.totalComponents}`);
  console.log(`✅ Implemented: ${audit.implementedComponents}`);
  console.log(`⚠️  Stubs: ${audit.stubComponents}`);
  console.log(`❌ Broken: ${audit.brokenComponents}`);
  console.log(`🔄 Duplicates: ${audit.duplicateComponents}`);
  console.log();
  
  if (duplicates.size > 0) {
    console.log('🔄 DUPLICATE COMPONENTS:');
    duplicates.forEach(name => console.log(`  - ${name}`));
    console.log();
  }
  
  const brokenFiles = Object.entries(audit.components)
    .filter(([, data]) => data.status === 'broken');
  
  if (brokenFiles.length > 0) {
    console.log('❌ BROKEN COMPONENTS:');
    brokenFiles.forEach(([filePath, data]) => {
      console.log(`  📄 ${filePath}`);
      data.issues.forEach(issue => console.log(`    - ${issue}`));
    });
    console.log();
  }
  
  const stubFiles = Object.entries(audit.components)
    .filter(([, data]) => data.status === 'stub');
  
  if (stubFiles.length > 0) {
    console.log('⚠️  STUB COMPONENTS:');
    stubFiles.forEach(([filePath, data]) => {
      console.log(`  📄 ${filePath} (${data.components.join(', ')})`);
    });
    console.log();
  }
  
  // Calculate completion percentage
  const completionRate = ((audit.implementedComponents / audit.totalComponents) * 100).toFixed(1);
  console.log(`🎯 COMPLETION RATE: ${completionRate}%`);
    // Save detailed report
  const reportPath = path.join(process.cwd(), 'component_audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(audit, null, 2));
  
  console.log('💾 Detailed report saved to: component_audit_report.json');
  
  return audit;
}

// Run the audit
if (require.main === module) {
  auditComponents();
}

module.exports = { auditComponents };
