# Netlify Hybrid Images - Configuration Fix Summary

**Date:** October 16, 2025 **Status:** ✅ Fixed and Verified

## Issue Identified

The project had conflicting image handling plugins enabled simultaneously:

1. **netlify-hybrid-images** - Downloads images locally during build
2. **netlify-remote-images** - Configures Netlify to fetch images from Kirby CMS on-demand

These two approaches are mutually exclusive and caused unnecessary configuration complexity.

## Changes Made

### 1. Removed `netlify-remote-images` Plugin

**File:** `astro.config.mjs`

```diff
- import netlifyRemoteImages from './plugins/netlify-remote-images/index.js';
  import netlifyHybridImages from './plugins/netlify-hybrid-images/index.js';
```

```diff
  integrations: [
    astroKirbySync(),
    // ... other integrations
    netlifyHybridImages(),
-   netlifyRemoteImages(),
    netlifyPrettyUrls(),
    // ... remaining integrations
  ],
```

### 2. Removed Remote Images Configuration

**File:** `netlify.toml`

```diff
  [build.environment]
  NODE_VERSION = "23"

- [images]
- remote_images = [ "https://cms.baukasten.matthiashacksteiner.net/media/.*" ]

  [dev]
    autoLaunch = false
```

### 3. Cleaned Up Image Domains Configuration

**File:** `astro.config.mjs`

```diff
- image: {
-   domains: [API_URL],
- },
  adapter: netlify({
    imageCDN: true,
  }),
```

The `image.domains` configuration is not needed when using local images with the hybrid approach.

## Verification

### Build Test Results

✅ **Plugin Execution:**

```
🖼️ [Hybrid Images] Scanning 87 JSON files for Kirby media references
🖼️ [Hybrid Images] Preparing to cache 82 media assets locally
🖼️ [Hybrid Images] Cached 82 media assets to /media
🖼️ [Hybrid Images] ✓ Rewrote media URLs in 61 JSON files
🖼️ [Hybrid Images] ✓ Hybrid image caching completed
```

✅ **Image Downloads:**

- 82 media assets downloaded successfully
- All images stored in `public/media/`
- Organized in subdirectories: `pages/`, `site/`

✅ **URL Rewriting:**

- JSON files updated with local paths
- URLs changed from `https://cms.baukasten.../media/...` to `/media/...`
- 61 files rewritten successfully

✅ **Build Output:**

- No errors or warnings
- Images render correctly with Netlify Image CDN URLs
- Responsive variants generated (1x, 2x)
- Modern formats used (AVIF with fallback)

### Example Generated URLs

**In JSON (after rewrite):**

```json
{
  "url": "/media/pages/home/7b76e83123-1756396084/image-1.png",
  "urlFocus": "/media/pages/home/7b76e83123-1756396084/image-1-896x896-crop-x-0-5-y-0-5.webp"
}
```

**In HTML (Netlify Image CDN):**

```html
<img
  src="/.netlify/images?url=%2Fmedia%2Fpages%2Fhome%2F7b76e83123-1756396084%2Fimage-1.png&w=212&h=212&fit=cover&fm=avif&q=70"
/>
```

## Benefits of Hybrid Images Approach

### Performance

- ✅ **Faster Builds:** No on-demand fetching from Kirby required
- ✅ **Better Reliability:** No dependency on Kirby CMS availability during runtime
- ✅ **Improved Load Times:** Images served from Netlify CDN edge locations

### Scalability

- ✅ **Edge Optimization:** Netlify Image CDN handles all transformations
- ✅ **Responsive Images:** Automatic generation of multiple sizes and formats
- ✅ **Modern Formats:** AVIF and WebP support with fallbacks

### Maintenance

- ✅ **Simplified Configuration:** Single plugin approach
- ✅ **Fewer Moving Parts:** No remote image authorization needed
- ✅ **Clear Separation:** Build-time downloads, runtime optimization

## Plugin Architecture

### Current Flow

```
1. Build Start
   ↓
2. astro-kirby-sync (onPreBuild)
   - Syncs JSON content from Kirby
   - Stores in public/content/
   ↓
3. netlify-hybrid-images (astro:build:start)
   - Scans JSON files for media URLs
   - Downloads images from Kirby
   - Stores in public/media/
   - Rewrites JSON URLs to local paths
   ↓
4. Astro Build
   - Generates HTML with Picture components
   - Creates Netlify Image CDN URLs
   ↓
5. Deploy to Netlify
   - Images in dist/media/
   - Netlify Image CDN processes on-demand
```

### Key Components

**1. netlify-hybrid-images Plugin**

- Hook: `astro:build:start`
- Downloads: 82 media assets
- Rewrites: 61 JSON files
- Concurrency: 4 simultaneous downloads

**2. Picture.astro Component**

- Generates responsive `<picture>` elements
- Creates Netlify Image CDN URLs
- Supports multiple breakpoints and DPR
- Uses AVIF format with fallbacks

**3. ImageComponent.astro**

- Wrapper for Picture component
- Adds captions, copyright, lightbox
- Handles overlay effects
- Manages zoom functionality

## Configuration Files

### Final astro.config.mjs

```javascript
export default defineConfig({
  // ... other config
  integrations: [
    astroKirbySync(),
    tailwind({ nesting: true, config: { path: './src/overrides/tailwind.config.cjs' } }),
    icon(),
    langFolderRename(),
    fontDownloader(),
    netlifyHybridImages(), // ✅ Hybrid images only
    netlifyPrettyUrls(),
    compress({ HTML: true, JavaScript: true, CSS: true, Image: false, SVG: true }),
  ],
  adapter: netlify({
    imageCDN: true, // ✅ Enable Netlify Image CDN
  }),
  // ... rest of config
});
```

### Final netlify.toml

```toml
[build]
command = "astro build"
base = "/"
publish = "dist"

[[plugins]]
package = "./plugins/astro-kirby-sync"

[build.processing.html]
pretty_urls = true

[build.environment]
NODE_VERSION = "23"

[dev]
  autoLaunch = false

# ✅ No [images] section needed - using local images
```

## Testing Checklist

- [x] Remove netlify-remote-images plugin from astro.config.mjs
- [x] Remove remote_images from netlify.toml
- [x] Remove image.domains configuration
- [x] Run `npm run build` locally
- [x] Verify images downloaded to public/media/
- [x] Verify JSON content URLs rewritten to /media/...
- [x] Check Picture component generates correct Netlify CDN URLs
- [x] Confirm no build errors or warnings
- [x] Validate responsive image variants generated
- [x] Test AVIF format support

## Next Steps

### For Production Deployment

1. **Commit Changes:**

   ```bash
   git add astro.config.mjs netlify.toml
   git commit -m "fix: remove conflicting netlify-remote-images plugin"
   ```

2. **Push to Netlify:**
   - Deployment will use hybrid images approach
   - Images bundled with deployment
   - Netlify Image CDN handles optimization

3. **Monitor Performance:**
   - Check build times (may be longer due to image downloads)
   - Verify deployment size (includes all images)
   - Test image loading speeds

### Optional Improvements

1. **Add Skip Logic:**
   - Modify plugin to skip already-downloaded images
   - Would speed up incremental builds

2. **Add Compression:**
   - Optionally compress images during download
   - Further reduce deployment size

3. **Add Cleanup:**
   - Remove unused images from previous builds
   - Keep media directory lean

## Conclusion

The `netlify-hybrid-images` plugin is now properly configured and working without conflicts. The
hybrid approach provides the best balance of performance, reliability, and scalability for this
project.

**Status:** ✅ Production Ready

**Documentation:**

- [Plugin Analysis](./netlify-hybrid-images-analysis.md)
- [Plugin README](../plugins/netlify-hybrid-images/README.md)
