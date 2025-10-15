# Styling

The Baukasten-Astro project uses Tailwind CSS as its primary styling framework, complemented by global styles and component-scoped styles where necessary.

## Tailwind CSS (`@astrojs/tailwind`)

- **Utility-First**: Tailwind CSS is a utility-first CSS framework. Styles are applied by composing utility classes directly in the HTML (or `.astro` file) markup.
  - Example: `<div class="bg-blue-500 text-white p-4 rounded-lg">Styled Box</div>`
- **Configuration (`tailwind.config.cjs`)**: The behavior of Tailwind is customized in `tailwind.config.cjs`. This includes:
  - `content`: Specifies the files Tailwind should scan to purge unused CSS classes for production builds (e.g., `src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}`).
  - `theme`: Extends or overrides Tailwind's default design system (colors, spacing, typography, breakpoints, etc.).
    - Custom screen sizes are often defined in `src/config/screens.js` and imported here.
    - Project-specific colors, font families, and other theme elements are added.
  - `plugins`: Can include official Tailwind plugins (like `@tailwindcss/typography`, `@tailwindcss/forms`) or custom plugins.
- **No `@apply`**: As a best practice, the use of `@apply` in CSS files is generally avoided. The preference is to use utility classes directly in the markup to maintain consistency and leverage Tailwind's strengths.
- **Overrides (`src/overrides/tailwind.config.cjs`)**: For more complex or project-specific Tailwind customizations that might not fit neatly into the main `tailwind.config.cjs`, an overrides file can be used and merged into the main configuration.

## Global Styles (`src/styles/`)

- **`global.css` (or similar)**: This file in `src/styles/` is used for base styles, CSS resets, or global style definitions that are not easily achieved with utility classes.
  - It might include base font settings, global link styling, or a base layer for Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).
- **Font Imports**: `@font-face` declarations for web fonts (often managed by `fonts.json` from the `font-downloader` plugin) might be included here or in a dedicated CSS file imported globally.

## Component-Scoped Styles

Astro components (`.astro` files) can have `<style>` tags. These styles are **scoped by default**, meaning they only apply to the HTML within that component file. This is useful for component-specific styling that doesn't need to be part of the global utility system.

```astro
---
// MyComponent.astro
---

<div class="my-component">
	<p>This is my component.</p>
</div>

<style>
	.my-component p {
		color: purple; /* This style only applies to p tags inside .my-component */
	}
</style>
```

- **`is:global`**: If truly global styles need to be defined from within a component (rarely needed), the `is:global` attribute can be used on the `<style>` tag.

## Responsive Design

- Tailwind CSS is built with responsive design in mind. Breakpoint prefixes (e.g., `md:`, `lg:`) are used to apply styles at different screen sizes.
  - Example: `<div class="w-full md:w-1/2 lg:w-1/3">...</div>`
- Custom screen breakpoints are defined in `tailwind.config.cjs` (often sourced from `src/config/screens.js`).

## CSS Compression

- For production builds, CSS is typically processed and compressed to reduce file size. The `@playform/compress` integration or similar tools are often used for this, configured in `astro.config.mjs`.
