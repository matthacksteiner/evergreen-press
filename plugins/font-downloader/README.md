# Font Downloader Plugin

This plugin automatically downloads web fonts defined in your Kirby CMS configuration and makes them
available in your Astro project. **Now with intelligent caching for faster builds!**

## Dual Architecture

This plugin uses a **two-file architecture** to handle different deployment environments optimally:

### 1. `font-downloader-netlify.js` - Netlify Build Plugin

- **Purpose**: Runs as a Netlify Build Plugin during Netlify deployments
- **When**: During Netlify's build process (before Astro starts)
- **Configuration**: Registered in `netlify.toml`
- **Features**: Smart caching with configuration change detection

### 2. `fontDownloader.js` - Astro Integration

- **Purpose**: Runs as an Astro Integration for local/non-Netlify builds
- **When**: During Astro's config setup phase
- **Configuration**: Added to `astro.config.mjs`
- **Features**: Full download for local builds, development mode handling

## How it works

1. Fetches font information from your Kirby CMS via the global.json file
2. **Uses SHA-256 content hashing to detect font configuration changes**
3. Creates a `public/fonts` directory if it doesn't exist
4. Downloads WOFF and WOFF2 font files (only when configuration changes)
5. Generates a `fonts.json` file with metadata about the downloaded fonts
6. **Maintains a cache state file (`.astro/font-cache-state.json`) to track fonts**

## Features

### ✨ Smart Caching (New!)

- **Configuration change detection**: Only re-downloads when font URLs or names change
- **SHA-256 hashing**: Generates configuration fingerprints to detect modifications
- **Cache state tracking**: Maintains a history of downloaded fonts and configuration
- **Automatic fallback**: Re-downloads if cached fonts are missing
- **Performance boost**: Significantly faster builds when fonts haven't changed

### 🛡️ Reliability

- **Retry Logic**: Automatically retries failed downloads with exponential backoff
- **Timeout Protection**: Configurable timeout to prevent hanging requests
- **Robust Error Handling**: Gracefully handles network issues and server errors
- **Sequential Downloads**: Downloads fonts one at a time to avoid overwhelming the server
- **Detailed Logging**: Provides comprehensive feedback during the download process
- **Build Safety**: Continues build even if font downloads fail (on Netlify)

## Usage

The plugin is configured in two places depending on your deployment environment:

### Netlify Build Plugin (netlify.toml)

Register the Netlify Build Plugin in your `netlify.toml` file:

```toml
[build]
command = "astro build"

# Register build plugins
[[plugins]]
package = "./plugins/font-downloader"
```

### Astro Integration (astro.config.mjs)

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

**Note**: Both configurations are needed! The plugin automatically detects the environment and uses
the appropriate entry point.

### Why Two Files?

This dual architecture provides several benefits:

1. **Optimal Performance**:
   - Netlify gets smart caching with build cache persistence
   - Local builds get reliable full downloads

2. **Proper Timing**:
   - Netlify plugin runs _before_ Astro starts (ensuring fonts are available)
   - Astro integration runs during Astro's setup phase

3. **Environment Flexibility**:
   - Works seamlessly on Netlify (with advanced caching)
   - Works locally without Netlify dependencies
   - Smart development mode handling

4. **Shared Core Logic**:
   - Both entry points use the same download functions
   - No code duplication, just different integration points

## Configuration Options

| Option       | Type   | Default | Description                                                           |
| ------------ | ------ | ------- | --------------------------------------------------------------------- |
| `timeout`    | number | `30000` | Request timeout in milliseconds                                       |
| `maxRetries` | number | `3`     | Maximum number of retry attempts for failed downloads                 |
| `retryDelay` | number | `1000`  | Base delay between retries in milliseconds (uses exponential backoff) |

## How Smart Caching Works

1. **First Build**: Downloads all fonts and creates `.astro/font-cache-state.json`
2. **Subsequent Builds**:
   - Loads the previous cache state
   - Compares SHA-256 hash of font configuration
   - Only re-downloads if configuration has changed
   - Updates cache state with new configuration hash

3. **Fallback Strategy**: If cached fonts are missing from disk, automatically re-downloads them

## Cache State File

The plugin creates a `font-cache-state.json` file in your `.astro` directory:

```json
{
  "lastSync": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "configHash": "a1b2c3d4...",
  "fonts": [
    {
      "name": "Regular",
      "woff": "/fonts/font-regular.woff",
      "woff2": "/fonts/font-regular.woff2"
    }
  ]
}
```

## Build Output Examples

### Smart Cache (Configuration Unchanged)

```
🔤 [Font Downloader] Restoring font cache...
✅ [Font Downloader] Restored 2 cached font(s)
✅ [Font Downloader] Font configuration unchanged, using 2 cached font(s)
🕐 Last sync: 1/15/2024, 10:30:00 AM
```

### Configuration Changed

```
🔤 [Font Downloader] Restoring font cache...
✅ [Font Downloader] Restored 2 cached font(s)
🔄 [Font Downloader] Configuration changed, downloading fonts...
✓ [Font Downloader] Cleaned old font files
⬇  [Font Downloader] Downloading WOFF2: Regular...
✓ [Font Downloader] Downloaded WOFF2: Regular (45.3KB)
⬇  [Font Downloader] Downloading WOFF2: Black...
✓ [Font Downloader] Downloaded WOFF2: Black (48.7KB)
✨ [Font Downloader] Successfully downloaded 2 font(s)
```

### First Build

```
🔤 [Font Downloader] Restoring font cache...
📦 [Font Downloader] No cached fonts found
🔄 [Font Downloader] No cache found, downloading fonts...
⬇  [Font Downloader] Downloading WOFF2: Regular...
✓ [Font Downloader] Downloaded WOFF2: Regular (45.3KB)
✨ [Font Downloader] Successfully downloaded 2 font(s)
```

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

### Smart Cache Mode (Default)

1. Loads cache state from `.astro/font-cache-state.json`
2. Fetches font configuration from Kirby CMS
3. Compares configuration hash with cached hash
4. **If unchanged**: Verifies cached files exist, skips download
5. **If changed**: Downloads fonts sequentially:
   - Cleans old font files from `public/fonts/`
   - Downloads WOFF format (if available)
   - Downloads WOFF2 format (if available)
   - Retries failed downloads up to 3 times with exponential backoff
6. Saves successfully downloaded fonts
7. Generates `fonts.json` with metadata
8. Updates cache state with new configuration hash

## Performance Benefits

- **Faster builds**: Skips font downloads when configuration hasn't changed
- **Reduced bandwidth**: Downloads only when necessary
- **Better CI/CD**: Shorter build times in continuous deployment
- **Netlify caching**: Leverages Netlify's build cache for persistence

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

### Force Font Re-download

If you suspect caching issues, delete the cache state:

```bash
rm .astro/font-cache-state.json
```

Then rebuild:

```bash
npm run build
```

### Clear Netlify Font Cache

In Netlify's build settings, you can clear the cache to force a fresh download:

1. Go to Site Settings → Build & Deploy
2. Click "Clear cache and retry deploy"

### Socket Hang Up Errors

If you see "socket hang up" errors:

- The plugin will automatically retry (up to 3 times by default)
- Increase `maxRetries` if needed
- Increase `timeout` for slow connections
- Check your network connection and firewall settings

### Fonts Not Updating

If fonts aren't updating after changing them in Kirby:

1. Check that the font URLs in Kirby CMS have changed
2. The plugin caches based on configuration hash (names + URLs)
3. If only the font files changed but URLs stayed the same, clear the cache manually

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
