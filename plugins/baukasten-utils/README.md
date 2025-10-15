# Baukasten Utilities

Shared utilities for all Baukasten Astro plugins.

## Features

- Standardized logging with consistent styling
- File system utilities for common operations
- Kirby CMS integration helpers
- Configuration management for plugins

## Usage

Import the utilities in your plugin:

```js
import {
	createPluginLogger,
	handleNetlifyError,
	getKirbyUrl,
	fetchFromKirby,
	saveJsonFile,
	createPluginConfig,
} from '../baukasten-utils/index.js';
```

### Logger Utilities

Create a consistent logger for your plugin:

```js
import { createPluginLogger } from '../baukasten-utils/index.js';
import { magenta } from 'kleur/colors';

const logger = createPluginLogger({
	name: 'My Plugin',
	emoji: '🔌',
	color: magenta,
	astroLogger: astroLogger, // Optional, from Astro hooks
});

logger.info('This is an info message');
logger.success('Operation completed');
logger.warn('Something to watch out for');
logger.error('Something went wrong', error);
```

### Kirby Utilities

Interact with the Kirby CMS:

```js
import { getKirbyUrl, fetchFromKirby } from '../baukasten-utils/index.js';

const kirbyUrl = getKirbyUrl();
const globalData = await fetchFromKirby('global.json', {
	retries: 3,
	logger,
});
```

### File Utilities

Common file system operations:

```js
import {
	ensureDirectoryExists,
	cleanDirectory,
	saveJsonFile,
	readJsonFile,
} from '../baukasten-utils/index.js';

// Create directory if it doesn't exist
ensureDirectoryExists('./public/content');

// Clean a directory but keep certain files
cleanDirectory('./public/fonts', {
	exclude: ['fonts.json'],
	recreate: true,
});

// Save JSON data
saveJsonFile('./data.json', { key: 'value' }, { indent: 2 });

// Read JSON data
const data = readJsonFile('./config.json', { defaultValue: {} });
```

### Plugin Configuration

Create standardized plugin configurations:

```js
import { createPluginConfig } from '../baukasten-utils/index.js';
import { cyan } from 'kleur/colors';

export default createPluginConfig({
	name: 'my-plugin',
	emoji: '🚀',
	color: cyan,
	defaultOptions: {
		enabled: true,
		timeout: 5000,
	},
	hooks: {
		'astro:config:setup': async ({ logger, options }) => {
			// Your setup code here
		},
		'astro:build:done': ({ logger, options }) => {
			// Your build done code here
		},
	},
});
```
