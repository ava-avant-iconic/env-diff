/**
 * Tests for env-diff CLI
 */

const { execSync } = require('child_process');

function runCmd(cmd) {
  try {
    const output = execSync(cmd, { encoding: 'utf-8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

console.log('Testing env-diff CLI...\n');

// Test 1: Basic comparison
console.log('Test 1: Basic comparison');
const test1 = runCmd('node cli.js .env.staging .env.production');
console.log('Expected: Show added, removed, changed variables\n');

// Test 2: Brief format
console.log('Test 2: Brief format');
const test2 = runCmd('node cli.js -f brief .env.staging .env.production');
console.log('Expected: Summary format only\n');

// Test 3: Ignore specific variables
console.log('Test 3: Ignore specific variables');
const test3 = runCmd('node cli.js -i API_KEY .env.staging .env.production');
console.log('Expected: API_KEY ignored in diff\n');

// Test 4: Show values
console.log('Test 4: Show actual values');
const test4 = runCmd('node cli.js -s .env.staging .env.production');
console.log('Expected: Show old and new values for changed vars\n');

// Test 5: No colors
console.log('Test 5: No colors');
const test5 = runCmd('node cli.js --no-color .env.staging .env.production');
console.log('Expected: Plain text output\n');

// Test 6: File not found
console.log('Test 6: Non-existent file');
const test6 = runCmd('node cli.js .env.staging nonexistent.env 2>&1');
console.log('Expected: Error message\n');

console.log('\nAll tests completed!');
console.log('\nManual usage:');
console.log('  node cli.js .env.staging .env.production');
console.log('  node cli.js -f brief .env.staging .env.production');
console.log('  node cli.js -i API_KEY .env.staging .env.production');
console.log('  node cli.js -s .env.staging .env.production');
