#!/usr/bin/env node

/**
 * env-diff - CLI tool to compare two .env files and show differences
 */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const chalk = require('chalk');
require('dotenv').config();

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options] <file1> <file2>')
  .option('format', {
    alias: 'f',
    type: 'string',
    description: 'Output format (unified, brief)',
    default: 'unified',
    choices: ['unified', 'brief']
  })
  .option('ignore', {
    alias: 'i',
    type: 'array',
    description: 'Variable names to ignore (can use multiple times)'
  })
  .option('show-values', {
    alias: 's',
    type: 'boolean',
    description: 'Show actual values in diff'
  })
  .option('no-color', {
    type: 'boolean',
    description: 'Disable colored output'
  })
  .help()
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'V')
  .example('$0 .env.example .env', 'Compare .env.example with .env')
  .example('$0 -f brief .env.staging .env.production', 'Brief format')
  .example('$0 -i API_KEY DATABASE_URL .env.example .env', 'Ignore specific variables')
  .parseSync();

/**
 * Parse .env file
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const envVars = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

/**
 * Compare two env objects
 */
function compareEnvs(env1, env2) {
  const allKeys = new Set([...Object.keys(env1), ...Object.keys(env2)]);
  const ignoredSet = new Set(argv.ignore || []);

  const diff = {
    added: [],
    removed: [],
    changed: [],
    unchanged: []
  };

  allKeys.forEach(key => {
    if (ignoredSet.has(key)) return;

    const value1 = env1[key];
    const value2 = env2[key];

    // Check if key exists in both
    const in1 = env1.hasOwnProperty(key);
    const in2 = env2.hasOwnProperty(key);

    if (!in1 && in2) {
      diff.added.push({ key, value: value2 });
    } else if (in1 && !in2) {
      diff.removed.push({ key, value: value1 });
    } else if (value1 !== value2) {
      diff.changed.push({ key, oldValue: value1, newValue: value2 });
    } else {
      diff.unchanged.push({ key, value: value1 });
    }
  });

  return diff;
}

/**
 * Print unified format
 */
function printUnified(diff) {
  const color = argv.noColor ? (text) => text : chalk;

  // Added variables
  if (diff.added.length > 0) {
    console.log(color.green('\n+ Added variables:'));
    diff.added.forEach(({ key, value }) => {
      if (argv.showValues) {
        console.log(color.green(`  + ${key}=${value}`));
      } else {
        console.log(color.green(`  + ${key}`));
      }
    });
  }

  // Removed variables
  if (diff.removed.length > 0) {
    console.log(color.red('\n- Removed variables:'));
    diff.removed.forEach(({ key, value }) => {
      if (argv.showValues) {
        console.log(color.red(`  - ${key}=${value}`));
      } else {
        console.log(color.red(`  - ${key}`));
      }
    });
  }

  // Changed variables
  if (diff.changed.length > 0) {
    console.log(color.yellow('\n~ Changed variables:'));
    diff.changed.forEach(({ key, oldValue, newValue }) => {
      if (argv.showValues) {
        console.log(color.yellow(`  ~ ${key}`));
        console.log(color.gray(`    - ${oldValue}`));
        console.log(color.gray(`    + ${newValue}`));
      } else {
        console.log(color.yellow(`  ~ ${key}`));
      }
    });
  }

  // Summary
  console.log(color.gray(`\nSummary: ${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed, ${diff.unchanged.length} unchanged`));
}

/**
 * Print brief format
 */
function printBrief(diff) {
  const color = argv.noColor ? (text) => text : chalk;

  const summary = {
    added: diff.added.length,
    removed: diff.removed.length,
    changed: diff.changed.length,
    unchanged: diff.unchanged.length
  };

  console.log('Summary:');
  console.log(`  Added: ${color.green(String(summary.added))}`);
  console.log(`  Removed: ${color.red(String(summary.removed))}`);
  console.log(`  Changed: ${color.yellow(String(summary.changed))}`);
  console.log(`  Unchanged: ${color.gray(String(summary.unchanged))}`);

  if (summary.added > 0) {
    console.log(color.green('\nAdded:'));
    diff.added.forEach(({ key }) => console.log(color.green(`  ${key}`)));
  }

  if (summary.removed > 0) {
    console.log(color.red('\nRemoved:'));
    diff.removed.forEach(({ key }) => console.log(color.red(`  ${key}`)));
  }

  if (summary.changed > 0) {
    console.log(color.yellow('\nChanged:'));
    diff.changed.forEach(({ key }) => console.log(color.yellow(`  ${key}`)));
  }
}

/**
 * Print diff based on format
 */
function printDiff(diff) {
  if (argv.format === 'brief') {
    printBrief(diff);
  } else {
    printUnified(diff);
  }
}

// Main execution
async function main() {
  const files = argv._;

  if (files.length < 2) {
    console.error('❌ Error: Two files required\n');
    console.error('Usage: env-diff <file1> <file2>');
    console.error('Run: env-diff --help for more information');
    process.exit(1);
  }

  const [file1, file2] = files;

  if (argv.verbose) {
    console.log(`\n📄 Comparing:\n`);
    console.log(`  File 1: ${file1}`);
    console.log(`  File 2: ${file2}\n`);
  }

  const env1 = parseEnvFile(file1);
  const env2 = parseEnvFile(file2);

  const diff = compareEnvs(env1, env2);
  printDiff(diff);

  // Exit code based on differences
  const hasDifferences = diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
  process.exit(hasDifferences ? 1 : 0);
}

main().catch(error => {
  console.error(`\n❌ Fatal error: ${error.message}`);
  process.exit(1);
});
