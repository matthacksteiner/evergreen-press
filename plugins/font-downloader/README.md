# Font Downloader Plugin

This plugin automatically downloads web fonts defined in your Kirby CMS configuration and makes them available in your Astro project.

## How it works

1. Fetches font information from your Kirby CMS via the global.json file
2. Creates a `public/fonts` directory if it doesn't exist
3. Downloads WOFF and WOFF2 font files from the URLs specified in your CMS
4. Generates a `fonts.json` file with metadata about the downloaded fonts

## Features

- Cleans old font files before downloading new ones
- Supports both WOFF and WOFF2 formats
- Generates metadata about fonts for use in your Astro components
- Always fetches font data from your Kirby CMS (local content is not supported)
- Provides detailed console feedback during the download process

## Usage

Add the plugin to your `astro.config.mjs` file:

```js
import fontDownloader from './plugins/font-downloader/fontDownloader.js';

// In your Astro config
export default defineConfig({
	integrations: [
		fontDownloader(),
		// other integrations...
	],
});
```

Make sure your `.env` file has the `KIRBY_URL` variable set:

```
KIRBY_URL=https://your-kirby-cms-url.com
```

### Using the downloaded fonts

The plugin creates a `public/fonts/fonts.json` file with metadata about all downloaded fonts. You can import this data in your components or layouts to dynamically generate @font-face declarations:

```js
import fontsData from '@public/fonts/fonts.json';

// Use fontsData.fonts to create font-face declarations
```

The font files themselves will be available at `/fonts/filename.woff` and `/fonts/filename.woff2` paths.
