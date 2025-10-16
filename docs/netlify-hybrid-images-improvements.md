# Netlify Hybrid Images Plugin - Implementation Guide for Improvements

This document provides specific code changes to implement the recommendations from the caching
review.

## Current Status

✅ **Already Configured:**

- `netlify.toml` has `remote_images` configuration for Kirby CMS
- Astro adapter has `imageCDN: true` enabled
- Plugin is properly registered in `astro.config.mjs`

## Implementation Roadmap

### Phase 1: Critical Fixes (Immediate)

#### 1.1 Move Manifest Outside Public Directory

**File:** `plugins/netlify-hybrid-images/index.js`

```javascript
// Change the default manifest path
const defaultOptions = {
  enabled: true,
  publicDir: 'public',
  mediaDir: 'media',
  concurrency: 2,
  // CHANGED: Remove manifest from public directory
  cacheManifest: 'hybrid-images-manifest.json', // Will be stored in .netlify/
  skipUnchanged: true,
  rewriteContent: true,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};
```

**File:** `plugins/netlify-hybrid-images/src/setup.js`

```javascript
// Add near the top of the file
const NETLIFY_DIR = '.netlify';

// Update the manifestPath calculation (around line 403)
export default async function netlifyHybridImagesSetup({ logger: astroLogger, options }) {
  // ... existing code ...

  // CHANGED: Store manifest in .netlify/ instead of public/media/
  const manifestPath = options.cacheManifest
    ? path.join(projectRoot, NETLIFY_DIR, options.cacheManifest)
    : null;

  // Ensure .netlify directory exists
  if (manifestPath) {
    ensureDirectoryExists(path.dirname(manifestPath));
  }

  // ... rest of the function
}
```

**Update `.gitignore`:**

```gitignore
# Add if not already present
.netlify/
!.netlify/edge-functions/
```

#### 1.2 Add Netlify.toml Validation

**File:** `plugins/netlify-hybrid-images/src/validation.js` (new file)

```javascript
import fs from 'fs';
import path from 'path';

/**
 * Validate that Kirby URL is configured in netlify.toml remote_images
 * @param {string} kirbyUrl
 * @param {string} projectRoot
 * @param {Object} logger
 * @returns {boolean}
 */
export function validateNetlifyToml(kirbyUrl, projectRoot, logger) {
  const tomlPath = path.join(projectRoot, 'netlify.toml');

  if (!fs.existsSync(tomlPath)) {
    logger.warn('netlify.toml not found. If using remote images, ensure it is configured.');
    return false;
  }

  try {
    const tomlContent = fs.readFileSync(tomlPath, 'utf8');

    // Simple regex to extract remote_images array
    const remoteImagesMatch = tomlContent.match(/remote_images\s*=\s*\[([\s\S]*?)\]/);

    if (!remoteImagesMatch) {
      logger.warn(
        `\n⚠️  No [images] remote_images configuration found in netlify.toml\n` +
          `   Add this to netlify.toml to allow remote image transformations:\n\n` +
          `   [images]\n` +
          `   remote_images = ["${kirbyUrl}/.*"]\n`
      );
      return false;
    }

    const patterns = remoteImagesMatch[1].split(',').map((p) => p.trim().replace(/['"]/g, ''));

    const kirbyDomain = new URL(kirbyUrl).origin;
    const isConfigured = patterns.some((pattern) => {
      try {
        // Test if pattern would match Kirby media URLs
        const regex = new RegExp(pattern.replace(/\\\./g, '.'));
        return regex.test(`${kirbyDomain}/media/test.jpg`);
      } catch {
        return false;
      }
    });

    if (!isConfigured) {
      logger.warn(
        `\n⚠️  Kirby CMS domain not found in netlify.toml remote_images\n` +
          `   Current: ${patterns.join(', ')}\n` +
          `   Expected pattern that matches: ${kirbyDomain}/.*\n\n` +
          `   Update netlify.toml to include:\n` +
          `   remote_images = ["${kirbyDomain}/.*"]\n`
      );
      return false;
    }

    logger.info('✓ Kirby domain properly configured in netlify.toml');
    return true;
  } catch (error) {
    logger.warn(`Unable to validate netlify.toml: ${error.message}`);
    return false;
  }
}

/**
 * Check if Cache-Control headers are configured for media files
 * @param {string} projectRoot
 * @param {string} mediaDir
 * @param {Object} logger
 */
export function checkCacheHeaders(projectRoot, mediaDir, logger) {
  const tomlPath = path.join(projectRoot, 'netlify.toml');
  const headersPath = path.join(projectRoot, 'public', '_headers');

  let hasHeaders = false;

  // Check netlify.toml
  if (fs.existsSync(tomlPath)) {
    const tomlContent = fs.readFileSync(tomlPath, 'utf8');
    if (tomlContent.includes(`for = "/${mediaDir}/`)) {
      hasHeaders = true;
    }
  }

  // Check _headers file
  if (fs.existsSync(headersPath)) {
    const headersContent = fs.readFileSync(headersPath, 'utf8');
    if (headersContent.includes(`/${mediaDir}/`)) {
      hasHeaders = true;
    }
  }

  if (!hasHeaders) {
    logger.info(
      `\n💡 Tip: Add Cache-Control headers for better performance:\n\n` +
        `   In netlify.toml:\n` +
        `   [[headers]]\n` +
        `     for = "/${mediaDir}/*"\n` +
        `     [headers.values]\n` +
        `       Cache-Control = "public, max-age=604800, must-revalidate"\n\n` +
        `   Or in public/_headers:\n` +
        `   /${mediaDir}/*\n` +
        `     Cache-Control: public, max-age=604800, must-revalidate\n`
    );
  }
}
```

**File:** `plugins/netlify-hybrid-images/src/setup.js`

```javascript
// Add import at top
import { validateNetlifyToml, checkCacheHeaders } from './validation.js';

// Add validation in setup function (around line 392)
export default async function netlifyHybridImagesSetup({ logger: astroLogger, options }) {
  const logger = createPluginLogger({
    name: 'Hybrid Images',
    emoji: '🖼️',
    color: cyan,
    astroLogger,
  });

  if (!options.enabled) {
    logger.info('Plugin disabled via configuration');
    return;
  }

  try {
    const kirbyUrl = getKirbyUrl();

    if (!kirbyUrl) {
      logger.warn('KIRBY_URL is not defined. Skipping hybrid image caching.');
      return;
    }

    // ADDED: Validate netlify.toml configuration
    validateNetlifyToml(kirbyUrl, projectRoot, logger);

    // ADDED: Check for Cache-Control headers
    checkCacheHeaders(projectRoot, options.mediaDir, logger);

    // ... rest of the function
  } catch (error) {
    // ... error handling
  }
}
```

### Phase 2: Enhancements (Short-term)

#### 2.1 Add Build Statistics

**File:** `plugins/netlify-hybrid-images/src/setup.js`

```javascript
// Add after download completion (around line 507)
if (downloadResult.success > 0) {
  logger.info(
    `Cached ${downloadResult.success} media asset${
      downloadResult.success === 1 ? '' : 's'
    } to /${options.mediaDir}`
  );
}

if (downloadResult.skipped > 0) {
  // Calculate bytes and time saved
  const savedAssets = Array.from(assetMap.values()).filter(
    (asset) => asset.metadata && fs.existsSync(asset.filePath)
  );
  const savedBytes = savedAssets.reduce((sum, asset) => sum + (asset.metadata.size || 0), 0);
  const savedMB = (savedBytes / 1024 / 1024).toFixed(2);

  logger.info(
    `Skipped re-downloading ${downloadResult.skipped} cached asset${
      downloadResult.skipped === 1 ? '' : 's'
    } (~${savedMB} MB saved)`
  );
}
```

#### 2.2 Increase Default Concurrency

**File:** `plugins/netlify-hybrid-images/index.js`

```javascript
const defaultOptions = {
  enabled: true,
  publicDir: 'public',
  mediaDir: 'media',
  concurrency: 5, // CHANGED: Increased from 2 to 5
  cacheManifest: 'hybrid-images-manifest.json',
  skipUnchanged: true,
  rewriteContent: true,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};
```

#### 2.3 Add Progress Reporting

**File:** `plugins/netlify-hybrid-images/src/setup.js`

```javascript
// Update downloadWithConcurrency function
async function downloadWithConcurrency(
  assets,
  concurrency,
  logger,
  maxRetries,
  retryDelay,
  timeout,
  skipUnchanged
) {
  if (!assets.length) {
    return {
      success: 0,
      skipped: 0,
      failed: 0,
      manifestUpdates: new Map(),
      manifestRemovals: new Set(),
    };
  }

  const boundedConcurrency = Math.max(1, concurrency);
  const total = assets.length;
  let index = 0;
  let completed = 0; // ADDED
  let success = 0;
  let skipped = 0;
  let failed = 0;
  const manifestUpdates = new Map();
  const manifestRemovals = new Set();

  const workers = Array.from({ length: Math.min(boundedConcurrency, assets.length) }, () =>
    (async () => {
      while (index < assets.length) {
        const currentIndex = index++;
        const asset = assets[currentIndex];
        if (!asset) {
          break;
        }
        const result = await downloadAsset(
          asset,
          logger,
          maxRetries,
          retryDelay,
          timeout,
          skipUnchanged
        );
        if (result.status === 'downloaded') {
          success++;
        } else if (result.status === 'skipped') {
          skipped++;
        } else {
          failed++;
        }

        if (result.metadata) {
          manifestUpdates.set(asset.cacheKey, {
            ...result.metadata,
            remoteUrl: asset.remoteUrl,
            localPath: asset.localPath,
          });
        }

        if (result.status === 'failed') {
          manifestRemovals.add(asset.cacheKey);
        }

        // ADDED: Progress reporting
        completed++;
        if (completed % 10 === 0 || completed === total) {
          const percent = Math.round((completed / total) * 100);
          logger.info(
            `Progress: ${completed}/${total} (${percent}%) - ` +
              `✓ ${success} cached, ⊘ ${skipped} skipped, ✗ ${failed} failed`
          );
        }
      }
    })()
  );

  await Promise.all(workers);
  return { success, skipped, failed, manifestUpdates, manifestRemovals };
}
```

### Phase 3: Strategy Options (Medium-term)

#### 3.1 Add Strategy Configuration

**File:** `plugins/netlify-hybrid-images/index.js`

```javascript
const defaultOptions = {
	enabled: true,
	publicDir: 'public',
	mediaDir: 'media',
	concurrency: 5,
	cacheManifest: 'hybrid-images-manifest.json',
	skipUnchanged: true,
	rewriteContent: true,
	maxRetries: 3,
	retryDelay: 1000,
	timeout: 30000,

	// ADDED: Strategy options
	/**
	 * Download strategy:
	 * - 'local': Download all images (current behavior)
	 * - 'remote': Keep Kirby URLs, let Netlify Image CDN fetch
	 * - 'hybrid': Download based on patterns
	 */
	strategy: 'local',

	/**
	 * For 'hybrid' strategy: glob patterns to download locally
	 * Example: ['**/hero-*.{jpg,png}', '**/logo.*']
	 */
	localPatterns: [],

	/**
	 * For 'hybrid' strategy: skip downloading large files
	 * Let Netlify Image CDN fetch them on-demand
	 */
	maxFileSizeToCache: null, // in bytes, null = no limit
};
```

**File:** `plugins/netlify-hybrid-images/src/strategy.js` (new file)

```javascript
import { minimatch } from 'minimatch';

/**
 * Determine if an asset should be downloaded based on strategy
 * @param {Object} asset
 * @param {Object} options
 * @returns {boolean}
 */
export function shouldDownloadAsset(asset, options) {
  const { strategy, localPatterns, maxFileSizeToCache } = options;

  // Strategy: remote - don't download anything
  if (strategy === 'remote') {
    return false;
  }

  // Strategy: local - download everything (current behavior)
  if (strategy === 'local') {
    return true;
  }

  // Strategy: hybrid - download based on patterns
  if (strategy === 'hybrid') {
    // Check file size limit
    if (maxFileSizeToCache && asset.metadata?.size > maxFileSizeToCache) {
      return false;
    }

    // If no patterns specified, download everything
    if (!localPatterns || localPatterns.length === 0) {
      return true;
    }

    // Check if asset matches any local pattern
    const assetPath = asset.localPath;
    return localPatterns.some((pattern) => minimatch(assetPath, pattern));
  }

  // Default: download
  return true;
}

/**
 * Filter assets based on download strategy
 * @param {Map} assetMap
 * @param {Object} options
 * @param {Object} logger
 * @returns {Array}
 */
export function filterAssetsByStrategy(assetMap, options, logger) {
  const allAssets = Array.from(assetMap.values());

  if (options.strategy === 'local') {
    return allAssets;
  }

  const toDownload = allAssets.filter((asset) => shouldDownloadAsset(asset, options));

  const skipped = allAssets.length - toDownload.length;

  if (options.strategy === 'remote') {
    logger.info(`Strategy: remote - keeping ${allAssets.length} remote URLs (no downloads)`);
  } else if (options.strategy === 'hybrid') {
    logger.info(
      `Strategy: hybrid - downloading ${toDownload.length} assets, ` +
        `keeping ${skipped} as remote URLs`
    );
  }

  return toDownload;
}
```

**File:** `plugins/netlify-hybrid-images/src/setup.js`

```javascript
// Add import
import { filterAssetsByStrategy } from './strategy.js';

// Update download logic (around line 499)
logger.info(
  `Preparing to cache ${assetMap.size} media asset${assetMap.size === 1 ? '' : 's'} locally`
);

// ADDED: Filter assets based on strategy
const assetsToDownload = filterAssetsByStrategy(assetMap, options, logger);

if (assetsToDownload.length === 0) {
  logger.info('No assets to download based on current strategy');
  return;
}

const downloadResult = await downloadWithConcurrency(
  assetsToDownload, // CHANGED: Use filtered list
  options.concurrency,
  logger,
  options.maxRetries || 3,
  options.retryDelay || 1000,
  options.timeout || 30000,
  skipUnchanged
);
```

### Phase 4: Documentation Updates

#### 4.1 Update README

**File:** `plugins/netlify-hybrid-images/README.md`

Add the following sections:

````markdown
## Strategy Options

The plugin supports three download strategies:

### Local Strategy (Default)

Downloads all media assets during build time.

```js
netlifyHybridImages({
  strategy: 'local', // Download everything
});
```
````

**Pros:**

- All images available offline
- No runtime dependencies on Kirby CMS
- Predictable behavior

**Cons:**

- Slower builds
- Larger deployments

### Remote Strategy

Keeps Kirby URLs, lets Netlify Image CDN fetch on-demand.

```js
netlifyHybridImages({
  strategy: 'remote', // Don't download, keep remote URLs
  rewriteContent: false, // Keep original URLs
});
```

**Pros:**

- Fast builds
- Small deployments
- Leverages Netlify's global CDN

**Cons:**

- First request slower (cache miss)
- Requires Kirby CMS to be available

**Required:** Add Kirby domain to `netlify.toml`:

```toml
[images]
  remote_images = ["https://your-kirby-cms.com/.*"]
```

### Hybrid Strategy

Mix of local and remote based on patterns.

```js
netlifyHybridImages({
  strategy: 'hybrid',
  localPatterns: [
    '**/hero-*.{jpg,png}', // Download hero images
    '**/logo.*', // Download logos
  ],
  maxFileSizeToCache: 1024 * 1024 * 2, // Max 2MB
});
```

**Best for:**

- Critical images downloaded (hero, logo)
- Gallery/secondary images kept remote
- Large files fetched on-demand

## Caching Behavior

### Build Cache

The plugin uses a manifest file (`.netlify/hybrid-images-manifest.json`) to track:

- ETag from remote server
- Last-Modified timestamp
- File size and download date

On subsequent builds, the plugin sends conditional requests:

- `If-None-Match: {etag}`
- `If-Modified-Since: {timestamp}`

If the remote server responds with `304 Not Modified`, the download is skipped.

### Netlify CDN Cache

Netlify Image CDN automatically:

- Caches transformed images at the edge
- Caches source images for future transformations
- Invalidates cache on new deploys
- Returns `304` for cached transformations

### Recommended Cache-Control Headers

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/media/*"
  [headers.values]
    Cache-Control = "public, max-age=604800, must-revalidate"
```

Or to `public/_headers`:

```
/media/*
  Cache-Control: public, max-age=604800, must-revalidate
```

This tells Netlify's CDN to cache source images for 7 days.

## Integration with Netlify Image CDN

This plugin works alongside Netlify's native Image CDN:

1. **Build time:** Plugin downloads originals to `public/media/`
2. **Deploy:** Originals are deployed with your site
3. **Runtime:** Netlify Image CDN processes and caches transformations

### Astro Component Usage

```astro
---
import { Image } from 'astro:assets';
---

<!-- Automatic optimization via Netlify Image CDN -->
<Image src="/media/pages/home/hero.jpg" alt="Hero image" width={1200} height={800} />

<!-- Manual transformation parameters -->
<img
  src="/.netlify/images?url=/media/pages/home/hero.jpg&w=800&fit=cover&fm=webp"
  alt="Hero image"
/>
```

## Troubleshooting

### "Remote images not configured" warning

**Problem:** Plugin warns about missing `remote_images` configuration.

**Solution:** Add your Kirby domain to `netlify.toml`:

```toml
[images]
  remote_images = ["https://your-kirby-cms.com/.*"]
```

### Images not updating after content change

**Problem:** Old images still showing despite updating in Kirby.

**Solutions:**

1. Clear build cache: Deploy with "Clear cache and deploy"
2. Force re-download: Set `skipUnchanged: false` temporarily
3. Check ETag: Ensure Kirby sends proper ETag headers

### Build times too long

**Problem:** Build takes too long downloading images.

**Solutions:**

1. Use `hybrid` strategy for selective downloads
2. Increase `concurrency` (default: 5)
3. Set `maxFileSizeToCache` to skip large files
4. Consider `remote` strategy for development

### Download failures

**Problem:** Some images fail to download.

**Solutions:**

1. Check network connectivity to Kirby CMS
2. Increase `timeout` (default: 30000ms)
3. Increase `maxRetries` (default: 3)
4. Check Kirby CMS rate limiting

## Performance Optimization

### Build Performance

```js
netlifyHybridImages({
  // Increase concurrent downloads
  concurrency: 10,

  // Use hybrid strategy
  strategy: 'hybrid',
  localPatterns: ['**/hero-*', '**/logo.*'],

  // Skip large files
  maxFileSizeToCache: 1024 * 1024 * 5, // 5MB limit
});
```

### Runtime Performance

1. **Use Netlify Image CDN transformations:**

   ```html
   <img src="/.netlify/images?url=/media/image.jpg&w=400&fm=webp" />
   ```

2. **Set appropriate Cache-Control headers** (see above)

3. **Use WebP/AVIF for better compression:**
   ```html
   <picture>
     <source srcset="/.netlify/images?url=/media/image.jpg&fm=avif" type="image/avif" />
     <source srcset="/.netlify/images?url=/media/image.jpg&fm=webp" type="image/webp" />
     <img src="/media/image.jpg" alt="Fallback" />
   </picture>
   ```

````

## Testing Changes

### Test Phase 1 (Critical Fixes)

```bash
# 1. Clean existing build
rm -rf dist .netlify public/media/.netlify-hybrid-images.json

# 2. Build and verify manifest location
npm run build

# 3. Check that manifest is in correct location
ls -la .netlify/hybrid-images-manifest.json  # Should exist
ls -la public/media/.netlify-hybrid-images.json  # Should NOT exist

# 4. Check validation warnings in build output
# Should see either:
# - "✓ Kirby domain properly configured in netlify.toml"
# - Or warning with configuration instructions
````

### Test Phase 2 (Enhancements)

```bash
# Test build statistics
npm run build
# Look for:
# - "Skipped re-downloading X cached assets (~Y MB saved)"
# - Progress percentages during download
```

### Test Phase 3 (Strategy Options)

```javascript
// Test remote strategy
// astro.config.mjs
netlifyHybridImages({
  strategy: 'remote',
  rewriteContent: false,
})

// Build and verify no downloads occurred
npm run build

// Test hybrid strategy
netlifyHybridImages({
  strategy: 'hybrid',
  localPatterns: ['**/logo.*'],
})

// Build and verify only matching files downloaded
npm run build
```

## Rollout Plan

1. **Week 1:** Implement Phase 1 (critical fixes)
   - Move manifest outside public/
   - Add validation warnings
   - Test thoroughly

2. **Week 2:** Implement Phase 2 (enhancements)
   - Add build statistics
   - Increase concurrency
   - Add progress reporting

3. **Week 3:** Implement Phase 3 (strategy options)
   - Add strategy configuration
   - Test all three strategies
   - Update documentation

4. **Week 4:** Monitor and optimize
   - Collect feedback
   - Fine-tune defaults
   - Address edge cases

## Dependencies to Add

```bash
# For glob pattern matching (Phase 3)
npm install minimatch --save
```

## Summary of Changes

| File                | Change                           | Phase |
| ------------------- | -------------------------------- | ----- |
| `index.js`          | Update default manifest path     | 1     |
| `index.js`          | Add strategy options             | 3     |
| `index.js`          | Increase default concurrency     | 2     |
| `src/setup.js`      | Update manifest storage location | 1     |
| `src/setup.js`      | Add validation calls             | 1     |
| `src/setup.js`      | Add build statistics             | 2     |
| `src/setup.js`      | Add progress reporting           | 2     |
| `src/setup.js`      | Add strategy filtering           | 3     |
| `src/validation.js` | Create new file                  | 1     |
| `src/strategy.js`   | Create new file                  | 3     |
| `README.md`         | Update documentation             | 4     |
| `.gitignore`        | Add .netlify/ directory          | 1     |
| `package.json`      | Add minimatch dependency         | 3     |
