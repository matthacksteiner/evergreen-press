# Baukasten Astro Template Documentation

This documentation covers the Astro frontend template for the Baukasten CMS system.

## Table of Contents

- [Project Structure](project-structure.md) - Overview of the Astro template structure
- [Components and Blocks](components-blocks.md) - **Complete guide for creating new blocks**
- [Content Management and API](content-management-api.md) - CMS integration
- [Maintenance Mode](maintenance-mode.md) - **Site-wide maintenance functionality**
- [Routing](routing.md) - Dynamic routing and page generation
- [Internationalization](internationalization.md) - Multi-language support
- [Styling](styling.md) - Tailwind CSS and design system
- [Performance](performance.md) - Optimization and loading strategies
- [Integrations](integrations.md) - Third-party integrations
- [Build Plugins](build-plugins.md) - Custom build process plugins
- [Testing](testing.md) - Testing setup and practices
- [Deployment](deployment.md) - Netlify deployment

## Quick Block Creation Reference

To create a new block component in the Astro frontend:

### Essential Steps:

1. **Create component**: `src/blocks/Block[Name].astro`
2. **Register in Blocks.astro**: Add case to `src/components/Blocks.astro`
3. **Add TypeScript types**: Define props in `src/types/blocks.types.ts`

### Component Structure:

```astro
---
import Link from '@components/Link.astro';
const {
	toggle,
	customText,
	align,
	buttonLocal,
	buttonSettings,
	metadata,
	global,
	data, // For page-specific data
} = Astro.props;

// Process styling with global fallbacks
const useLocalStyling = buttonLocal;
const buttonFont = useLocalStyling
	? buttonSettings?.buttonFont
	: global.buttonFont;

// Early return for conditional rendering
if (!toggle) {
	return null;
}
---

<div
	id={metadata?.identifier || undefined}
	class:list={['blockName', 'blocks', alignmentClass, metadata?.classes]}
	{...metadata?.attributes || {}}
>
	<div class="block-content">
		{customText && <p>{customText}</p>}
	</div>
</div>

<style lang="css" define:vars={{ buttonFont }}>
	.blockName {
		font-family: var(--buttonFont);
	}
</style>
```

**📖 See [Components and Blocks](components-blocks.md) for the complete guide with patterns and best practices.**

## Getting Started

1. Read [Project Structure](project-structure.md) to understand the codebase
2. Review [Components and Blocks](components-blocks.md) for block development
3. Check [Content Management and API](content-management-api.md) for CMS integration
4. Follow [Deployment](deployment.md) for publishing your site

## Key Features

- **Block-based Architecture**: Flexible content blocks from Kirby CMS
- **Maintenance Mode**: Site-wide maintenance with CMS-managed content
- **TypeScript Support**: Full type safety throughout the codebase
- **Multi-language**: Built-in internationalization support
- **Performance Optimized**: Image optimization, lazy loading, prefetching
- **Modern Tooling**: Astro 5.8.2+, Tailwind CSS, Vitest testing
- **Consistent URL Structure**: `trailingSlash: 'always'` for SEO benefits and URL consistency

## Best Practices

- Follow the comprehensive block creation guide for consistency
- Use TypeScript for all component props
- Implement responsive design with mobile-first approach
- Test blocks with different content configurations
- Maintain performance with proper loading strategies
