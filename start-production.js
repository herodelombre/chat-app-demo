#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Chat App in Production Mode');
console.log('=====================================\n');

// Check if we're in the right directory
const rootDir = __dirname;
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');
const buildDir = path.join(clientDir, 'build');

// Verify directory structure
if (!fs.existsSync(clientDir)) {
  console.error('❌ Client directory not found:', clientDir);
  process.exit(1);
}

if (!fs.existsSync(serverDir)) {
  console.error('❌ Server directory not found:', serverDir);
  process.exit(1);
}

// Function to run command and show output
function runCommand(command, cwd = rootDir, description = '') {
  try {
    if (description) {
      console.log(`📋 ${description}`);
    }
    console.log(`   Running: ${command}`);

    execSync(command, {
      cwd: cwd,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    console.log('   ✅ Completed\n');
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    process.exit(1);
  }
}

// Function to check if frontend build exists and is valid
function checkBuildExists() {
  const indexPath = path.join(buildDir, 'index.html');
  const staticDir = path.join(buildDir, 'static');

  if (!fs.existsSync(buildDir)) {
    return false;
  }

  if (!fs.existsSync(indexPath)) {
    return false;
  }

  if (!fs.existsSync(staticDir)) {
    return false;
  }

  // Check if index.html has the expected React app structure
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (!indexContent.includes('<div id="root">')) {
    return false;
  }

  return true;
}

// Function to get build stats
function getBuildStats() {
  if (!fs.existsSync(buildDir)) {
    return null;
  }

  const stats = fs.statSync(buildDir);
  const files = fs.readdirSync(buildDir, { recursive: true });
  const jsFiles = files.filter(f => f.endsWith('.js')).length;
  const cssFiles = files.filter(f => f.endsWith('.css')).length;

  return {
    modified: stats.mtime,
    totalFiles: files.length,
    jsFiles,
    cssFiles
  };
}

// Main production startup sequence
async function startProduction() {
  try {
    // Step 1: Check if build exists
    console.log('🔍 Checking existing frontend build...');
    const buildExists = checkBuildExists();

    if (buildExists) {
      const stats = getBuildStats();
      console.log(`   ✅ Build found (${stats.totalFiles} files, ${stats.jsFiles} JS, ${stats.cssFiles} CSS)`);
      console.log(`   📅 Last modified: ${stats.modified.toLocaleString()}\n`);
    } else {
      console.log('   ⚠️  No valid build found\n');
    }

    // Step 2: Install dependencies if needed
    if (!fs.existsSync(path.join(serverDir, 'node_modules'))) {
      runCommand('npm install', serverDir, 'Installing server dependencies...');
    }

    if (!fs.existsSync(path.join(clientDir, 'node_modules'))) {
      runCommand('npm install', clientDir, 'Installing client dependencies...');
    }

    // Step 3: Build frontend (always rebuild for production)
    console.log('🔨 Building frontend for production...');
    console.log('   This ensures the latest code is bundled');

    // Clean existing build
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true, force: true });
      console.log('   🧹 Cleaned existing build');
    }

    // Build the frontend
    runCommand('npm run build', clientDir, 'Creating optimized production build...');

    // Step 4: Verify build
    console.log('✅ Verifying frontend build...');
    if (!checkBuildExists()) {
      console.error('   ❌ Build verification failed');
      process.exit(1);
    }

    const finalStats = getBuildStats();
    console.log(`   ✅ Build verified (${finalStats.totalFiles} files generated)`);
    console.log('');

    // Step 5: Start the server
    console.log('🚀 Starting production server...');
    console.log('   Server will serve frontend from http://0.0.0.0:3001/');
    console.log('   API endpoints available at http://0.0.0.0:3001/api/*');
    console.log('   Press Ctrl+C to stop\n');

    // Start server with production environment
    const serverProcess = spawn('node', ['server.js'], {
      cwd: serverDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    // Handle server process events
    serverProcess.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });

    serverProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(code);
      }
      console.log('👋 Server stopped');
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      serverProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      serverProcess.kill('SIGTERM');
    });

  } catch (error) {
    console.error('💥 Production startup failed:', error.message);
    process.exit(1);
  }
}

// Run the production startup
startProduction();
