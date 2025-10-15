# Integrations

The Baukasten-Astro project leverages several Astro integrations and third-party libraries to enhance its functionality, performance, and development experience.

## Core Astro Integrations

- **`@astrojs/netlify`**: (e.g., v6.3.3+)

  - **Purpose**: Adapts the Astro site for deployment on Netlify. It configures the build output correctly for Netlify's platform, including support for serverless functions (for SSR previews) and edge functions if used.
  - **Configuration**: Managed in `astro.config.mjs`.

- **`@astrojs/tailwind`**: (e.g., v6.0.2+)
  - **Purpose**: Integrates Tailwind CSS into the Astro project.
  - **Functionality**: Sets up Tailwind, processes utility classes, and enables CSS purging for optimized production builds.
  - **Configuration**: Primarily via `tailwind.config.cjs` and `astro.config.mjs`.

## UI and Utility Integrations

- **`astro-icon`**: (e.g., v1.1.0+)

  - **Purpose**: Simplifies the use of SVG icons from various icon sets or custom SVG files.
  - **Usage**: Allows embedding icons directly as Astro components (e.g., `<Icon name="mdi:home" />`).

- **`astro-cloudinary`**: (e.g., v1.3.0+)

  - **Purpose**: Integrates Cloudinary for advanced image optimization and delivery.
  - **Functionality**: Transforms and serves images from Cloudinary, providing responsive images, format optimization (WebP, AVIF), and other transformations.

- **`@playform/compress`**: (or similar HTML/CSS/JS compression tools)
  - **Purpose**: Compresses the HTML, CSS, and JavaScript output during the build process.
  - **Benefit**: Reduces file sizes, leading to faster load times.

## Media and Interactivity Libraries

- **Medium Zoom**: (e.g., v1.1.0+)

  - **Purpose**: Provides a "click to zoom" functionality for images, commonly used in galleries or product images.
  - **Usage**: Implemented as a client-side script, often initialized on specific image elements.

- **PhotoSwipe**: (e.g., v5.4.4+)

  - **Purpose**: A JavaScript image gallery library for touch-friendly and responsive photo viewing.
  - **Usage**: Used to create interactive image galleries, often within content blocks.

- **Swiper**: (e.g., v9.2.3+)

  - **Purpose**: A modern touch slider/carousel library.
  - **Usage**: Used for creating image sliders, testimonial carousels, or other sliding content elements.

- **`vanilla-cookieconsent`**: (e.g., v3.0.0+)
  - **Purpose**: Manages cookie consent banners and user preferences for GDPR compliance.
  - **Usage**: Typically initialized globally to display a cookie notice and handle user consent.

## Custom Project Plugins

These are plugins developed specifically for the Baukasten project, located in the `plugins/` directory. They play crucial roles in content management, asset handling, and build optimization.

- **`astro-kirby-sync`**: Synchronizes content from Kirby CMS. (See [Content Management & API](./content-management-api.md) and its [own README](../plugins/astro-kirby-sync/README.md)).
- **`font-downloader`**: Downloads web fonts specified in Kirby CMS. (See its [own README](../plugins/font-downloader/README.md)).
- **`lang-folder-rename`**: Manages language folder renaming for i18n. (See [Internationalization](./internationalization.md) and its [own README](../plugins/lang-folder-rename/README.md)).
- **`netlify-remote-images`**: Updates Netlify's remote image settings. (See its [own README](../plugins/netlify-remote-images/README.md)).
- **`baukasten-utils`**: Shared utilities for the custom plugins. (See its [own README](../plugins/baukasten-utils/README.md)).

These integrations and libraries work together to provide a feature-rich, performant, and developer-friendly platform.
