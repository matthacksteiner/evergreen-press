# Routing System

Astro uses a file-based routing system, meaning the structure of your `src/pages/` directory dictates the routes of your website. This project leverages this system along with dynamic route segments for content-driven pages and multi-language support.

## Middleware

The routing system includes a middleware layer (`src/middleware.ts`) that handles:

- **Maintenance Mode**: Automatically redirects all traffic to `/maintenance` when maintenance mode is active
- **Path Exclusions**: Certain paths (like `/preview`, `/assets`, `/favicons`) bypass maintenance mode
- **Global State Checking**: Reads maintenance toggle from CMS data on every request

For detailed maintenance mode functionality, see [Maintenance Mode](maintenance-mode.md).

## File-Based Routing

- Any `.astro`, `.md`, or `.html` file in `src/pages/` becomes a page on your site.
- For example, `src/pages/about.astro` maps to `/about/` (note the trailing slash).
- `src/pages/index.astro` maps to the homepage (`/`).

### Trailing Slash Configuration

The project is configured with `trailingSlash: 'always'` in `astro.config.mjs`, which means:

- **All page URLs end with trailing slashes**: `/about/`, `/services/web-development/`
- **Homepage remains without trailing slash**: `/`
- **Automatic URL consistency**: Astro ensures all internal links include trailing slashes
- **SEO benefits**: Consistent URL structure prevents duplicate content issues

## Dynamic Routes

The project utilizes dynamic routes to generate pages based on content fetched from the Kirby CMS.

- `src/pages/[...slug].astro`: This is a catch-all route that handles most content pages. The `slug` parameter represents the URI of a page from Kirby CMS. This file typically uses `getStaticPaths` to fetch all page URIs from the CMS at build time and generate a static page for each.
- `src/pages/[lang]/[...slug].astro`: Similar to the above, but prefixed with a language code (e.g., `/en/about`, `/de/ueber-uns`). This handles pages for different languages. The `[lang]` parameter is used to fetch content specific to that language.
- `src/pages/[section]/[...slug].astro`: Handles section-specific content pages. For example, a blog might live under `/blog/my-post-title`.
- `src/pages/[lang]/[section]/[...slug].astro`: Combines language and section parameters for multi-language section pages like `/en/blog/my-english-post`.

### How Dynamic Routes Work

Inside these dynamic route files (e.g., `[...slug].astro`), Astro's `getStaticPaths` function is used during the build process:

1.  It fetches a list of all page URIs and their corresponding languages/sections from the Kirby CMS (typically via the JSON files in `public/content/`).
2.  For each URI, it returns an object defining the `params` (like `slug`, `lang`, `section`) and optionally `props` (data to be passed to the page).
3.  Astro then generates a static HTML page for each path returned by `getStaticPaths`.

## Preview Path

- `src/pages/preview/[...slug].astro`: This special route is configured for Server-Side Rendering (SSR) even if the rest of the site is statically generated. It allows content editors to preview changes from the Kirby CMS in real-time without waiting for a full site rebuild and deployment.
  - It typically fetches content directly from the Kirby CMS API at request time.
  - Access to this path might be restricted (e.g., by IP or a token).

## Special Files

- `src/pages/404.astro`: Defines the custom 404 error page.
- `src/pages/sitemap-index.xml.js` (or similar): Programmatically generates the sitemap index, often linking to language-specific sitemaps.
- `src/pages/robots.txt.js` (or similar): Programmatically generates the `robots.txt` file.

## Internationalization (i18n) Routing

- The `[lang]` segment in routes like `src/pages/[lang]/[...slug].astro` is fundamental to the multi-language support.
- Astro's i18n configuration (in `astro.config.mjs`) defines the supported languages and the default language.
- The `lang-folder-rename` plugin might dynamically adjust the presence of the `[lang]` folder based on whether translations are available in the CMS, optimizing the build for single-language sites if no translations exist.

See the [Internationalization documentation](./internationalization.md) for more details.
