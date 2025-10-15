import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
	// Ignore patterns
	{
		ignores: [
			'dist/',
			'node_modules/',
			'public/content/',
			'.astro/',
			'*.min.js',
			'*.bundle.js',
		],
	},

	// Base JavaScript/TypeScript configuration
	{
		...js.configs.recommended,
		files: ['**/*.{js,mjs,ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: typescriptParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
			'jsx-a11y': jsxA11y,
		},
		rules: {
			// TypeScript specific rules
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			// Disabled because CMS-driven projects need flexible types for dynamic data
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',

			// General ESLint rules
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'prefer-template': 'error',
			'no-unused-expressions': 'error',
			'no-duplicate-imports': 'error',
		},
	},

	// Astro configuration
	...astro.configs.recommended,
	{
		files: ['**/*.astro'],
		rules: {
			// Disable rules that don't work well with Astro
			'@typescript-eslint/no-unused-vars': 'off',
			'no-undef': 'off',
			// Astro specific rules
			'astro/no-conflict-set-directives': 'error',
			'astro/no-unused-define-vars-in-style': 'error',
			'astro/valid-compile': 'error',
			'astro/no-deprecated-astro-canonicalurl': 'error',
			'astro/no-deprecated-astro-fetchcontent': 'error',
			'astro/no-deprecated-astro-resolve': 'error',
			// Disabled because content is dynamically inserted from CMS via set:html
			'astro/no-unused-css-selector': 'off',
		},
	},

	// TypeScript files specific configuration
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
		},
	},

	// JavaScript files specific configuration
	{
		files: ['**/*.{js,mjs}'],
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
		},
	},

	// Config files
	{
		files: [
			'*.config.js',
			'*.config.mjs',
			'*.config.ts',
			'tailwind.config.cjs',
			'astro.config.mjs',
			'eslint.config.js',
		],
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
			'no-console': 'off',
		},
	},

	// Test files
	{
		files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
		languageOptions: {
			globals: {
				jest: 'readonly',
				vitest: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
];
