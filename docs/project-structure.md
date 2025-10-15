# Project Structure

The Baukasten-Astro project follows a modular and organized structure to facilitate development and maintenance. Here's an overview of the key directories and their purposes:

```
src/
  blocks/        - Content block components (BlockText, BlockImage, BlockVideo, etc.)
  components/    - Reusable UI components (buttons, cards, navigation, etc.)
  config/        - Configuration files (e.g., screen sizes, site metadata)
  icons/         - SVG icons, typically used with a library like astro-icon
  layouts/       - Page layout templates (BaseLayout.astro, MaintenanceLayout.astro)
  lib/           - Utility functions, helpers, and client-side scripts
  overrides/     - Custom overrides for project-specific implementations or third-party library styling
  pages/         - File-based routing system; Astro uses files in this directory to generate pages and routes
  scripts/       - Client-side JavaScript for interactive components or global functionalities
  styles/        - Global styles, Tailwind CSS setup, and base styling
  types/         - TypeScript type definitions for data structures and props

public/
  content/       - JSON files synced from the Kirby CMS, representing the site's content
  favicons/      - Favicon files for different devices and platforms
  fonts/         - Web font files (WOFF, WOFF2) downloaded by the font-downloader plugin
  images/        - Static image assets not managed by the CMS
  # Other static assets (robots.txt, sitemap.xml often generated or placed here)

docs/
  README.md      - This documentation
  # Other markdown files for specific documentation sections

plugins/
  astro-kirby-sync/ - Plugin to synchronize content from Kirby CMS to `public/content`
  baukasten-utils/  - Shared utility functions for Baukasten Astro plugins
  font-downloader/  - Plugin to download and manage web fonts specified in Kirby CMS
  lang-folder-rename/ - Plugin to handle language-specific folder renaming for i18n routing
  netlify-remote-images/ - Plugin to configure Netlify remote images based on Kirby URL

.env             - Environment variables (e.g., KIRBY_URL, API keys)
.gitignore       - Specifies intentionally untracked files that Git should ignore
astro.config.mjs - Astro main configuration file (integrations, adapters, etc.)
netlify.toml     - Netlify deployment and build configuration file
package.json     - Project metadata, dependencies, and scripts
tailwind.config.cjs - Tailwind CSS configuration file
tsconfig.json    - TypeScript compiler configuration
vitest.config.ts - Configuration for Vitest, the testing framework
```

## Key Files

- `astro.config.mjs`: The central configuration file for Astro. It defines integrations (like Tailwind, Netlify adapter, custom plugins), site-wide options, build settings, and routing configuration including `trailingSlash: 'always'` for consistent URL structure.
- `tailwind.config.cjs`: Configures Tailwind CSS, including custom themes, plugins, and content sources for purging unused styles.
- `netlify.toml`: Manages build settings, redirects, headers, and other configurations for deploying the site on Netlify.
- `package.json`: Lists project dependencies, devDependencies, and defines npm scripts for common tasks like `dev`, `build`, `preview`, and `test`.
- `.env`: Stores environment-specific variables. Crucially, `KIRBY_URL` is defined here, which points to the Kirby CMS backend.
