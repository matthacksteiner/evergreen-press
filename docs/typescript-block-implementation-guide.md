# TypeScript Block Implementation Guide

## Pattern for Adding TypeScript to Block Components

### 1. Import Required Types
```astro
---
import type { MetadataProps, LinkArray, ImageArray, SvgArray, ButtonSettings, ButtonColors } from '../types/blocks.types';
```

### 2. Define Props Interface
```astro
interface Props {
	// Required props (no ? mark)
	requiredProp: string;

	// Optional props (with ? mark)
	optionalProp?: string;

	// Complex objects
	image?: ImageArray | null;
	link?: LinkArray;

	// Always include these common props
	global: any;
	metadata?: MetadataProps;
}
```

### 3. Handle Number Props with toRem()
When using `toRem()` with potentially undefined numbers:
```astro
const padding = toRem(settings?.padding || 0);
```

### 4. Handle Link Components
For Link components that expect specific types:
```astro
<Link link={link as any} />
```

## Example Implementations

### BlockImage.astro
```astro
---
import type { ImageArray, MetadataProps } from '../types/blocks.types';

interface Props {
	global: any;
	image: ImageArray | null;
	ratioMobile?: string;
	ratioDesktop?: string;
	span?: number;
	backgroundContainer?: boolean;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

const { global, image, ratioMobile, ratioDesktop, span, backgroundContainer, aboveFold, metadata } = Astro.props;
---
```

### BlockButton.astro
```astro
---
import type { LinkArray, ButtonSettings, ButtonColors, MetadataProps } from '../types/blocks.types';

interface Props {
	link: LinkArray;
	global: any;
	align?: string;
	className?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
	metadata?: MetadataProps;
}

const { link, global, align, className, buttonLocal, buttonSettings, buttonColors, metadata } = Astro.props;
---
```

### BlockIconList.astro
```astro
---
import type { LinkArray, MetadataProps } from '../types/blocks.types';

interface Props {
	items: Array<{
		icon?: {
			url: string;
			alt: string;
			source: string;
		} | null;
		linkObject: LinkArray;
		[key: string]: any;
	}>;
	font?: string;
	color?: string;
	size?: string;
	align?: string;
	iconSize?: string;
	iconGap?: string;
	iconListGap?: string;
	iconDirection?: string;
	metadata?: MetadataProps;
}

const { items, font, color, size, align, iconSize, iconGap, iconListGap, iconDirection, metadata } = Astro.props;
---
```

## Benefits of TypeScript Implementation

1. **IntelliSense Support** - Auto-completion for props
2. **Type Safety** - Catch errors at compile time
3. **Better Refactoring** - Safe renaming and restructuring
4. **Documentation** - Types serve as living documentation
5. **Consistency** - Ensures props match between PHP backend and Astro frontend

## Next Steps

Apply this pattern to all remaining block components:
- BlockVideo.astro
- BlockGallery.astro
- BlockSlider.astro
- BlockCode.astro
- BlockTitle.astro
- BlockLine.astro
- BlockVector.astro
- BlockDivider.astro
- BlockCard.astro
- BlockMenu.astro
- BlockIconList.astro
- BlockButtonBar.astro
- BlockAccordion.astro
- BlockQuoteSlider.astro
- BlockNavigation.astro
- BlockFeatured.astro
- BlockColumns.astro
- BlockGrid.astro

Each component should follow the same pattern based on the props it receives from Blocks.astro.
