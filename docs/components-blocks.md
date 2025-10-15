# Components and Blocks System

The Baukasten Astro template uses a comprehensive component-based architecture with a flexible blocks system that integrates seamlessly with the Kirby CMS backend.

## Architecture Overview

### Components Structure

```
src/
├── blocks/              # Content block components
│   ├── BlockAccordion.astro
│   ├── BlockButton.astro
│   ├── BlockCard.astro
│   ├── BlockNavigation.astro
│   └── ...
├── components/          # Reusable UI components
│   ├── Blocks.astro     # Main block renderer
│   ├── Link.astro       # Link component
│   ├── Picture.astro    # Image component
│   └── ...
└── types/
    └── blocks.types.ts  # TypeScript definitions
```

### Block System Flow

1. **Kirby CMS** → Defines block structure and processes data
2. **JSON API** → Provides structured block data
3. **Blocks.astro** → Routes blocks to appropriate components
4. **Block Components** → Render individual blocks
5. **TypeScript** → Provides type safety

## Creating New Block Components

Follow this comprehensive guide when creating new blocks in the Astro frontend:

### Step 1: Create the Block Component

Create a new file in `src/blocks/Block[Name].astro`:

```astro
---
import Link from '@components/Link.astro';
import { toRem } from '@lib/helpers';

// Define props interface (matches data from Kirby)
const {
    // Content fields
    toggle,
    customText,
    items,

    // Styling fields
    align,
    color,
    size,

    // Button settings (if applicable)
    buttonLocal,
    buttonSettings,
    buttonColors,

    // System props
    metadata,
    global,
    data, // Include if block needs page/navigation data
} = Astro.props;

// Process styling variables with fallbacks to global settings
const useLocalStyling = buttonLocal;
const buttonFont = useLocalStyling
    ? buttonSettings?.buttonFont
    : global.buttonFont;

const buttonPadding = useLocalStyling
    ? toRem(buttonSettings?.buttonPadding)
    : toRem(global.buttonPadding);

// Process alignment classes
const alignmentClass = align === 'left'
    ? 'justify-start'
    : align === 'right'
    ? 'justify-end'
    : align === 'center'
    ? 'justify-center'
    : 'justify-between';

// Early return for conditional rendering
if (!toggle) {
    return null;
}

// Process complex data if needed
const processedItems = items?.map(item => ({
    ...item,
    processed: true
}));
---

<div
    id={metadata?.identifier || undefined}
    class:list={[
        'blockName',
        'blocks',
        alignmentClass,
        `text--${color}`,
        metadata?.classes,
    ]}
    {...metadata?.attributes || {}}
>
    <div class="block-content">
        {customText && (
            <p class:list={['custom-text', `font--${size}`]}>
                {customText}
            </p>
        )}

        {processedItems?.map((item) => (
            <div class="block-item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {item.linkobject && (
                    <Link
                        link={item.linkobject}
                        class="item-link"
                    >
                        {item.linkobject.title}
                    </Link>
                )}
            </div>
        ))}
    </div>
</div>

<style
    lang="css"
    define:vars={{
        buttonFont,
        buttonPadding,
    }}
>
    .blockName {
        font-family: var(--buttonFont);
    }

    .block-content {
        padding: var(--buttonPadding);
    }

    .custom-text {
        /* Component-specific styles */
    }

    .block-item {
        /* Layout styles */
    }

    .item-link {
        /* Link styles */
    }
</style>

<script>
    // Add client-side interactivity if needed
    document.addEventListener('DOMContentLoaded', () => {
        const blockElements = document.querySelectorAll('.blockName');

        blockElements.forEach(block => {
            // Add event listeners or initialize functionality
        });
    });
</script>
```

### Step 2: Register in Blocks.astro

Add your component to the main block renderer in `src/components/Blocks.astro`:

```astro
---
// Import all block components
import BlockAccordion from '@blocks/BlockAccordion.astro';
import BlockButton from '@blocks/BlockButton.astro';
import BlockName from '@blocks/BlockName.astro'; // Your new block
// ... other imports

const {
    blocks,
    global,
    span,
    backgroundContainer,
    data, // Page-specific data
} = Astro.props;
---

<!-- Block renderer -->
{
    blocks?.map((block) => {
        // Calculate span for responsive layouts
        const blockSpan = span || 12;

        switch (block.type) {
            case 'accordion':
                return (
                    <BlockAccordion
                        {...block.content}
                        global={global}
                        span={blockSpan}
                        data={data}
                    />
                );

            case 'button':
                return (
                    <BlockButton
                        {...block.content}
                        global={global}
                        span={blockSpan}
                        data={data}
                    />
                );

            case 'blockname': // Your new block case
                return (
                    <BlockName
                        {...block.content}
                        global={global}
                        span={blockSpan}
                        data={data}
                    />
                );

            default:
                console.warn(`Unknown block type: ${block.type}`);
                return null;
        }
    })
}
```

### Step 3: Add TypeScript Definitions

Create type definitions in `src/types/blocks.types.ts`:

```typescript
// Base interface that all blocks extend
export interface BaseBlockProps {
    type: string;
    id?: string;
    metadata?: {
        identifier?: string;
        classes?: string;
        attributes?: Record<string, any>;
    };
}

// Your new block interface
export interface BlockNameProps extends BaseBlockProps {
    // Content fields
    toggle: boolean;
    customText?: string;
    items?: Array<{
        title: string;
        text: string;
        linkobject?: LinkObject;
    }>;

    // Styling fields
    align?: 'left' | 'center' | 'right' | 'between';
    color?: 'primary' | 'secondary' | 'tertiary' | 'black' | 'white';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

    // Button settings (if applicable)
    buttonLocal?: boolean;
    buttonSettings?: {
        buttonFont?: string;
        buttonFontSize?: string;
        buttonPadding?: number;
        buttonBorderRadius?: number;
        buttonBorderWidth?: number;
    };
    buttonColors?: {
        buttonTextColor?: string;
        buttonTextColorActive?: string;
        buttonBackgroundColor?: string;
        buttonBackgroundColorActive?: string;
        buttonBorderColor?: string;
        buttonBorderColorActive?: string;
    };

    // System props
    global?: GlobalSettings;
    data?: PageData;
    span?: number;
}

// Helper types
interface LinkObject {
    type: 'page' | 'url' | 'email' | 'tel';
    href: string;
    title: string;
    target?: '_blank' | '_self';
}

interface GlobalSettings {
    buttonFont: string;
    buttonFontSize: string;
    buttonPadding: number;
    // ... other global settings
}

interface PageData {
    navigation?: {
        prevPage?: { uri: string; title: string; };
        nextPage?: { uri: string; title: string; };
    };
    // ... other page data
}
```

### Step 4: Component Patterns and Best Practices

#### Responsive Design
```astro
---
// Use span for responsive layouts
const itemSpan = span / items.length;
---

<div
    class="grid-layout"
    style={`grid-template-columns: repeat(${items.length}, 1fr);`}
>
    {items.map(item => (
        <div class="grid-item" style={`--span: ${itemSpan}`}>
            <!-- Item content -->
        </div>
    ))}
</div>
```

#### Conditional Rendering
```astro
---
// Early returns for conditional blocks
if (!toggle || !items?.length) {
    return null;
}

// Conditional content
const showAdvanced = settings?.advanced === true;
---

{showAdvanced && (
    <div class="advanced-content">
        <!-- Advanced features -->
    </div>
)}
```

#### Global vs Local Settings
```astro
---
// Always provide fallbacks to global settings
const textColor = useLocalStyling
    ? textColors?.textColor
    : global.textColor;

const fontSize = useLocalStyling
    ? textSettings?.fontSize
    : global.fontSize;
---
```

#### Image and Media Handling
```astro
---
import ImageComponent from '@components/ImageComponent.astro';

// For blocks with images
const loadingStrategy = aboveFold ? 'eager' : 'lazy';
---

{image?.url && (
    <ImageComponent
        global={global}
        image={image}
        loading={loadingStrategy}
        ratioMobile={ratioMobile}
        ratioDesktop={ratioDesktop}
        span={span}
        aboveFold={aboveFold}
    />
)}
```

#### Link Handling
```astro
---
import Link from '@components/Link.astro';
---

{linkobject?.type && (
    <Link
        link={linkobject}
        class:list={[
            'block-link',
            `text--${textColor}`,
            `font--${fontSize}`
        ]}
    >
        {linkobject.title}
    </Link>
)}
```

**Note**: The Link component automatically handles trailing slash consistency due to the project's `trailingSlash: 'always'` configuration. All internal page links will include trailing slashes for SEO consistency.

### Step 5: Styling Guidelines

#### Use CSS Custom Properties
```astro
<style
    lang="css"
    define:vars={{
        textFont,
        buttonPadding,
        customColor,
    }}
>
    .blockName {
        font-family: var(--textFont);
        padding: var(--buttonPadding);
        color: var(--customColor);
    }
</style>
```

#### Follow Utility Class Patterns
```astro
<div
    class:list={[
        'blockName',
        'blocks',
        `font--${fontSize}`,
        `text--${textColor}`,
        `bg--${backgroundColor}`,
        metadata?.classes,
    ]}
>
```

#### Responsive Breakpoints
```css
.blockName {
    /* Mobile first approach */
    @apply grid-cols-1 gap-4;

    /* Tablet and up */
    @apply md:grid-cols-2 md:gap-6;

    /* Desktop and up */
    @apply lg:grid-cols-3 lg:gap-8;
}
```

### Step 6: Data Flow and Props

#### Accessing Page Data
```astro
---
// For blocks that need page-specific data
const { data } = Astro.props;
const pageNavigation = data?.navigation;
const currentPage = data?.currentPage;

// Use with conditional rendering
if (!pageNavigation?.prevPage && !pageNavigation?.nextPage) {
    return null;
}
---
```

#### Component Hierarchy for Data Passing
When blocks need access to `data`, ensure the prop is passed through:
- `Pages/[...slug].astro` → `PageRenderer.astro` → `Section.astro` → `Layouts.astro` → `BlockGrid.astro` → `Columns.astro` → `Blocks.astro` → `YourBlock.astro`

### Step 7: Testing and Debugging

#### Console Logging for Development
```astro
---
// Debug props in development
console.log('🚀 Block data:', {
    type: 'blockname',
    toggle,
    customText,
    items: items?.length || 0
});
---
```

#### Error Boundaries
```astro
---
// Graceful error handling
try {
    const processedData = complexDataProcessing(items);
} catch (error) {
    console.error('Block processing error:', error);
    return null;
}
---
```

### Step 8: Performance Considerations

#### Lazy Loading
```astro
---
// Determine loading strategy
const loadingStrategy = aboveFold ? 'eager' : 'lazy';
const shouldPreload = aboveFold && isFirstItem;
---

<img
    src={image.url}
    loading={loadingStrategy}
    {shouldPreload && { fetchpriority: 'high' }}
/>
```

#### Client-Side Scripts
```astro
<script>
    // Use define:vars for server-to-client data
    const blockConfig = {
        autoplay: autoplayEnabled,
        delay: slideDelay
    };

    // Initialize only when needed
    if (blockConfig.autoplay) {
        // Initialize autoplay functionality
    }
</script>
```

### Common Block Types and Patterns

#### Interactive Blocks (Accordion, Tabs)
```astro
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const accordionButtons = document.querySelectorAll('.accordion-button');

        accordionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Toggle logic
            });
        });
    });
</script>
```

#### Media Blocks (Slider, Gallery)
```astro
<script>
    import Swiper from 'swiper';

    const swiperOptions = {
        slidesPerView: viewMobile,
        spaceBetween: padding,
        breakpoints: {
            1024: {
                slidesPerView: viewDesktop
            }
        }
    };

    new Swiper('.swiper', swiperOptions);
</script>
```

#### Form Blocks
```astro
<script>
    const form = document.querySelector('.contact-form');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        // Handle form submission
    });
</script>
```

This comprehensive guide ensures that all new blocks follow consistent patterns, maintain type safety, and integrate seamlessly with the existing Baukasten architecture.
