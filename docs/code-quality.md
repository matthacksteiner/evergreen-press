# Code Quality Configuration

This document describes the ESLint, Prettier, and EditorConfig setup for the Baukasten Astro project.

## Overview

The project uses a comprehensive code quality setup with:

- **ESLint** for code linting and static analysis
- **Prettier** for code formatting
- **EditorConfig** for consistent editor settings across team members

## Configuration Files

### ESLint Configuration (`eslint.config.js`)

The project uses ESLint v9 with the new flat config format. Key features:

- **Astro Support**: Full support for `.astro` files with astro-eslint-parser
- **TypeScript Integration**: Comprehensive TypeScript rules and type checking
- **Accessibility**: JSX a11y rules for better accessibility
- **Modern JavaScript**: ES2022+ features and best practices

### Prettier Configuration (`.prettierrc.json`)

Configured to match the existing code style:

- **Tabs**: Uses tabs for indentation (matching existing codebase)
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings
- **Line Length**: 80 characters max
- **Astro Support**: Full formatting support for `.astro` files

### EditorConfig (`.editorconfig`)

Ensures consistent settings across editors:

- **Encoding**: UTF-8 for all files
- **Line Endings**: LF (Unix-style)
- **Indentation**: Tabs for code files, spaces for config files
- **Trailing Whitespace**: Automatically trimmed

## Available Scripts

Add these scripts to your development workflow:

```bash
# Lint code (Astro check + ESLint)
npm run lint

# Lint only Astro files (type checking)
npm run lint:astro

# Lint only with ESLint
npm run lint:eslint

# Auto-fix ESLint issues and format code
npm run lint:fix

# Format all files with Prettier
npm run format

# Check if files are properly formatted
npm run format:check
```

## Development Workflow

### Before Committing

1. **Lint your code**:
   ```bash
   npm run lint
   ```

2. **Format your code**:
   ```bash
   npm run format
   ```

3. **Or combine both**:
   ```bash
   npm run lint:fix
   ```

### IDE Setup

#### VS Code

Install these extensions:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Astro** (`astro-build.astro-vscode`)
- **EditorConfig** (`editorconfig.editorconfig`)

Add to your VS Code settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "astro"
  ]
}
```

#### Other Editors

- **JetBrains IDEs**: Install Prettier and ESLint plugins
- **Vim/Neovim**: Use `coc-prettier` and `coc-eslint`
- **Sublime Text**: Install ESLint and Prettier packages

## File Patterns

### Linted Files

ESLint processes these file types:
- `.js`, `.mjs` - JavaScript files
- `.ts`, `.tsx` - TypeScript files
- `.astro` - Astro components

### Formatted Files

Prettier formats these file types:
- All ESLint-supported files
- `.json`, `.yml`, `.yaml` - Configuration files
- `.md` - Markdown documentation

### Ignored Patterns

Both tools ignore:
- `dist/` - Build output
- `node_modules/` - Dependencies
- `public/content/` - Synced content
- `.astro/` - Astro build cache
- `docs/` - Documentation (ESLint only)
- `plugins/` - Build plugins (ESLint only)

## Customization

### Adding Rules

To add new ESLint rules, edit `eslint.config.js`:

```javascript
{
  rules: {
    'your-new-rule': 'error'
  }
}
```

### Formatting Options

To modify Prettier settings, edit `.prettierrc.json`:

```json
{
  "printWidth": 120,
  "tabWidth": 4
}
```

### File-Specific Overrides

Both tools support file-specific configuration:

```javascript
// eslint.config.js
{
  files: ['*.test.js'],
  rules: {
    'no-console': 'off'
  }
}
```

```json
// .prettierrc.json
{
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "printWidth": 100
      }
    }
  ]
}
```

## Common Issues

### ESLint Errors

**Unused variables**: Prefix with underscore (`_unusedVar`) to ignore.

**Missing dependencies**: Install required packages:
```bash
npm install --save-dev package-name
```

### Prettier Conflicts

**EditorConfig vs Prettier**: Prettier settings take precedence for supported files.

**ESLint formatting rules**: Disabled in favor of Prettier formatting.

### Performance

For large codebases, consider:

- Using `.eslintignore` for build artifacts
- Running ESLint on changed files only
- Using ESLint cache: `eslint --cache`

## Tailwind CSS Integration

**Note**: The `prettier-plugin-tailwindcss` plugin has compatibility issues with the current setup. For now, Tailwind class sorting is not automatically handled by Prettier.

Manual sorting recommendations:
1. Group classes by type (layout, spacing, colors, etc.)
2. Use consistent ordering within groups
3. Consider using Tailwind's official class sorter when compatibility improves

## Continuous Integration

Add these checks to your CI pipeline:

```yaml
# .github/workflows/quality.yml
- name: Lint code
  run: npm run lint

- name: Check formatting
  run: npm run format:check
```

## Migration Notes

This setup replaces any existing ESLint/Prettier configuration. Key changes:

- **ESLint**: Upgraded to v9 with flat config
- **Prettier**: Updated to latest version with Astro support
- **Rules**: Stricter TypeScript and accessibility rules
- **Formatting**: Standardized to match existing code style

## Support

For questions or issues:

1. Check the console output for specific error messages
2. Verify all dependencies are installed: `npm install`
3. Clear caches: `rm -rf node_modules/.cache .eslintcache`
4. Restart your editor/IDE

## Resources

- [ESLint Documentation](https://eslint.org/docs/)
- [Prettier Documentation](https://prettier.io/docs/)
- [Astro ESLint Plugin](https://github.com/ota-meshi/eslint-plugin-astro)
- [EditorConfig](https://editorconfig.org/)
