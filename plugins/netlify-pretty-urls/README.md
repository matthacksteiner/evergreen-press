# Netlify Pretty URLs Plugin

This plugin ensures that the `pretty_urls = true` setting is preserved in the generated
`netlify.toml` file, fixing routing issues with SSR endpoints in preview mode.

## Problem

Older versions of the Astro Netlify adapter would sometimes override the `pretty_urls` setting in
the generated `netlify.toml`, changing it from `true` to `false`. This breaks routing for
server-side endpoints like `/preview/font-proxy`, causing 404 errors.

## Solution

This plugin runs after the build process and corrects the generated `netlify.toml` to ensure
`pretty_urls = true` is set, which is required for proper SSR endpoint routing.

## Note

**This plugin is kept for backwards compatibility.** Modern versions of the Astro Netlify adapter
(v6.5+) may no longer have this issue, but the plugin remains to ensure consistent behavior across
different versions and environments.

## Usage

Add the plugin to your `astro.config.mjs` file:

```js
import netlifyPrettyUrls from './plugins/netlify-pretty-urls/index.js';

export default defineConfig({
  integrations: [
    // ... other integrations
    netlifyPrettyUrls(),
  ],
  // ... rest of config
});
```

The plugin will automatically run after the build and fix the netlify.toml configuration if needed.

## Configuration

No configuration options are currently supported. The plugin simply ensures `pretty_urls = true` is
set in the generated netlify.toml.

## Requirements

- `@iarna/toml` package for parsing and stringifying TOML files
- Access to the generated `.netlify/netlify.toml` file
