# CRUSH.md - Baukasten-Astro Project

## Build/Lint/Test Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run all tests with Vitest
- `npm test -- testNamePattern` - Run specific test file (e.g., `npm test -- Link`)
- `npm run clean` - Remove synced content from public/content
- `npm run clean-build` - Clean content then build
- `npm run clean-dev` - Clean content then start dev server

## Code Style Guidelines

### Imports
- Use absolute imports with aliases (@components, @blocks, @lib, etc.)
- Group imports: node_modules first, then local imports
- Use destructuring for named exports

### Formatting
- Use Prettier for code formatting
- TypeScript for all new code
- Astro components with .astro extension
- Tailwind CSS classes instead of @apply

### Types
- Strong typing with TypeScript interfaces
- Define types in src/types/ directory
- Use strictNullChecks

### Naming Conventions
- PascalCase for components (BlockText.astro)
- camelCase for variables and functions
- kebab-case for file names
- BLOCK_TYPE constants for block types

### Error Handling
- Validate required props with clear error messages
- Use try/catch for async operations
- Fail fast with early returns

### Component Development
- Small, focused components
- Props validation
- Test files in __tests__ directories
- Follow existing patterns in the codebase

## Best Practices from Cursor Rules

- Use block-based content approach
- Implement multi-language support
- Leverage Astro's SSG with optional SSR for previews
- Keep components small and reusable
- Follow accessibility guidelines
- Optimize for Core Web Vitals

## Additional Notes

- The Astro frontend consumes JSON content from the Kirby CMS backend
- Content synchronization happens via the astro-kirby-sync plugin
- Images are processed with Cloudinary through the astro-cloudinary plugin
- Critical CSS and other optimizations are enabled in production builds