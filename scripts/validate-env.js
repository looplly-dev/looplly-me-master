#!/usr/bin/env node

/**
 * Environment Security Validation Script
 * 
 * This script validates that environment variables are set up securely
 * and warns about potential security issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ENV_FILES_TO_CHECK = [
  '.env',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local'
];

const SENSITIVE_PATTERNS = [
  /service.*role.*key/i,
  /secret/i,
  /private.*key/i,
  /password/i,
  /credential/i
];

function checkGitIgnore() {
  const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    console.error('❌ .gitignore file not found!');
    return false;
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = ['.env', '.env.local', '.env.*.local'];
  const missing = [];
  
  requiredPatterns.forEach(pattern => {
    if (!gitignoreContent.includes(pattern)) {
      missing.push(pattern);
    }
  });
  
  if (missing.length > 0) {
    console.error(`❌ .gitignore is missing environment file patterns: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('✅ .gitignore properly configured for environment files');
  return true;
}

function checkEnvironmentFiles() {
  let hasIssues = false;
  
  ENV_FILES_TO_CHECK.forEach(envFile => {
    const envPath = path.join(PROJECT_ROOT, envFile);
    
    if (fs.existsSync(envPath)) {
      console.log(`🔍 Checking ${envFile}...`);
      
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Check for sensitive patterns
        SENSITIVE_PATTERNS.forEach(pattern => {
          if (pattern.test(line) && line.includes('=')) {
            const [key] = line.split('=');
            console.warn(`⚠️  ${envFile}:${lineNum} - Potentially sensitive variable: ${key}`);
            
            if (!key.startsWith('VITE_')) {
              console.warn(`⚠️  ${envFile}:${lineNum} - Variable ${key} doesn't use VITE_ prefix - may be exposed to client!`);
              hasIssues = true;
            }
          }
        });
        
        // Check for empty values
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (!value || value.trim() === '' || value === 'your-key-here' || value === 'your-project-id') {
            console.warn(`⚠️  ${envFile}:${lineNum} - Variable ${key} has placeholder or empty value`);
          }
        }
      });
    }
  });
  
  return !hasIssues;
}

function checkRequiredFiles() {
  const requiredFiles = [
    '.env.example',
    'src/config/env.ts'
  ];
  
  let allExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(PROJECT_ROOT, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required file missing: ${file}`);
      allExist = false;
    } else {
      console.log(`✅ Required file exists: ${file}`);
    }
  });
  
  return allExist;
}

function checkViteEnvPrefix() {
  const configFiles = [
    'vite.config.ts',
    'vite.config.js'
  ];
  
  let configFound = false;
  
  configFiles.forEach(configFile => {
    const configPath = path.join(PROJECT_ROOT, configFile);
    if (fs.existsSync(configPath)) {
      configFound = true;
      console.log(`✅ Vite config found: ${configFile}`);
    }
  });
  
  if (!configFound) {
    console.warn('⚠️  No Vite config file found - make sure VITE_ prefixed variables are properly configured');
    return false;
  }
  
  return true;
}

function generateSecurityReport() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 ENVIRONMENT SECURITY VALIDATION REPORT');
  console.log('='.repeat(60));
  
  let overallScore = 0;
  let maxScore = 4;
  
  // Check .gitignore
  if (checkGitIgnore()) overallScore++;
  
  // Check required files
  if (checkRequiredFiles()) overallScore++;
  
  // Check environment files
  if (checkEnvironmentFiles()) overallScore++;
  
  // Check Vite configuration
  if (checkViteEnvPrefix()) overallScore++;
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 SECURITY SCORE: ${overallScore}/${maxScore}`);
  
  if (overallScore === maxScore) {
    console.log('🎉 Excellent! Your environment setup follows security best practices.');
  } else if (overallScore >= maxScore * 0.8) {
    console.log('👍 Good! Minor issues found, but overall setup is secure.');
  } else if (overallScore >= maxScore * 0.6) {
    console.log('⚠️  Moderate issues found. Please address the warnings above.');
  } else {
    console.log('❌ Serious security issues found. Please fix them immediately!');
  }
  
  console.log('\n📝 SECURITY RECOMMENDATIONS:');
  console.log('1. Never commit .env files to version control');
  console.log('2. Use VITE_ prefix for frontend-accessible variables only');
  console.log('3. Keep service role keys and other secrets secure');
  console.log('4. Use different credentials for development and production');
  console.log('5. Regularly rotate API keys and tokens');
  
  console.log('\n📖 For more information, see: docs/ENVIRONMENT_SETUP.md');
  console.log('='.repeat(60));
  
  return overallScore === maxScore;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = generateSecurityReport();
  process.exit(success ? 0 : 1);
}

export {
  checkGitIgnore,
  checkEnvironmentFiles,
  checkRequiredFiles,
  checkViteEnvPrefix,
  generateSecurityReport
};
