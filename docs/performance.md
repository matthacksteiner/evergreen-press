# Performance Optimization

Performance is a key consideration in the Baukasten-Astro project. Astro itself is designed for building fast websites, and several additional strategies and tools are employed to ensure optimal Core Web Vitals and user experience.

## Static Site Generation (SSG)

- **Default Mode**: Astro primarily generates static HTML, CSS, and JavaScript at build time. This means users receive pre-built pages, leading to very fast load times (Time to First Byte - TTFB).
- **Reduced Server Load**: Serving static files requires less server processing power compared to dynamic sites.

## Minimal JavaScript

- **Zero JS by Default**: Astro components render to HTML and CSS, with no client-side JavaScript by default.
- **Selective Hydration**: For interactive components (UI islands), Astro uses client directives (e.g., `client:load`, `client:idle`, `client:visible`, `client:media`) to control precisely how and when JavaScript is loaded and executed in the browser. This avoids sending unnecessary JavaScript.
  - `client:idle`: Loads the component JavaScript when the browser is idle.
  - `client:visible`: Loads the component JavaScript when the component enters the viewport.
  - `client:media`: Loads based on a media query.

## Image Optimization

- **`astro-cloudinary` Integration**: The project uses the `astro-cloudinary` plugin (or a similar image optimization service) for delivering optimized images.
  - **Automatic Optimization**: Images sourced from Kirby CMS or local assets can be processed to generate responsive, correctly-sized, and efficiently-formatted (e.g., WebP, AVIF) images.
  - **Lazy Loading**: Images are typically lazy-loaded to improve initial page load time.
- **Netlify Adapter Remote Images**: The `netlify.toml` configuration, often updated by the `netlify-remote-images` plugin, specifies allowed remote image sources (like the Kirby CMS media folder) for Netlify's build-time image processing and optimization, if applicable.

## CSS and JavaScript Compression

- **`@playform/compress`**: This Astro integration (or similar tools) is used to compress HTML, CSS, and JavaScript files during the build process.
  - Removes whitespace, comments, and minifies code to reduce file sizes.

## Prefetching

- **Astro's Prefetch Support**: Astro can prefetch links to pages that a user is likely to visit next. When a link enters the viewport, Astro can prefetch the content for that page in the background.
- **Configuration**: Prefetching can be configured in `astro.config.mjs` via the `prefetch` option. This can significantly improve perceived navigation speed.

## Code Splitting

- Astro automatically splits JavaScript into smaller chunks. Only the code necessary for the current page and its interactive components is loaded.

## Efficient Data Fetching

- **Build-Time Data Fetching**: For static content, all data from Kirby CMS is fetched at build time by the `astro-kirby-sync` plugin and stored as local JSON files. This avoids client-side API calls for main content on static pages.
- **Incremental Syncs**: The `astro-kirby-sync` plugin uses incremental syncs, reducing the amount of data fetched during most builds, which speeds up the build process itself.

## Caching

- **Browser Caching**: Static assets (CSS, JS, images) are served with appropriate cache headers, allowing browsers to cache them effectively.
- **CDN Caching**: Deploying to Netlify leverages its Content Delivery Network (CDN) to cache static assets at edge locations closer to users, reducing latency.

## Monitoring Core Web Vitals

- Regular testing and monitoring of Core Web Vitals (Largest Contentful Paint - LCP, First Input Delay - FID/Interaction to Next Paint - INP, Cumulative Layout Shift - CLS) are important to identify and address performance bottlenecks.
