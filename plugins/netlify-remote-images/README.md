# Netlify Remote Images Plugin

This Astro plugin automatically configures Netlify's remote image optimization by updating the
`netlify.toml` file with the Kirby CMS media URL pattern.

## Purpose

Enables Netlify's Image CDN to fetch and optimize images from the remote Kirby CMS instance, which
is essential for the `/preview/` route where images are fetched directly from the CMS API.

## How It Works

1. Reads the `KIRBY_URL` environment variable
2. Updates or creates the `[images]` section in `netlify.toml`
3. Sets `remote_images = [ "{KIRBY_URL}/media/.*" ]`

This allows Netlify's on-demand Image CDN to:

- Fetch images from the remote Kirby CMS
- Optimize them (AVIF, WebP, resizing)
- Cache them at the edge
- Serve them through `/.netlify/images` endpoint

## Usage

The plugin is automatically enabled when imported in `astro.config.mjs`:

```javascript
import netlifyRemoteImages from './plugins/netlify-remote-images/index.js';

export default defineConfig({
  integrations: [
    netlifyRemoteImages(),
    // ... other integrations
  ],
});
```

## Configuration

No options are required. The plugin uses the `KIRBY_URL` environment variable automatically.

## When It Runs

- **Hook**: `astro:config:setup` (early in the build process)
- **Timing**: Before other plugins that depend on image configuration

## Compatibility

Works alongside `netlify-hybrid-images`:

- **netlify-remote-images**: Enables preview mode image fetching
- **netlify-hybrid-images**: Downloads images for production builds

Both plugins can and should run together for optimal functionality.

## Requirements

- `KIRBY_URL` environment variable must be set
- `netlify.toml` file must exist in project root

## Example Output

After running, `netlify.toml` will contain:

```toml
[images]
remote_images = [ "https://cms.example.com/media/.*" ]
```
