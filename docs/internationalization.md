# Internationalization (i18n)

The Baukasten-Astro project is designed with multi-language support, allowing content to be served in different languages based on the Kirby CMS configuration and URL structure.

## Core Concepts

- **Kirby CMS as Source**: Language definitions (e.g., language codes, names) and translated content originate from Kirby CMS.
  - The `global.json` endpoint from Kirby (see [Content Management & API](./content-management-api.md)) typically provides a list of available languages and the default language.
- **Astro i18n Configuration**: Astro's built-in i18n features are configured in `astro.config.mjs`.
  - `defaultLocale`: Specifies the default language of the site (e.g., 'en').
  - `locales`: An array of all supported language codes (e.g., ['en', 'de', 'fr']).
  - `routing`: Configuration for how language prefixes are handled in URLs (e.g., `prefixDefaultLocale: true` or `false`).

## Language-Specific Routing

- **URL Structure**: Language is typically indicated by a prefix in the URL path.
  - Example: `mysite.com/en/about-us/`, `mysite.com/de/ueber-uns/`.
  - If `prefixDefaultLocale` is `false` (common), the default language might not have a prefix: `mysite.com/about-us/` (for English if default) and `mysite.com/de/ueber-uns/` (for German).
  - **Note**: All URLs end with trailing slashes due to `trailingSlash: 'always'` configuration, including multi-language URLs.
- **Dynamic Routes**: The `src/pages/[lang]/[...slug].astro` (and similar variants like `src/pages/[lang]/[section]/[...slug].astro`) file structure is key to handling language-specific pages.
  - The `[lang]` parameter in the route is used to fetch and display content for that specific language.

## Content Synchronization for Languages

- The `astro-kirby-sync` plugin fetches content for each configured language from Kirby CMS.
- Localized content is stored in language-specific subdirectories within `public/content/` (e.g., `public/content/en/`, `public/content/de/`).
- The `global.json` and `index.json` files are fetched for each language, providing localized site settings and page listings.

## `lang-folder-rename` Plugin

- **Purpose**: This custom plugin dynamically adjusts the project structure based on the availability of translations in Kirby CMS.
- **Functionality**:
  1.  During `astro:config:setup`, it checks if translations are defined in Kirby's `global.json`.
  2.  If **no translations** are found (i.e., the site is effectively single-language), it renames the `src/pages/[lang]/` directory to `src/pages/_[lang]/` (or similar).
      - Prefixing with an underscore causes Astro to ignore this directory for routing, preventing the generation of unnecessary language-prefixed routes.
  3.  If **translations are found**, it ensures the directory is named `src/pages/[lang]/` so that Astro processes it for multi-language routing.
  4.  During `astro:build:done`, it typically restores the folder name to `[lang]` to maintain a consistent project structure, regardless of the build-time state.
- **Benefit**: Optimizes the build and routing for sites that might start as single-language but have the infrastructure for i18n. It avoids 404s or incorrect routing if the `[lang]` directory structure is present but no actual translated content or language configuration exists.
- See the plugin's [own README](../plugins/lang-folder-rename/README.md) for more details.

## Accessing Language Information

- **`Astro.currentLocale`**: Within `.astro` files, `Astro.currentLocale` can be used to get the language code of the current page.
- This can be used to fetch the correct localized content from `public/content/{Astro.currentLocale}/...` or to adapt UI elements (e.g., date formats, labels).

## UI Translation

- Static UI text (text not coming from Kirby CMS, e.g., button labels in components) might need a separate translation mechanism if it needs to be localized.
  - This could involve simple JavaScript objects mapping keys to translated strings per language, or more sophisticated i18n libraries integrated into Astro components.
  - The project currently focuses on content internationalization via Kirby.

By combining Astro's i18n capabilities with data from Kirby CMS and custom plugins, the Baukasten project provides a robust solution for multi-language websites.
