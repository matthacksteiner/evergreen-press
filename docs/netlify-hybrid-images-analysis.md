# Netlify Hybrid Images Plugin - Implementation Analysis

## Overview

The `netlify-hybrid-images` plugin downloads Kirby media assets during build time to the local
`public/media/` directory, allowing Netlify's Image CDN to process them without fetching from the
origin server.

## Current Implementation Status

### ✅ What's Working

1. **Plugin Structure**: The plugin is correctly structured using the baukasten-utils framework
2. **Hook Usage**: Uses `astro:build:start` hook which runs after config setup
3. **Download Logic**: Properly downloads images with concurrency control
4. **URL Resolution**: Correctly parses and normalizes Kirby media URLs
5. **Content Rewriting**: Can rewrite JSON content to use local paths

### ⚠️ Issues Identified

#### 1. Plugin Conflict: Remote vs Hybrid Images

**Problem**: Both `netlify-remote-images` and `netlify-hybrid-images` plugins are enabled
simultaneously.

- **netlify-remote-images**: Configures Netlify to fetch and process images directly from Kirby
  origin
- **netlify-hybrid-images**: Downloads images locally to avoid origin fetches

These approaches are **mutually exclusive**:

- If using hybrid (local) images, the `remote_images` configuration is unnecessary
- The `remote_images` setting in netlify.toml only applies to external domains
- Local images (served from `/media/`) don't require remote image authorization

**Current Config**:

```javascript
// astro.config.mjs
integrations: [
  netlifyHybridImages(), // Downloads images locally
  netlifyRemoteImages(), // Configures remote image access
];
```

```toml
# netlify.toml
[images]
remote_images = [ "https://cms.baukasten.matthiashacksteiner.net/media/.*" ]
```

**Resolution**: Choose ONE approach:

**Option A: Hybrid Images (Recommended)**

- Keep `netlifyHybridImages()`
- Remove `netlifyRemoteImages()` from integrations
- Remove `[images]` section from netlify.toml
- Images are downloaded during build and served locally

**Option B: Remote Images**

- Remove `netlifyHybridImages()` from integrations
- Keep `netlifyRemoteImages()`
- Keep `[images]` section in netlify.toml
- Images are fetched from Kirby on-demand

#### 2. Hook Execution Order

**Current Order**:

1. `astro-kirby-sync` at `astro:config:setup` (Astro integration) OR `onPreBuild` (Netlify Build
   Plugin)
2. `netlify-remote-images` at `astro:config:setup`
3. `netlify-hybrid-images` at `astro:build:start`

**Analysis**: The order is correct. In Netlify builds:

- `onPreBuild` runs first and syncs content to `public/content/`
- `astro:build:start` runs when Astro build starts, after content is synced
- The hybrid images plugin will find the synced JSON files

**Status**: ✅ No issue

#### 3. Picture Component Compatibility

**Analysis of Picture.astro**:

```javascript
function createNetlifyImageUrl(source, width, height, format = 'avif'): string {
  return `/.netlify/images?url=${encodeURIComponent(
    source
  )}&w=${width}&h=${height}&fit=cover&fm=${format}&q=70`;
}
```

**How it works**:

- Takes a source URL (e.g., `/media/pages/home/image.jpg`)
- Encodes it and passes to Netlify Image CDN
- Netlify fetches from the local public directory and processes the image

**Compatibility**: ✅ Works correctly with local images

- Netlify Image CDN can process local images from the `dist/` directory
- The `url` parameter can be a local path like `/media/...`
- No remote_images configuration needed for local paths

#### 4. Environment Detection

**Current Logic**:

```javascript
const isProduction = import.meta.env.PROD;
const isNetlifyDev = Boolean(import.meta.env.NETLIFY_DEV);
const useNetlifyImageProcessing = isProduction || isNetlifyDev;
```

**Analysis**:

- ✅ Correctly enables Netlify processing in production
- ✅ Enables processing in Netlify Dev environment
- ⚠️ In local dev, images won't be processed but will use original URLs

## Recommendations

### Immediate Actions

1. **Remove Plugin Conflict**

   ```javascript
   // astro.config.mjs
   integrations: [
     astroKirbySync(),
     // ... other integrations
     netlifyHybridImages(),
     // netlifyRemoteImages(), // ❌ REMOVE THIS
     netlifyPrettyUrls(),
   ],
   ```

2. **Remove Remote Images Config**

   ```toml
   # netlify.toml
   # [images]  # ❌ REMOVE THIS SECTION
   # remote_images = [ "https://cms.baukasten.matthiashacksteiner.net/media/.*" ]
   ```

3. **Update Image Domains Config** (Optional cleanup)
   ```javascript
   // astro.config.mjs
   image: {
     // domains: [API_URL], // Not needed for local images
   },
   ```

### Testing Checklist

- [ ] Remove netlify-remote-images plugin
- [ ] Remove remote_images from netlify.toml
- [ ] Run `npm run build` locally
- [ ] Verify images are downloaded to `public/media/`
- [ ] Verify JSON content URLs are rewritten to `/media/...`
- [ ] Check that Picture component generates correct Netlify CDN URLs
- [ ] Deploy to Netlify and verify images load correctly
- [ ] Test image optimization (check Network tab for `.avif` format)
- [ ] Verify different screen sizes load appropriate image sizes

## Architecture Benefits

### With Hybrid Images Approach

**Pros**:

- ✅ Faster builds (no on-demand fetching from Kirby)
- ✅ Better reliability (no dependency on Kirby availability)
- ✅ Improved performance (images served from Netlify CDN edge)
- ✅ Better caching (images part of the deployment bundle)
- ✅ Reduced load on Kirby server

**Cons**:

- ⚠️ Larger deployment size (all images included)
- ⚠️ Longer build times (downloads all images)

### Current Hybrid Images Implementation Quality

**Score: 8/10**

**Strengths**:

- Well-structured with proper error handling
- Concurrent downloads for performance
- Proper path normalization and security checks
- Optional content rewriting
- Good logging and feedback

**Areas for Improvement**:

- Documentation could clarify plugin conflict
- Could add option to skip already-downloaded images
- Could add image optimization/compression option

## Conclusion

The `netlify-hybrid-images` plugin is **well-implemented** and **compatible** with the Picture and
ImageComponent components. The main issue is the **conflicting configuration** with
`netlify-remote-images`, which should be resolved by choosing one approach.

**Recommended Action**: Remove `netlify-remote-images` plugin and related config to use the hybrid
approach exclusively.
