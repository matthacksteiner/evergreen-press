# Custom Build Plugins

The Baukasten-Astro project utilizes several custom Astro integrations and build plugins to extend its capabilities, particularly around content synchronization, asset management, and build optimizations. These plugins are located in the `plugins/` directory of the project.

While this documentation provides a high-level overview, **each plugin has its own detailed `README.md` file within its respective folder in `plugins/`**. Please refer to those for in-depth explanations, configuration options, and troubleshooting.

Here is a list of the custom plugins and a brief description of their roles:

## 1. `astro-kirby-sync`

- **Purpose**: Synchronizes content from the Kirby CMS installation to the Astro project during the build process.
- **Key Features**: Fetches content as JSON, stores it in `public/content/`, organizes by language, and implements intelligent incremental syncs using content hashing to speed up builds.
- **Location**: `plugins/astro-kirby-sync/`
- **Detailed Documentation**: [plugins/astro-kirby-sync/README.md](../plugins/astro-kirby-sync/README.md)

## 2. `baukasten-utils`

- **Purpose**: A shared utility library for all Baukasten Astro plugins.
- **Key Features**: Provides standardized logging, file system utilities, Kirby CMS integration helpers (like fetching data), and configuration management functions for creating consistent plugin structures.
- **Location**: `plugins/baukasten-utils/`
- **Detailed Documentation**: [plugins/baukasten-utils/README.md](../plugins/baukasten-utils/README.md)

## 3. `font-downloader`

- **Purpose**: Automatically downloads web fonts defined in the Kirby CMS configuration and makes them available to the Astro project.
- **Key Features**: Fetches font URLs from Kirby's `global.json`, downloads WOFF and WOFF2 files to `public/fonts/`, and generates a `fonts.json` metadata file for use in CSS.
- **Location**: `plugins/font-downloader/`
- **Detailed Documentation**: [plugins/font-downloader/README.md](../plugins/font-downloader/README.md)

## 4. `lang-folder-rename`

- **Purpose**: Dynamically enables or disables internationalization (i18n) support by renaming the language-specific page directory (`src/pages/[lang]/`) based on content availability from Kirby CMS.
- **Key Features**: Checks for translations in Kirby; if none, renames `[lang]` to `_[lang]` to exclude it from routing, optimizing single-language site builds. Restores the name after the build.
- **Location**: `plugins/lang-folder-rename/`
- **Detailed Documentation**: [plugins/lang-folder-rename/README.md](../plugins/lang-folder-rename/README.md)

## 5. `netlify-remote-images`

- **Purpose**: Automatically updates the `remote_images` setting in the `netlify.toml` file.
- **Key Features**: Uses the `KIRBY_URL` environment variable to configure Netlify to allow image transformations for images served directly from the Kirby CMS media folder, if Netlify's Image CDN is utilized.
- **Location**: `plugins/netlify-remote-images/`
- **Detailed Documentation**: [plugins/netlify-remote-images/README.md](../plugins/netlify-remote-images/README.md)

These plugins are integral to the Baukasten-Astro project's workflow, automating many tasks related to content and asset integration from the headless CMS.
