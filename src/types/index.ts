// Common interfaces and types for the project

// API Types
export type {
	ApiResponse,
	PaginatedResponse,
	KirbyError,
	Language,
	LanguageData,
	GlobalData,
	ContentBlock,
	PageData,
	SectionData,
	FontItem,
	FontData,
	FontSizeItem,
	ImageData,
	SectionItem,
} from './api.types';

// Configuration Types
export type { ScreenConfig, Environment, ThemeConfig } from './config.types';

// Block Types
export type {
	BaseBlockProps,
	BlockTextProps,
	BlockImageProps,
	BlockVideoProps,
	BlockGalleryProps,
	BlockCardProps,
	BlockSliderProps,
} from './blocks.types';

// Component Types
export type {
	BaseComponentProps,
	LayoutProps,
	NavigationProps,
	SeoProps,
	ImageProps,
	ButtonProps,
	PageRendererProps,
	SectionImageProps,
	BlockTextComponentProps,
} from './components.types';
