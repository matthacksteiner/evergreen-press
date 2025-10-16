# Font Downloader Plugin

This plugin automatically downloads web fonts defined in your Kirby CMS configuration and makes them
available in your Astro project.

## How it works

1. Fetches font information from your Kirby CMS via the global.json file
2. Creates a `public/fonts` directory if it doesn't exist
3. Downloads WOFF and WOFF2 font files from the URLs specified in your CMS
4. Generates a `fonts.json` file with metadata about the downloaded fonts

## Features

- **Retry Logic**: Automatically retries failed downloads with exponential backoff
- **Timeout Protection**: Configurable timeout to prevent hanging requests
- **Robust Error Handling**: Gracefully handles network issues and server errors
- **Sequential Downloads**: Downloads fonts one at a time to avoid overwhelming the server
- **Clean Operation**: Removes old font files before downloading new ones
- **Detailed Logging**: Provides comprehensive feedback during the download process
- **Build Safety**: Continues build even if font downloads fail (on Netlify)

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

### With Custom Options

```js
import fontDownloader from './plugins/font-downloader/fontDownloader.js';

export default defineConfig({
  integrations: [
    fontDownloader({
      timeout: 30000, // Request timeout in ms (default: 30000)
      maxRetries: 3, // Number of retry attempts (default: 3)
      retryDelay: 1000, // Base delay between retries in ms (default: 1000)
    }),
    // other integrations...
  ],
});
```

## Configuration Options

| Option       | Type   | Default | Description                                                           |
| ------------ | ------ | ------- | --------------------------------------------------------------------- |
| `timeout`    | number | `30000` | Request timeout in milliseconds                                       |
| `maxRetries` | number | `3`     | Maximum number of retry attempts for failed downloads                 |
| `retryDelay` | number | `1000`  | Base delay between retries in milliseconds (uses exponential backoff) |

## Environment Variables

Make sure your `.env` file has the `KIRBY_URL` variable set:

```
KIRBY_URL=https://your-kirby-cms-url.com
```

## Using the downloaded fonts

The plugin creates a `public/fonts/fonts.json` file with metadata about all downloaded fonts. You
can import this data in your components or layouts to dynamically generate @font-face declarations:

```js
import fontsData from '@public/fonts/fonts.json';

// Use fontsData.fonts to create font-face declarations
```

The font files themselves will be available at `/fonts/filename.woff` and `/fonts/filename.woff2`
paths.

## Error Handling

The plugin implements robust error handling:

1. **Network Errors**: Automatically retries with exponential backoff
2. **Timeout Errors**: Aborts requests that take too long
3. **Server Errors**: Logs warnings but continues with other fonts
4. **Build Safety**: On Netlify, continues build even if all fonts fail

## Download Process

1. Cleans old font files from `public/fonts/` (except `fonts.json`)
2. Fetches font metadata from Kirby CMS
3. Downloads each font sequentially:
   - WOFF format (if available)
   - WOFF2 format (if available)
4. Retries failed downloads up to 3 times with exponential backoff
5. Saves successfully downloaded fonts
6. Generates `fonts.json` with metadata

## Example Output

```bash
🔤 [Font Downloader] ✓ Cleaned old font files
🔤 [Font Downloader] ℹ Fetching font data from: https://cms.example.com
🔤 [Font Downloader] ℹ Found 2 font(s) to download
🔤 [Font Downloader] ⬇ Downloading WOFF2: regular...
🔤 [Font Downloader] ✓ Downloaded WOFF2: regular (45.3KB)
🔤 [Font Downloader] ⬇ Downloading WOFF2: black...
🔤 [Font Downloader] ✓ Downloaded WOFF2: black (48.7KB)
🔤 [Font Downloader] ✨ Successfully downloaded 2 font(s)
```

## Troubleshooting

### Socket Hang Up Errors

If you see "socket hang up" errors:

- The plugin will automatically retry (up to 3 times by default)
- Increase `maxRetries` if needed
- Increase `timeout` for slow connections
- Check your network connection and firewall settings

### Slow Downloads

If downloads are slow:

- Increase the `timeout` value
- Check your internet connection
- Verify the Kirby CMS server is responsive

### Build Failures

On Netlify, the plugin will continue the build even if fonts fail to download. In local development,
it may throw an error for easier debugging.

## Compatibility

- Requires Node.js 18+
- Works with Astro 5+
- Compatible with Netlify and other hosting providers
- Supports both WOFF and WOFF2 formats

## Performance

- Downloads fonts sequentially to avoid overwhelming the server
- Adds small delay (100ms) between font downloads
- Uses efficient retry strategy with exponential backoff
- Implements request timeout to prevent hanging
- Cleans old files to prevent disk space issues
