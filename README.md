# Baukasten Frontend

This is the Astro frontend part of the Baukasten project. It works in conjunction with the [CMS Baukasten](https://github.com/matthacksteiner/cms.baukasten) backend to create a modern headless CMS-powered website.

## 📚 Documentation

For comprehensive technical documentation, please refer to the **[docs/](./docs/)** folder:

- **[Technical Overview](./docs/index.md)** - Complete documentation index
- **[Project Structure](./docs/project-structure.md)** - Directory organization and file conventions
- **[Routing System](./docs/routing.md)** - Dynamic routing and URL structure
- **[Content Management & API](./docs/content-management-api.md)** - CMS integration and data fetching
- **[Components and Blocks](./docs/components-blocks.md)** - Component architecture and block system
- **[Styling](./docs/styling.md)** - Tailwind CSS setup and styling approach
- **[Performance Optimization](./docs/performance.md)** - Build optimization and Core Web Vitals
- **[Integrations](./docs/integrations.md)** - Third-party services and plugins
- **[Internationalization (i18n)](./docs/internationalization.md)** - Multi-language support
- **[Deployment](./docs/deployment.md)** - Netlify deployment and configuration
- **[Testing](./docs/testing.md)** - Testing setup and best practices
- **[Custom Build Plugins](./docs/build-plugins.md)** - Custom plugin functionality

## Project Architecture

```
├── Frontend (this repository)
│   └── Astro-based static site generator with SSR preview mode
└── Backend (separate repository)
    └── Kirby CMS providing JSON API endpoints
```

The frontend consumes structured content from the Kirby CMS via JSON endpoints, generating static pages with optional SSR for real-time previews. Content is synchronized during build time and cached for optimal performance.

## Quick Start

### 1. Installation

1. Create a new repository from the [Baukasten template](https://github.com/matthacksteiner/baukasten)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the project:
   ```bash
   ./init-project.sh
   ```
   This removes template-specific files that aren't needed in child projects.

### 2. Environment Setup

Create a `.env` file in the project root with the required environment variables:

```env
# Kirby CMS API URL (required)
KIRBY_URL=https://your-cms-domain.com

# Optional: Debug and development settings
DEBUG_MODE=false
```

**Important**: Replace `your-cms-domain.com` with your actual Kirby CMS URL to enable content synchronization.

### 3. Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:4321` with hot reload enabled.

## Key Features

- **Static Site Generation**: Pre-rendered pages for optimal performance
- **Headless CMS Integration**: Dynamic content from Kirby CMS via JSON API
- **Block-Based Content**: Flexible content architecture with reusable components
- **Multi-Language Support**: Built-in internationalization with dynamic routing
- **Modern Build Pipeline**: Astro 5.8+ with custom plugins and optimizations
- **Real-Time Previews**: SSR-powered preview mode for content editing
- **Performance Optimized**: Core Web Vitals focused with automated compression
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Ready**: Automated meta tags, sitemaps, and structured data

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build static site for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run test suite with Vitest
- `npm run clean` - Remove cached content from `public/content/`
- `npm run clean-build` - Clean content cache and build
- `npm run clean-dev` - Clean content cache and start development

## Template Updates

### Automated Update

```bash
./update-template-version.sh
```

### Manual Update

To update your project from the template:

```bash
git remote add template https://github.com/matthacksteiner/baukasten
git fetch --all
git merge template/main --allow-unrelated-histories
```

## Deployment on Netlify

### 1. Site Configuration

1. Create a new site on Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### 2. Environment Variables

Add the following environment variables in Netlify:

- **`KIRBY_URL`**: Your Kirby CMS URL (e.g., `https://cms.yourdomain.com`)

### 3. Webhook Integration

Configure webhook integration for automatic deployments:

1. **Netlify Build Hook**: Create in Site Settings > Build & Deploy > Build hooks
2. **Deploy Notifications**: Set up outgoing webhooks in Netlify:
   - Deploy Succeeded: `https://your-cms-domain.com/webhook/netlify_deploy/success`
   - Deploy Failed: `https://your-cms-domain.com/webhook/netlify_deploy/error`

See [Deployment Documentation](./docs/deployment.md) for detailed setup instructions.

## Custom Build Plugins

The project includes several custom plugins that enhance the build process:

- **`astro-kirby-sync`**: Synchronizes content from Kirby CMS during build
- **`lang-folder-rename`**: Handles language-specific folder structure
- **`font-downloader`**: Downloads and optimizes web fonts
- **`netlify-remote-images`**: Configures remote image optimization

## Content Management

Content is managed through the Kirby CMS Panel and automatically synchronized:

1. **Content Editing**: Use the Kirby Panel (`/panel`) for content management
2. **Automatic Builds**: Content changes trigger automatic Netlify deployments
3. **Preview Mode**: Access `/preview/` for real-time content previews without deployment
4. **Content Sync**: Build-time synchronization ensures content is always up-to-date

## Development Workflow

1. **Local Development**: Run `npm run dev` for local development with hot reload
2. **Content Updates**: Content changes in CMS automatically trigger builds
3. **Preview Changes**: Use preview mode for immediate content review
4. **Testing**: Run `npm run test` before deploying changes
5. **Deployment**: Push to main branch triggers automatic Netlify deployment

## Template Maintenance System

This repository uses a `.templateignore` system to manage template updates:

### For Template Maintainers

- Edit `.templateignore` to exclude files from child repositories
- Automated workflows handle distribution to child repositories
- Common exclusions: maintenance workflows, template configuration files

### For Child Repository Owners

- Template-specific files are automatically excluded during updates
- Run `./init-project.sh` after manual merges to clean up template files
- The script reads `.templateignore` for consistency

## System Requirements

- **Node.js**: 18+ (recommended: latest LTS)
- **npm**: 8+ or equivalent package manager
- **Git**: For version control and template updates
- **Modern Browser**: For development and testing

## Support & Documentation

- **Project Documentation**: [docs/](./docs/) folder contains comprehensive guides
- **Astro Documentation**: [docs.astro.build](https://docs.astro.build)
- **Template Source**: [github.com/matthacksteiner/baukasten](https://github.com/matthacksteiner/baukasten)
- **CMS Backend**: [github.com/matthacksteiner/cms.baukasten](https://github.com/matthacksteiner/cms.baukasten)

For technical issues or questions, refer to the documentation or check the project's issue tracker.
