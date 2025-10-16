# Netlify Hybrid Images Plugin - Caching Implementation Review

**Date:** 2025-10-16 **Reviewed against:** Netlify Image CDN documentation and best practices

## Executive Summary

The `netlify-hybrid-images` plugin implements a custom caching strategy to download Kirby CMS media
assets during build time and serve them locally for Netlify Image CDN processing. While the
implementation is technically sound, there are opportunities to better align with Netlify's native
caching mechanisms and reduce redundancy.

## Current Implementation Analysis

### ✅ What's Working Well

1. **Conditional Request Implementation**
   - Correctly implements `If-None-Match` (ETag) and `If-Modified-Since` headers
   - Properly handles 304 (Not Modified) responses
   - Avoids unnecessary re-downloads when remote content hasn't changed

2. **Retry Logic**
   - Robust error handling with exponential backoff
   - Distinguishes between retriable and non-retriable errors
   - Proper timeout handling using AbortController
   - Handles network issues (ECONNRESET, ETIMEDOUT, socket hang up)

3. **Manifest Management**
   - Tracks metadata (ETags, Last-Modified, file size, timestamps)
   - Allows skipping unchanged assets across builds
   - Maintains integrity with proper JSON serialization

4. **Security**
   - Path traversal protection preventing `../` escapes
   - Proper URL decoding and normalization
   - Safe file system operations with directory checks

5. **Concurrency Control**
   - Bounded parallel downloads (default: 2 concurrent)
   - Efficient worker pool implementation
   - Prevents overwhelming the origin server

### ⚠️ Areas for Improvement

#### 1. **Redundant Caching Layer**

**Issue:** The plugin implements its own caching mechanism when Netlify already provides robust
image caching:

- **Netlify's Native Behavior:**
  - Transformed images are automatically cached at the edge
  - Source images are cached for future transformations
  - Cache is automatically invalidated after each deploy
  - Returns 304 for cached transformations

- **Plugin's Behavior:**
  - Downloads all images during build
  - Stores custom manifest in deployed directory
  - Implements conditional requests to origin
  - Rewrites JSON content to point to local copies

**Impact:**

- Build time increases with every media asset
- Larger deployment bundles (includes all original images)
- Duplicate caching logic that Netlify already handles

**Recommendation:**

```javascript
// Consider a hybrid approach:
// 1. Let Netlify Image CDN handle caching for most use cases
// 2. Only download critical images during build
// 3. Use Netlify's native cache invalidation instead of custom manifest
```

#### 2. **Manifest Storage Location**

**Issue:** The manifest file `.netlify-hybrid-images.json` is stored in `public/media/` which gets
deployed.

**Problems:**

- Adds unnecessary file to production bundle
- Exposes internal caching metadata to users
- Manifest size grows with number of assets

**Recommendation:**

```javascript
// Store manifest in .netlify/ directory instead
const manifestPath = '.netlify/hybrid-images-manifest.json';

// This directory is Netlify's internal folder and won't be deployed
// Add to .gitignore if not already present
```

#### 3. **Cache Invalidation Strategy**

**Issue:** Plugin doesn't align with Netlify's automatic cache invalidation on deploy.

**Netlify's Behavior:**

- After deploy: All cached images are invalidated
- Next request: Image is reprocessed and cached again
- ETags are regenerated after invalidation

**Plugin's Behavior:**

- Maintains persistent manifest across deployments
- Relies on origin ETags (Kirby CMS)
- Doesn't consider Netlify's CDN invalidation

**Recommendation:**

```javascript
// Add deployment timestamp to manifest
const manifest = {
  deployId: process.env.DEPLOY_ID || Date.now(),
  assets: {
    // ... asset metadata
  },
};

// On build, check if this is a new deploy
// If so, respect Netlify's cache invalidation
```

#### 4. **Missing Cache-Control Headers**

**Issue:** Downloaded images don't have explicit Cache-Control headers set.

**Netlify Best Practice:**

```toml
# netlify.toml
[[headers]]
  for = "/media/*"
  [headers.values]
    Cache-Control = "public, max-age=604800, must-revalidate"
```

**Recommendation:** Document this in the README or auto-generate a `_headers` file during build.

#### 5. **Remote Images Configuration**

**Issue:** Plugin doesn't verify that Kirby URL is properly configured in netlify.toml.

**Required Configuration:**

```toml
[images]
  remote_images = ["https://your-kirby-cms.com/.*"]
```

**Recommendation:**

```javascript
// Add validation step in setup
function validateNetlifyConfig(kirbyUrl) {
  const netlifyToml = readNetlifyToml();
  const remoteImages = netlifyToml?.images?.remote_images || [];
  const kirbyPattern = new RegExp(kirbyUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  const isConfigured = remoteImages.some((pattern) => new RegExp(pattern).test(kirbyUrl));

  if (!isConfigured) {
    logger.warn(
      `KIRBY_URL (${kirbyUrl}) is not configured in netlify.toml [images.remote_images].\n` +
        `Add the following to netlify.toml:\n\n` +
        `[images]\n` +
        `  remote_images = ["${kirbyUrl}/.*"]`
    );
  }
}
```

## Architectural Considerations

### Current Flow

```
Build Time:
1. Read Kirby JSON content
2. Extract media URLs
3. Download all media assets
4. Store in public/media/
5. Rewrite JSON to local paths
6. Deploy everything to Netlify

Runtime:
1. Astro component requests /media/image.jpg
2. Netlify Image CDN processes it
3. CDN caches transformed version
```

### Alternative Flow (More Aligned with Netlify)

```
Build Time:
1. Read Kirby JSON content
2. Keep original Kirby media URLs
3. Optionally: Download critical images only
4. Deploy to Netlify

Runtime:
1. Astro component requests /.netlify/images?url=kirby-cms.com/media/image.jpg
2. Netlify Image CDN fetches from origin (first time)
3. Netlify caches both source and transformed versions
4. Subsequent requests served from edge cache
```

### Hybrid Approach (Best of Both Worlds)

```javascript
// Configuration option
const defaultOptions = {
  // ...existing options

  // Strategy: 'local' | 'remote' | 'hybrid'
  strategy: 'hybrid',

  // For hybrid: Define which images to download
  localAssetPatterns: [
    '/media/pages/**/hero-*.jpg', // Hero images
    '/media/files/logos/*', // Logos
  ],

  // For hybrid: Keep remote URLs for less critical images
  remoteAssetPatterns: [
    '/media/pages/**/gallery-*.jpg', // Gallery images
  ],
};
```

## Performance Implications

### Current Implementation

**Pros:**

- ✅ All images available offline during development (if cached)
- ✅ No external dependencies at runtime
- ✅ Predictable behavior

**Cons:**

- ❌ Slower builds (downloads all images)
- ❌ Larger deployments (all originals included)
- ❌ Duplicate storage (origin + Netlify CDN)
- ❌ Manual cache invalidation logic

### Recommended Approach

**Pros:**

- ✅ Faster builds (minimal/no downloads)
- ✅ Smaller deployments
- ✅ Leverage Netlify's global CDN
- ✅ Automatic cache management

**Cons:**

- ❌ First request slower (cache miss)
- ❌ Requires proper netlify.toml configuration
- ❌ Dependent on origin availability

## Recommendations

### Priority 1: Critical Issues

1. **Move manifest outside public directory**

   ```javascript
   // Change from:
   const manifestPath = path.join(mediaOutputDir, options.cacheManifest);

   // To:
   const manifestPath = path.join(projectRoot, '.netlify', options.cacheManifest);
   ```

2. **Add netlify.toml validation**
   - Warn if Kirby URL not in `remote_images`
   - Provide exact configuration to add

3. **Document Cache-Control headers**
   - Update README with recommended headers
   - Explain interaction with Netlify CDN

### Priority 2: Optimization

4. **Implement strategy option**
   - `local`: Current behavior (download everything)
   - `remote`: Keep Kirby URLs (let Netlify fetch)
   - `hybrid`: Mix based on patterns

5. **Add deployment awareness**
   - Track deploy ID in manifest
   - Optionally force refresh on new deploys

6. **Optimize concurrency**
   - Increase default from 2 to 5-10
   - Add progress reporting for long downloads

### Priority 3: Enhancements

7. **Add cache statistics**
   - Report cache hit rate
   - Show bytes saved by skipping downloads
   - Estimate build time savings

8. **Implement selective download**
   - Add `maxFileSize` option
   - Skip downloading huge files (let Netlify fetch)
   - Download only images used in critical pages

9. **Better error recovery**
   - Partial failure handling (some succeed, some fail)
   - Graceful degradation (keep remote URLs on failure)
   - Retry failed downloads in next build

## Code Examples

### Improved Manifest Location

```javascript:plugins/netlify-hybrid-images/src/setup.js
// At the top of setup.js
const NETLIFY_DIR = path.join(projectRoot, '.netlify');
const DEFAULT_MANIFEST_NAME = 'hybrid-images-manifest.json';

// In the setup function
const manifestPath = options.cacheManifest
  ? path.join(NETLIFY_DIR, path.basename(options.cacheManifest))
  : null;

// Ensure .netlify directory exists
if (manifestPath) {
  ensureDirectoryExists(NETLIFY_DIR);
}
```

### Add Configuration Validation

```javascript:plugins/netlify-hybrid-images/src/validation.js
import fs from 'fs';
import path from 'path';
import toml from '@iarna/toml';

export function validateNetlifyToml(kirbyUrl, projectRoot, logger) {
  const tomlPath = path.join(projectRoot, 'netlify.toml');

  if (!fs.existsSync(tomlPath)) {
    logger.warn('netlify.toml not found. Remote image fetching may not work.');
    return false;
  }

  try {
    const tomlContent = fs.readFileSync(tomlPath, 'utf8');
    const config = toml.parse(tomlContent);
    const remoteImages = config?.images?.remote_images || [];

    const kirbyDomain = new URL(kirbyUrl).origin;
    const isConfigured = remoteImages.some(pattern => {
      try {
        return new RegExp(pattern).test(`${kirbyDomain}/media/test.jpg`);
      } catch {
        return false;
      }
    });

    if (!isConfigured) {
      logger.warn(
        `\n⚠️  Kirby CMS URL not found in netlify.toml remote_images\n` +
        `   Add this to netlify.toml:\n\n` +
        `   [images]\n` +
        `     remote_images = ["${kirbyDomain}/.*"]\n`
      );
      return false;
    }

    logger.info('✓ Kirby URL properly configured in netlify.toml');
    return true;
  } catch (error) {
    logger.warn(`Unable to parse netlify.toml: ${error.message}`);
    return false;
  }
}
```

### Add Strategy Option

```javascript:plugins/netlify-hybrid-images/index.js
const defaultOptions = {
  // ... existing options

  // Download strategy: 'local', 'remote', or 'hybrid'
  strategy: 'local',

  // For 'hybrid' strategy: patterns to download locally
  localPatterns: [],

  // For 'hybrid' strategy: patterns to keep as remote URLs
  remotePatterns: [],
};
```

## Testing Recommendations

1. **Test cache manifest location change**

   ```bash
   npm run build
   # Verify .netlify/hybrid-images-manifest.json exists
   # Verify public/media/.netlify-hybrid-images.json does NOT exist
   ```

2. **Test netlify.toml validation**

   ```bash
   # Remove Kirby URL from remote_images
   npm run build
   # Should see warning message

   # Add it back
   npm run build
   # Should see success message
   ```

3. **Test strategy options**
   ```javascript
   // astro.config.mjs
   netlifyHybridImages({
     strategy: 'hybrid',
     localPatterns: ['/media/pages/**/hero-*'],
     remotePatterns: ['/media/pages/**/gallery-*'],
   });
   ```

## Conclusion

The `netlify-hybrid-images` plugin is well-implemented with robust error handling and retry logic.
However, it could be significantly improved by:

1. **Better alignment with Netlify's native caching** - Reduce redundancy
2. **Correct manifest storage location** - Keep build artifacts out of deployment
3. **Configuration validation** - Help developers avoid common mistakes
4. **Flexible strategies** - Allow choosing between local, remote, or hybrid approaches

### Overall Assessment

- **Code Quality:** ⭐⭐⭐⭐⭐ (5/5) - Well-structured, clean, maintainable
- **Caching Strategy:** ⭐⭐⭐ (3/5) - Works but redundant with Netlify's built-in caching
- **Error Handling:** ⭐⭐⭐⭐⭐ (5/5) - Excellent retry logic and edge case handling
- **Documentation:** ⭐⭐⭐⭐ (4/5) - Good but missing Netlify-specific guidance
- **Netlify Integration:** ⭐⭐⭐ (3/5) - Functional but doesn't leverage platform primitives

### Priority Actions

1. ✅ **Immediate:** Move manifest to `.netlify/` directory
2. ✅ **Short-term:** Add netlify.toml validation and warnings
3. ✅ **Medium-term:** Implement strategy options (local/remote/hybrid)
4. ✅ **Long-term:** Consider removing redundant caching in favor of Netlify's native mechanisms

## References

- [Netlify Image CDN Overview](https://docs.netlify.com/build/image-cdn/overview)
- [Netlify Caching Overview](https://docs.netlify.com/build/caching/caching-overview)
- [Astro + Netlify Image CDN](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro)
- [Cache-Control Headers](https://docs.netlify.com/build/caching/caching-overview#cache-key-variation)
