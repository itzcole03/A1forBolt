import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  framerMotionVersion: '12.16.0',
  targetDirectories: ['src/components', 'src/hooks', 'src/services', 'src/types'],
};

// Utility functions
const readFile = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf-8');
};

const writeFile = (filePath: string, content: string): void => {
  fs.writeFileSync(filePath, content, 'utf-8');
};

const updateFramerMotionImports = (content: string): string => {
  return content.replace(
    /import\s*{\s*motion\s*}\s*from\s*['"]framer-motion['"]/g,
    `import { motion, AnimatePresence } from 'framer-motion/dist/framer-motion'`
  );
};

const createSmartSidebar = (): void => {
  const sidebarContent = `import React from 'react';
import { motion } from 'framer-motion/dist/framer-motion';
import { useStore } from '../stores/useStore';
import { Button, Card } from './ui/UnifiedUI';

interface SmartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartSidebar: React.FC<SmartSidebarProps> = ({ isOpen, onClose }) => {
  const { state } = useStore();

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-50"
    >
      <Card className="h-full p-4">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Navigation</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </header>
        <nav className="space-y-2">
          {/* Navigation items will be added here */}
        </nav>
      </Card>
    </motion.div>
  );
};`;

  writeFile('src/components/ui/SmartSidebar.tsx', sidebarContent);
};

const updateTypeDefinitions = (): void => {
  const modelPerformanceType = `export interface ModelPerformance {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  timestamp: string;
  metrics: {
    f1: number;
    accuracy: number;
    precision: number;
    recall: number;
  };
}`;

  writeFile('src/types/model.ts', modelPerformanceType);
};

const updatePackageJson = (): void => {
  const packageJsonPath = 'package.json';
  const packageJson = JSON.parse(readFile(packageJsonPath));

  packageJson.dependencies['framer-motion'] = CONFIG.framerMotionVersion;

  writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

const runLinter = (): void => {
  try {
    execSync('npm run lint -- --fix', { stdio: 'inherit' });
  } catch (error) {
    console.error('Linting failed:', error);
  }
};

const main = async () => {
  console.log('Starting automated updates...');

  // Update framer-motion version
  console.log('Updating framer-motion...');
  updatePackageJson();
  execSync('npm install', { stdio: 'inherit' });

  // Update imports in all relevant files
  console.log('Updating imports...');
  CONFIG.targetDirectories.forEach(dir => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const filePath = path.join(dir, file);
        const content = readFile(filePath);
        const updatedContent = updateFramerMotionImports(content);
        writeFile(filePath, updatedContent);
      }
    });
  });

  // Create SmartSidebar component
  console.log('Creating SmartSidebar...');
  createSmartSidebar();

  // Update type definitions
  console.log('Updating type definitions...');
  updateTypeDefinitions();

  // Run linter
  console.log('Running linter...');
  runLinter();

  console.log('Automated updates completed!');
};

main().catch(console.error);
