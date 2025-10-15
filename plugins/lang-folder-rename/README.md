# Lang Folder Rename Plugin

This plugin dynamically enables or disables internationalization support in your Astro project by renaming the language directory based on content availability.

## How it works

1. Checks if translations are available in your Kirby CMS (via global.json)
2. Renames the `[lang]` folder to `_[lang]` if no translations are found (disabling i18n routes)
3. Renames the `_[lang]` folder back to `[lang]` if translations are found (enabling i18n routes)
4. Always restores the original `[lang]` folder name after build

## Why this is useful

In Astro, the `[lang]` directory creates dynamic route parameters for language codes. If your site doesn't have translations, these routes aren't needed. By temporarily renaming the folder with an underscore (`_[lang]`), Astro ignores it in the routing system, simplifying the build and preventing unnecessary routes.

## Usage

Add the plugin to your `astro.config.mjs` file:

```js
import langFolderRename from './plugins/lang-folder-rename/langFolderRename.js';

// In your Astro config
export default defineConfig({
	integrations: [
		langFolderRename(),
		// other integrations...
	],
});
```

Make sure your `.env` file has the `KIRBY_URL` variable set:

```
KIRBY_URL=https://your-kirby-cms-url.com
```

The plugin provides helpful console output during the build process, showing when folders are renamed and explaining why.
