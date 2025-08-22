#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 JAG-OPS Project Setup Starting...\n');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.bright}${colors.blue}🔧 ${msg}${colors.reset}\n`)
};

// Function to run npm install in a directory
function installPackages(directory, description) {
    log.section(`Installing ${description}...`);
    
    try {
        const fullPath = path.resolve(directory);
        if (!fs.existsSync(fullPath)) {
            log.error(`Directory does not exist: ${fullPath}`);
            return false;
        }

        process.chdir(fullPath);
        log.info(`Installing packages in ${fullPath}`);
        
        execSync('npm install', { 
            stdio: 'inherit',
            timeout: 300000 // 5 minutes timeout
        });
        
        log.success(`${description} packages installed successfully`);
        return true;
    } catch (error) {
        log.error(`Failed to install ${description}: ${error.message}`);
        return false;
    }
}

// Function to build TypeScript projects
function buildProject(directory, description) {
    try {
        const fullPath = path.resolve(directory);
        if (!fs.existsSync(fullPath)) {
            log.warn(`Directory does not exist: ${fullPath} - skipping build`);
            return true;
        }

        process.chdir(fullPath);
        
        // Check if build script exists
        const packageJsonPath = path.join(fullPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.scripts && packageJson.scripts.build) {
                log.info(`Building ${description}...`);
                execSync('npm run build', { 
                    stdio: 'inherit',
                    timeout: 180000 // 3 minutes timeout
                });
                log.success(`${description} built successfully`);
            } else {
                log.warn(`No build script found for ${description} - skipping`);
            }
        }
        return true;
    } catch (error) {
        log.error(`Failed to build ${description}: ${error.message}`);
        return false;
    }
}

// Main setup function
async function setup() {
    const startTime = Date.now();
    const originalDir = process.cwd();
    let successCount = 0;
    let totalSteps = 0;

    try {
        // Step 1: Install root dependencies
        totalSteps++;
        log.section('Installing Root Dependencies');
        process.chdir(originalDir);
        
        try {
            execSync('npm install', { 
                stdio: 'inherit',
                timeout: 300000 
            });
            log.success('Root dependencies installed');
            successCount++;
        } catch (error) {
            log.error(`Failed to install root dependencies: ${error.message}`);
        }

        // Step 2: Install backend packages
        totalSteps++;
        if (installPackages('./backend', 'Backend')) {
            successCount++;
        }

        // Step 3: Install frontend packages
        totalSteps++;
        if (installPackages('./frontend', 'Frontend')) {
            successCount++;
        }

        // Step 4: Install functions packages (if exists)
        totalSteps++;
        if (fs.existsSync('./functions')) {
            if (installPackages('./functions', 'Firebase Functions')) {
                successCount++;
            }
        } else {
            log.warn('Functions directory not found - skipping');
            successCount++; // Don't count as failure
        }

        // Step 5: Build backend
        totalSteps++;
        if (buildProject('./backend', 'Backend')) {
            successCount++;
        }

        // Step 6: Build functions (if exists)
        totalSteps++;
        if (fs.existsSync('./functions')) {
            if (buildProject('./functions', 'Functions')) {
                successCount++;
            }
        } else {
            successCount++; // Don't count as failure
        }

        // Final summary
        const duration = Math.round((Date.now() - startTime) / 1000);
        
        console.log('\n' + '='.repeat(60));
        log.section('🎉 Setup Complete!');
        
        console.log(`📊 Results: ${successCount}/${totalSteps} steps completed successfully`);
        console.log(`⏱️ Total time: ${duration} seconds\n`);
        
        if (successCount === totalSteps) {
            log.success('All packages installed and built successfully!');
            console.log('\n🚀 Available Commands:');
            console.log('  npm run dev:backend     - Start backend development server');
            console.log('  npm run dev:frontend    - Start frontend development server');
            console.log('  npm run dev:all         - Start both backend and frontend');
            console.log('  npm run build:all       - Build all projects');
            console.log('  npm start               - Start React Native/Expo');
            console.log('\n🎯 Next Steps:');
            console.log('  1. Configure your .env files with API keys');
            console.log('  2. Run "npm run dev:all" to start development');
            console.log('  3. Open http://localhost:3000 for frontend');
            console.log('  4. Backend API available at http://localhost:8000');
        } else {
            log.warn('Some installations failed. Check the errors above.');
            console.log('\n🔧 Troubleshooting:');
            console.log('  - Ensure you have Node.js 18+ installed');
            console.log('  - Clear npm cache: npm cache clean --force');
            console.log('  - Delete node_modules and try again: npm run clean');
        }

    } catch (error) {
        log.error(`Setup failed: ${error.message}`);
        process.exit(1);
    } finally {
        // Always return to original directory
        process.chdir(originalDir);
    }
}

// Create directories if they don't exist
function ensureDirectories() {
    const dirs = ['backend', 'frontend', 'backend/src', 'backend/dist', 'frontend/src', 'storage'];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            log.info(`Created directory: ${dir}`);
        }
    });
}

// Check system requirements
function checkRequirements() {
    log.section('Checking System Requirements');
    
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        
        log.info(`Node.js version: ${nodeVersion}`);
        log.info(`npm version: ${npmVersion}`);
        
        // Check if Node version is at least 18
        const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
        if (majorVersion < 18) {
            log.error('Node.js version 18 or higher is required');
            process.exit(1);
        }
        
        log.success('System requirements satisfied');
        return true;
    } catch (error) {
        log.error('Node.js or npm not found. Please install Node.js first.');
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    console.log('🎯 JAG-CodeDevOps Project Setup');
    console.log('🚀 Comprehensive package installation and configuration\n');
    
    checkRequirements();
    ensureDirectories();
    setup().catch(error => {
        log.error(`Setup failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { setup, installPackages, buildProject };