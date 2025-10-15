# Content Management & API

The Baukasten-Astro project uses Kirby CMS as a headless CMS. Content is created and managed in Kirby and then synchronized to the Astro project for static site generation or server-side rendering (for previews).

## Kirby CMS as a Headless Source

- **Kirby CMS**: The authoritative source for all website content, including pages, text, images, and site-wide settings (like languages, navigation, etc.).
- **Content Structure**: Content in Kirby is typically structured into pages, fields, and blocks. This structure is mirrored in the JSON data consumed by Astro.
- **`KIRBY_URL`**: An essential environment variable (defined in `.env`) that points to the live Kirby CMS installation (e.g., `https://your-kirby-instance.com`). All content fetching operations use this URL.

## Content Synchronization: `astro-kirby-sync` Plugin

The primary mechanism for bringing content from Kirby into Astro is the custom `astro-kirby-sync` plugin. See its [detailed documentation](../plugins/astro-kirby-sync/README.md).

**Key Functions:**

1.  **Build-Time Sync**: During `astro build`, this plugin fetches content from the Kirby CMS.
2.  **JSON Storage**: It saves the fetched content as JSON files locally within the `public/content/` directory.
3.  **Language Organization**: Content is organized into subdirectories by language code (e.g., `public/content/en/`, `public/content/de/`). The default language's content is also typically mirrored at the root of `public/content/` for easier access.
4.  **Incremental Syncs**: The plugin is designed to perform intelligent incremental syncs. It maintains a state file (`.astro/kirby-sync-state.json`) with content hashes (SHA-256) to detect changes. This means only modified content is re-downloaded, significantly speeding up build times for large sites.
5.  **Fallback to Full Sync**: If incremental sync fails or if `FORCE_FULL_SYNC=true` is set, it performs a full sync.
6.  **Development Mode**: Content sync is usually skipped in development mode (`astro dev`). Instead, pages might fetch data directly or use locally cached data for faster startup.

## Kirby JSON API Endpoints

The `astro-kirby-sync` plugin (and potentially the preview route) interacts with Kirby CMS by fetching data from specific JSON endpoints. Kirby can be configured to expose its content in JSON format. The common endpoints used are:

1.  **Global Data**: `/{KIRBY_URL}/global.json` (and `/{KIRBY_URL}/{lang}/global.json` for each language)

    - **Purpose**: Provides site-wide configuration and data.
    - **Content**: Typically includes:
      - Site title, metadata, social links.
      - Navigation structure (main menu, footer menu).
      - Language configuration: default language, available translations.
      - Font definitions (used by the `font-downloader` plugin).
      - **Maintenance mode toggle**: `maintenanceToggle` field from the maintenance page.
      - Other global settings.

2.  **Index/Listing Data**: `/{KIRBY_URL}/index.json` (and `/{KIRBY_URL}/{lang}/index.json`)

    - **Purpose**: Provides a list of all top-level pages or a curated list of pages (e.g., for sitemaps or listings).
    - **Content**: An array of page objects, each usually containing:
      - `uri`: The unique URI of the page (e.g., `about`, `services/digital`). Note: These URIs from the CMS don't include trailing slashes, but the frontend adds them automatically due to `trailingSlash: 'always'` configuration.
      - `title`: The page title.
      - `id`: Kirby's internal page ID.
      - `intendedTemplate`: The Kirby template used for this page, which helps Astro map it to a layout or component.
      - Other summary fields if needed for listings.

3.  **Page Data**: `/{KIRBY_URL}/{page-uri}.json` (and `/{KIRBY_URL}/{lang}/{page-uri}.json`)
    - **Purpose**: Provides the full content for a specific page.
    - **Content**: A JSON object representing the page, including:
      - All fields defined in the page's Kirby Blueprint (e.g., title, text, SEO fields).
      - **Blocks**: If the page uses Kirby's editor or blocks field, the content will include a structured array of content blocks (e.g., text blocks, image blocks, video blocks). Each block object contains its type and associated data.
      - `uri`, `title`, `id`, `intendedTemplate`.
      - Child pages or related content if configured.

**Example `public/content/en/about.json` (simplified):**

```json
{
	"title": "About Us",
	"uri": "about",
	"intendedTemplate": "default",
	"seoTitle": "Learn More About Our Company | Baukasten",
	"contentBlocks": [
		{
			"type": "text",
			"text": "<p>We are a company dedicated to building amazing things.</p>"
		},
		{
			"type": "image",
			"image": ["kirby-image-uuid.jpg"],
			"alt": "Our Team",
			"caption": "A photo of our dedicated team members."
		}
		// ... more blocks
	]
	// ... other page fields
}
```

## Accessing Content in Astro Components

Once the content is synced to `public/content/`, Astro components and pages can read these JSON files (e.g., using `fetch` or `Astro.glob` for local files, or directly importing them if possible with Astro's settings).

For dynamic pages (`[...slug].astro`), the `getStaticPaths` function will typically read the `index.json` for the relevant language to get all page URIs, and then for each page, it will fetch the corresponding `{page-uri}.json` file to pass its content as props.

## Preview Mode API Interaction

The preview route (`src/pages/preview/[...slug].astro`) behaves differently:

- It usually bypasses the local JSON files in `public/content/`.
- It fetches content **directly** from the Kirby CMS API endpoints (`KIRBY_URL/.../{slug}.json`) at request time using SSR.
- This ensures that content editors see the absolute latest version of the content from the CMS without needing a rebuild.
