# env-diff

A CLI tool to compare two `.env` files and show differences. Perfect for comparing staging/production configurations, detecting missing variables, and tracking configuration changes.

## Features

- ✅ Compare two .env files
- ✅ Show added variables (in file2 not in file1)
- ✅ Show removed variables (in file1 not in file2)
- ✅ Show changed variables (same key, different value)
- ✅ Show unchanged variables
- ✅ Unified and brief output formats
- ✅ Ignore specific variables
- ✅ Show actual values in diff
- ✅ Color-coded output
- ✅ Exit code 1 on differences (CI/CD friendly)

## Installation

### Global Installation

```bash
npm install -g env-diff
```

### Local Installation

```bash
npm install env-diff
```

### From Source

```bash
git clone <repository-url>
cd env-diff
npm install
```

## Usage

### Basic Usage

Compare two .env files:

```bash
env-diff .env.staging .env.production
```

### Brief Format

Show summary only:

```bash
env-diff -f brief .env.staging .env.production
```

### Ignore Variables

Ignore specific variables:

```bash
env-diff -i API_KEY .env.staging .env.production
```

Multiple ignore patterns:

```bash
env-diff -i API_KEY -i DATABASE_URL .env.staging .env.production
```

### Show Values

Display actual values in diff:

```bash
env-diff -s .env.staging .env.production
```

### No Colors

Disable colored output:

```bash
env-diff --no-color .env.staging .env.production
```

## Options

| Option | Alias | Type | Description | Default |
|--------|--------|-------|-------------|----------|
| `--format` | `-f` | string | Output format (unified, brief) | `unified` |
| `--ignore` | `-i` | array | Variable names to ignore | - |
| `--show-values` | `-s` | boolean | Show actual values | `false` |
| `--no-color` | - | boolean | Disable colored output | `false` |
| `--help` | `-h` | - | Show help | - |
| `--version` | `-V` | - | Show version | - |

## Examples

### Compare Staging and Production

```bash
env-diff .env.staging .env.production
```

**Output:**
```
+ Added variables:
  + NEW_VAR=new-variable-in-production

- Removed variables:
  - STAGING_VAR=staging-only-value

~ Changed variables:
  ~ API_KEY
    - staging-api-key-12345
    + prod-api-key-67890
  ~ DATABASE_URL
    - postgres://user:pass@staging-db.example.com:5432/staging_db
    + postgres://user:pass@prod-db.example.com:5432/prod_db
  ~ DEBUG
    - true
    + false
  ~ LOG_LEVEL
    - debug
    + info
  ~ PORT
    - 3000
    + 8080
  ~ REDIS_URL
    - redis://staging-redis.example.com:6379
    + redis://prod-redis.example.com:6379

Summary: 1 added, 1 removed, 5 changed, 2 unchanged
```

### Brief Format

```bash
env-diff -f brief .env.staging .env.production
```

**Output:**
```
Summary:
  Added: 1
  Removed: 1
  Changed: 5
  Unchanged: 2

Added:
  NEW_VAR

Removed:
  STAGING_VAR

Changed:
  API_KEY
  DATABASE_URL
  DEBUG
  LOG_LEVEL
  PORT
  REDIS_URL
```

### Ignore Sensitive Variables

Ignore API keys and secrets:

```bash
env-diff -i API_KEY -i SECRET -i PASSWORD .env.example .env
```

### Show Values

Display old and new values:

```bash
env-diff -s .env.staging .env.production
```

**Output:**
```
~ Changed variables:
  ~ API_KEY
    - staging-api-key-12345
    + prod-api-key-67890
  ~ DATABASE_URL
    - postgres://user:pass@staging-db.example.com:5432/staging_db
    + postgres://user:pass@prod-db.example.com:5432/prod_db
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No differences found |
| `1` | Differences found or file error |

## Use Cases

### 1. Pre-deployment Validation

Compare staging and production before deployment:

```bash
#!/bin/bash
# deploy.sh

if [ $(env-diff .env.staging .env.production | grep -c "Summary") ]; then
  echo "Configuration matches production"
else
  echo "⚠️  Configuration differs from production"
  exit 1
fi
```

### 2. Configuration Review

Review changes between environments:

```bash
# Compare example with actual configuration
env-diff .env.example .env
```

### 3. CI/CD Pipeline

Check for configuration drift:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push]

jobs:
  check-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Compare environments
        run: |
          npm install -g env-diff
          env-diff .env.staging .env.production
          if [ $? -eq 1 ]; then
            echo "Configuration changed"
            exit 1
          fi
```

### 4. Migration Planning

Identify variables to add when migrating:

```bash
env-diff .env.old .env.new | grep "^+"
```

### 5. Rollback Planning

Identify what will be lost on rollback:

```bash
env-diff .env.current .env.backup | grep "^-"
```

### 6. Security Review

Check for leaked secrets in production:

```bash
env-diff -i API_KEY .env.example .env.production
# Focus on added/changed variables that shouldn't be there
```

## Tips

### Compare with Default

```bash
# Check custom config against default
env-diff .env.default .env.local
```

### Track Changes Over Time

```bash
# Save diffs for review
env-diff .env.v1 .env.v2 > changes-v1-to-v2.txt
```

### Use in Git Hooks

```bash
# .git/hooks/pre-commit
#!/bin/bash
if [ -f .env.production ]; then
  env-diff .env.example .env.production
fi
```

### Ignore Versioning Variables

```bash
# Ignore APP_VERSION when comparing
env-diff -i APP_VERSION -i BUILD_NUMBER .env.staging .env.production
```

## Troubleshooting

### "File not found" Error

Check file paths:

```bash
ls -la .env.staging .env.production
```

### Too Much Output

Use brief format:

```bash
env-diff -f brief .env.staging .env.production
```

### Ignore Variables Not Working

Quote variables with special characters:

```bash
env-diff -i "MY-VAR" .env.staging .env.production
```

## Output Formats

### Unified Format (default)

Shows detailed diff with:
- Green (+) for added variables
- Red (-) for removed variables
- Yellow (~) for changed variables
- Gray for unchanged variables
- Values shown when `--show-values` is used

### Brief Format

Shows only:
- Summary statistics
- Lists of changed variables
- No value details

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

OpenClaw

## Links

- [GitHub Repository](https://github.com/your-org/env-diff)
- [npm Package](https://www.npmjs.com/package/env-diff)

---

**Version:** 1.0.0
**Node:** >=14.0.0
