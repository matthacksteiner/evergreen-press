# Netlify Hybrid Images Plugin

Fetch original Kirby media assets during `astro build` and publish them to the local `public/`
directory so Netlify's on-demand image CDN can generate responsive variants at the edge without
relying on origin fetches.

## What it does

1. Reads the cached Kirby JSON content in `public/content/`.
2. Detects media URLs that originate from `${KIRBY_URL}/media/...`.
3. Downloads each original asset into `public/media/…`, skipping already cached files when the
   source is unchanged.
4. (Optional) Rewrites the JSON content to reference the local `/media/...` path instead of the
   Kirby origin.

This hybrid approach deploys the untouched originals alongside the site bundle while still
delegating responsive image generation to Netlify's CDN.

## Usage

Register the integration in `astro.config.mjs`:

```js
import netlifyHybridImages from './plugins/netlify-hybrid-images/index.js';

export default defineConfig({
  integrations: [
    netlifyHybridImages(),
    // …
  ],
});
```

Ensure the `KIRBY_URL` environment variable is available so the plugin can detect valid media URLs.

## Configuration

| Option           | Type            | Default                         | Description                                                                    |
| ---------------- | --------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| `enabled`        | boolean         | `true`                          | Toggles the plugin.                                                            |
| `publicDir`      | string          | `'public'`                      | Root directory where Astro copies static assets.                               |
| `mediaDir`       | string          | `'media'`                       | Sub-directory inside `publicDir` where Kirby assets will be stored.            |
| `concurrency`    | number          | `2`                             | Maximum number of simultaneous downloads.                                      |
| `cacheManifest`  | string \| false | `'hybrid-images-manifest.json'` | File stored in `.netlify/` directory that stores ETag metadata between builds. |
| `skipUnchanged`  | boolean         | `true`                          | Use cached metadata to avoid re-downloading unchanged assets.                  |
| `rewriteContent` | boolean         | `true`                          | Replace Kirby media URLs in `public/content/*.json` with the local variant.    |
| `maxRetries`     | number          | `3`                             | Number of retry attempts for failed downloads.                                 |
| `retryDelay`     | number          | `1000`                          | Base delay between retries in milliseconds (uses exponential backoff).         |
| `timeout`        | number          | `30000`                         | Request timeout in milliseconds (30 seconds).                                  |

### Caching Behaviour

The plugin implements intelligent caching to minimize redundant downloads:

#### How It Works

1. **Manifest Storage**: Cache metadata is stored in `.netlify/hybrid-images-manifest.json`
   - **Location**: `.netlify/` directory (excluded from deployments and version control)
   - **Persistence**: Netlify preserves this directory between builds in the build cache
   - **Contents**: ETags, Last-Modified headers, file sizes, and timestamps for each asset

2. **Conditional Requests**: When an asset exists locally and has cached metadata:
   - Plugin sends `If-None-Match` (ETag) and `If-Modified-Since` headers
   - Kirby CMS responds with `304 Not Modified` if the asset hasn't changed
   - Plugin skips re-downloading and updates the `checkedAt` timestamp

3. **Cache Hit Rate**: The plugin logs cache performance statistics:
   ```
   ✓ Cache hit: 145/150 assets (96.7% cached)
   ```
   A high cache hit rate (>80%) indicates the caching is working correctly.

#### Troubleshooting Cache Issues

If you see a low cache hit rate or frequent re-downloads:

1. **Check Netlify Build Cache**: Ensure caching is enabled in your Netlify settings
2. **Verify Manifest Persistence**: The plugin logs when loading the manifest:

   ```
   📋 Loaded manifest with 145 cached assets
   ```

   If you see "No existing manifest found" on every build, the cache isn't persisting.

3. **Clear Cache**: If needed, you can clear Netlify's build cache from the Netlify UI
   - Go to Site Settings → Build & Deploy → Build settings → Clear cache

4. **Disable Caching Temporarily**: Set `skipUnchanged` to `false` to force full downloads:
   ```js
   netlifyHybridImages({
     skipUnchanged: false, // Forces full download
   });
   ```

**Note:** The manifest is NOT included in deployments—it's purely for build-time optimization.

### Retry Logic

The plugin automatically retries failed downloads with exponential backoff:

- **Retriable errors**: Socket hang up, connection reset, timeout, rate limiting (429)
- **Non-retriable errors**: 404 Not Found, 403 Forbidden, other 4xx client errors
- **Backoff strategy**: Each retry waits `retryDelay × attempt` milliseconds (e.g., 1s, 2s, 3s)

Disable `rewriteContent` if you only want local copies without touching the cached JSON.

### Cache-Control Headers (Recommended)

For optimal performance, configure Cache-Control headers for your downloaded media assets. This
tells Netlify's CDN how long to cache the source images.

**Option 1: Using `netlify.toml`**

```toml
[[headers]]
  for = "/media/*"
  [headers.values]
    Cache-Control = "public, max-age=604800, must-revalidate"
```

**Option 2: Using `public/_headers`**

```
/media/*
  Cache-Control: public, max-age=604800, must-revalidate
```

This example sets a 7-day cache (`max-age=604800` seconds). Adjust as needed:

- `public` - allows caching by CDN and browsers
- `max-age=604800` - cache for 7 days (604800 seconds)
- `must-revalidate` - requires revalidation when stale

The plugin will provide a helpful tip during builds if no cache headers are detected.

## Netlify Integration

### Build Process

The plugin runs during `astro build` and integrates with Netlify's build cache:

1. **Build Start**: Plugin loads the manifest from `.netlify/hybrid-images-manifest.json`
2. **Asset Check**: For each media URL, checks if local copy exists and is current
3. **Conditional Download**: Uses HTTP cache headers to skip unchanged files
4. **Manifest Update**: Saves updated metadata back to `.netlify/` directory
5. **Deployment**: Downloaded assets are included in the static bundle

### Cache Persistence

Netlify automatically preserves the `.netlify/` directory between builds:

- First build: Downloads all assets, creates manifest (~0-5 minutes depending on asset count)
- Subsequent builds: Validates cached assets using HTTP 304 responses (~10-30 seconds)
- Cache cleared: Full re-download occurs (rare, usually manual action)

### Error Handling

- **Download Failure**: Plugin retries with exponential backoff (3 attempts by default)
- **Persistent Failure**: Original Kirby URLs remain in content to avoid broken references
- **Network Issues**: Automatic retry on timeouts, socket errors, and rate limits (429)

### Fallback & Image CDN

Ensure your Kirby CMS domain is configured in `netlify.toml` for fallback scenarios:

```toml
[images]
remote_images = ["https://your-kirby-cms.com/.*"]
```

This allows Netlify's Image CDN to transform images even if the hybrid approach encounters issues.
