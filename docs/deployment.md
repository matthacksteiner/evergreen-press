# Deployment

The Baukasten-Astro project is configured for deployment on Netlify, a platform for building, deploying, and managing modern web projects.

## Netlify Platform

- **Continuous Deployment**: Netlify integrates with Git repositories (e.g., GitHub, GitLab, Bitbucket). Pushing changes to a configured branch (typically `main` or `master`) automatically triggers a new build and deployment process.
- **Global CDN**: Netlify serves sites from a global Content Delivery Network (CDN), ensuring fast load times for users worldwide.
- **Build Environment**: Netlify provides a build environment where it installs dependencies, runs the build command (`npm run build` or `astro build`), and deploys the generated static assets (from `dist/` by default for Astro).
- **URL Consistency**: The project uses `trailingSlash: 'always'` configuration, ensuring all page URLs end with trailing slashes for consistent SEO and navigation behavior.

## Configuration

### 1. `netlify.toml`

This file in the project root is Netlify's primary configuration file.

- **Build Settings**:
  - `[build]`: Defines the build command, publish directory, and functions directory.
    - `command = "npm run build"` (or `astro build`)
    - `publish = "dist/"` (Astro's default output directory)
    - `functions = "netlify/functions/"` (if serverless functions are used, e.g., for the preview SSR route)
- **`[images]` - Remote Images**:
  - `remote_images = [ "{KIRBY_URL}/media/.*" ]`
  - This setting is often managed by the custom `netlify-remote-images` plugin, which dynamically updates it using the `KIRBY_URL` environment variable. It allows Netlify's build process to optimize images sourced directly from the Kirby CMS media folder during deployment if Netlify Image CDN is being used.
- **Redirects and Headers**: Can define custom redirect rules and HTTP headers.
- **Environment Variables**: While sensitive environment variables are set in the Netlify UI, `netlify.toml` can define build context-specific variables.

### 2. `@astrojs/netlify` Adapter

- Configured in `astro.config.mjs`, this adapter prepares the Astro build output specifically for Netlify.
- It handles different output modes:
  - **Static**: Default mode, generates static HTML/CSS/JS.
  - **SSR/Hybrid**: If server-side rendering is needed (e.g., for the `/preview/` route), the adapter bundles necessary components and handlers into Netlify Functions.
- **Image CDN Configuration**: The adapter might also include options related to Netlify's image CDN, working in conjunction with the `remote_images` setting in `netlify.toml`.

## Environment Variables on Netlify

- **`KIRBY_URL`**: This is the most critical environment variable. It must be set in the Netlify site settings (Build & deploy > Environment) to point to the live Kirby CMS URL.
- **`NODE_ENV`**: Typically set to `production` by Netlify for builds.
- **`CONTEXT`**: Netlify sets this variable (e.g., `production`, `deploy-preview`, `branch-deploy`, `dev`). The `astro-kirby-sync` plugin uses this to adjust its behavior (e.g., skipping sync in `dev` context locally if `netlify dev` is used).
- **`FORCE_FULL_SYNC`**: Can be set on Netlify to `true` to force a full content sync on the next build, bypassing incremental sync.

## Build Process on Netlify

1.  **Trigger**: A `git push` to the connected branch, a manual deploy, or a build hook triggers a new build.
2.  **Repository Clone**: Netlify clones the repository.
3.  **Dependency Installation**: Runs `npm install` (or yarn/pnpm equivalent) to install project dependencies.
4.  **Astro Build (`npm run build`)**: Executes the build script defined in `package.json`.
    - **Custom Plugin Execution**: Our custom plugins (`astro-kirby-sync`, `font-downloader`, `lang-folder-rename`, `netlify-remote-images`) run during different phases of the Astro build process (`astro:config:setup`, Netlify `onPreBuild`, `onPostBuild` via `astro-kirby-sync`'s Netlify Build Plugin nature).
    - **Content Sync**: `astro-kirby-sync` fetches content from `KIRBY_URL` and stores it in `public/content/`. It uses Netlify Cache API (via `utils.cache` in its Netlify Build Plugin hooks) to persist the `.sync-state.json` file between builds for faster incremental syncs.
    - **Asset Generation**: Astro builds static pages, CSS, JS.
5.  **Deployment**: Netlify deploys the contents of the `dist/` directory (and any generated Netlify Functions) to its CDN.
6.  **Atomic Deploys**: Netlify uses atomic deploys, meaning a new version of the site is fully uploaded before it becomes live. This prevents users from seeing a broken site during deployment.

## Preview Deployments

- Netlify can create deploy previews for pull/merge requests, allowing review of changes in a live-like environment before merging to the main branch.
- These previews use a unique URL and also run through the build process, including content sync.

## Automatic Deployment Memory

As noted in the project's operational knowledge:

> The baukasten project has automatic deployment configured: whenever a commit is pushed to the GitHub repository, it automatically triggers a Netlify build and deployment. This means manual deployment via Netlify MCP tools is usually unnecessary - just pushing to GitHub will start the build process.

This highlights the streamlined CI/CD workflow established for the project.
