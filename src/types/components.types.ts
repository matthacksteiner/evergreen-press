import type {
	PageData,
	GlobalData,
	SectionItem,
	ContentBlock,
} from '@app-types/api.types';
import type {
	LinkArray,
	ImageArray,
	SvgArray,
	ButtonSettings,
	ButtonColors,
	MetadataProps,
} from '@app-types/blocks.types';

// Common Component Props
export interface BaseComponentProps {
	class?: string;
	id?: string;
}

// Link Component Types
export interface BaseLink {
	type: 'url' | 'page' | 'file' | 'email' | 'tel';
	href: string;
	title?: string;
	popup?: boolean;
}

export interface PageLink extends BaseLink {
	type: 'page';
	uri: string;
	hash?: string;
}

export interface FileLink extends BaseLink {
	type: 'file';
	uri: string; // File links use uri property for the actual file URL
	downloadFilename?: string;
}

export interface LinkComponentProps {
	// Required props
	link: BaseLink | PageLink | FileLink;

	// Optional props
	class?: string;
}

// Layout Components
export interface LayoutProps extends BaseComponentProps {
	title?: string;
	description?: string;
	lang?: string;
}

// Navigation Components
export interface NavigationProps extends BaseComponentProps {
	items: Array<{
		label: string;
		href: string;
		active?: boolean;
		children?: Array<{
			label: string;
			href: string;
		}>;
	}>;
}

// SEO Components
export interface SeoProps {
	title?: string;
	description?: string;
	image?: string;
	canonicalURL?: string;
	type?: string;
	lang?: string;
}

// Media Components
export interface ImageProps extends BaseComponentProps {
	src: string;
	alt?: string;
	width?: number;
	height?: number;
	loading?: 'lazy' | 'eager';
	decoding?: 'async' | 'sync' | 'auto';
	class?: string;
}

// Interactive Components
export interface ButtonProps extends BaseComponentProps {
	variant?: 'primary' | 'secondary' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';
	onClick?: () => void;
}

// Page Components
export interface PageRendererProps {
	slug: string;
	lang?: string;
	data?: PageData;
	global?: GlobalData;
	page?: any;
	maintenanceMode?: boolean;
}

// Section Components
export interface SectionImageProps extends BaseComponentProps {
	item: SectionItem;
	global: any;
	ratioMobile: string;
	ratioDesktop: string;
	span?: number;
	spanDesktop?: number;
	titleLevel?: string;
	titleFont?: string;
	titleColor?: string;
	titleSize?: string;
	titleAlign?: string;
	textFont?: string;
	textColor?: string;
	textSize?: string;
	textAlign?: string;
	fontTitleToggle?: boolean;
	fontTextToggle?: boolean;
	captionAlign?: string;
	captionControls?: string[];
	captionOverlayRange?: number;
	captionColor?: string;
	titleClass?: string;
	textClass?: string;
	textContentClass?: string;
	lang?: string;
	backgroundContainer?: string;
}

// Component Props
export interface CardContentComponentProps {
	title?: string;
	text?: string;
	image?: any;
	hovertoggle?: boolean;
	justify?: string;
	Level?: string;
	titleFont?: string;
	titleSize?: string;
	titleAlign?: string;
	textFont?: string;
	textSize?: string;
	textAlign?: string;
	widthMobile?: string;
	widthDesktop?: string;
	widthAlign?: string;
}

export interface ColumnsComponentProps {
	columns: Array<{
		id: string;
		width: number;
		span: number;
		nested: boolean;
		blocks: any[];
	}>;
	global: any;
	span?: number;
	backgroundContainer?: boolean;
	backgroundPadding?: 'left' | 'right' | 'none' | string;
	data?: any;
}

export interface CookieConsentComponentProps {
	global: any;
	googleAnalyticsToggle?: boolean;
	googleAnalyticsCode?: string;
	lang: string;
}

export interface FooterComponentProps {
	data: any;
	global: any;
}

export interface HamburgerComponentProps {
	data: any;
	global: any;
}

export interface HeaderComponentProps {
	global: any;
	data: any;
	lang: string;
}

export interface ImageCaptionComponentProps {
	caption?: string;
	copyright?: string;
	align?: string;
	controls?: string[];
	overlayRange?: number;
	color?: string;
	global?: any;
	captiontitle?: string;
	captiontextfont?: string;
	captiontextsize?: string;
	captiontextcolor?: string;
	captiontextalign?: string;
	captionalign?: string;
}

export interface ImageComponentComponentProps {
	global: any;
	image: any;
	ratioMobile?: string;
	ratioDesktop?: string;
	loading?: 'auto' | 'eager' | 'lazy';
	span?: number;
	backgroundContainer?: boolean;
	lightbox?: boolean;
	aboveFold?: boolean;
	isFirstSlide?: boolean;
}

export interface ImageCopyrightComponentProps {
	content?: string;
	align?: string;
	color?: string;
	copyrighttitle?: string;
	copyrighttextfont?: string;
	copyrighttextsize?: string;
	copyrighttextcolor?: string;
	copyrightposition?: string;
	copyrighbackgroundcolor?: string;
}

export interface KirbyMetaComponentProps {
	data: any;
	global: any;
	lang: string;
	pageTitle?: string;
}

export interface LanguagePickerComponentProps {
	global: any;
	class?: string;
	font?: string;
}

export interface LayoutsComponentProps {
	layouts: any[];
	data: any;
	global: any;
	class?: string;
}

export interface NavLinksComponentProps {
	links: Array<{
		label: string;
		href: string;
		active?: boolean;
		children?: Array<{
			label: string;
			href: string;
		}>;
		uri?: string;
		title?: string;
		classes?: string[];
		hash?: string;
		type?: string;
		popup?: boolean;
	}>;
	global: any;
	data: any;
}

export interface NavigationComponentProps {
	data: any;
	global: any;
}

export interface PageRendererComponentProps {
	slug: string;
	lang?: string;
	data?: any;
	global?: any;
	page?: any;
	maintenanceMode?: boolean;
}

export interface PaginationComponentProps {
	data: any;
	global: any;
	lang: string;
	length?: number;
	currentPage?: number;
	firstUrl?: string;
	prevUrl?: string;
	nextUrl?: string;
}

export interface PreviewErrorComponentProps {
	slug: string;
	lang: string;
	error: any;
	title?: string;
	message?: string;
}

export interface ScrollButtonComponentProps {
	global: any;
	controls?: string[];
	color?: string;
	size?: string;
}

export interface SectionComponentProps {
	item: any;
	global: any;
	lang: string;
	data?: any;
	page?: any;
}

export interface VectorImageComponentProps {
	image: any;
	widthMobile?: string;
	widthDesktop?: string;
	widthAlign?: string;
	noLink?: boolean | string;
	class?: string;
}

// ========================================
// BLOCK COMPONENT PROPS
// ========================================

// Text Block Component
export interface BlockTextComponentProps {
	text: string;
	font?: string;
	size?: string;
	align?: string;
	color?: string;
	headlines?: any;
	metadata?: MetadataProps;
}

// Title Block Component
export interface BlockTitleComponentProps {
	title: string;
	Level?: string;
	font?: string;
	color?: string;
	size?: string;
	align?: string;
	metadata?: MetadataProps;
}

// Button Block Component
export interface BlockButtonComponentProps {
	link: LinkArray;
	global: any;
	align?: string;
	className?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
	metadata?: MetadataProps;
}

// Contact Form Block Component
export interface BlockContactFormComponentProps {
	formName?: string;
	emailSubject?: string;
	successPage?: LinkArray;
	spamProtection?: 'captcha' | 'honeypot' | 'none';
	fields?: {
		firstname?: {
			label?: string;
			placeholder?: string;
			help?: string;
			required?: boolean;
		};
		lastname?: {
			label?: string;
			placeholder?: string;
			help?: string;
			required?: boolean;
		};
		email?: {
			label?: string;
			placeholder?: string;
			help?: string;
		};
		message?: {
			label?: string;
			placeholder?: string;
			rows?: number;
			help?: string;
			required?: boolean;
		};
		submitButton?: {
			placeholder?: string;
		};
		successMessage?: {
			text?: string;
		};
		errorMessage?: {
			text?: string;
		};
	};
	fieldSpacing?: 'small' | 'medium' | 'large';
	formWidth?: 'full' | 'large' | 'medium' | 'small';
	formAlign?: 'left' | 'center' | 'right';
	textFont?: string;
	textColor?: string;
	textSize?: string;
	formBorderRadius?: number;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings | null;
	buttonColors?: ButtonColors | null;
	buttonAlign?: 'start' | 'center' | 'end';
	global: any;
	metadata?: MetadataProps;
}

// Image Block Component
export interface BlockImageComponentProps {
	global: any;
	image: ImageArray | null;
	ratioMobile?: string;
	ratioDesktop?: string;
	span?: number;
	backgroundContainer?: boolean;
	lightbox?: boolean;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

// Vector Block Component
export interface BlockVectorComponentProps {
	image: SvgArray | null;
	widthMobile?: string;
	widthDesktop?: string;
	widthAlign?: string;
	metadata?: MetadataProps;
}

// Video Block Component
export interface BlockVideoComponentProps {
	source?: string;
	url?: string;
	file?: {
		url: string;
		alt: string;
		identifier: string;
		classes: string;
	} | null;
	options?: any;
	ratioMobile?: string;
	ratioDesktop?: string;
	width?: string;
	height?: string;
	thumbnail?: {
		url: string;
		alt: string;
	} | null;
	toggle?: boolean;
	Level?: string;
	text?: string;
	font?: string;
	textcolor?: string;
	size?: string;
	align?: string;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

// Gallery Block Component
export interface BlockGalleryComponentProps {
	images: ImageArray[];
	layoutType?: string;
	lightbox?: boolean;
	viewMobile?: string;
	viewDesktop?: string;
	viewPaddingMobile?: string;
	viewPaddingDesktop?: string;
	ratioMobile?: string;
	ratioDesktop?: string;
	span?: number;
	global: any;
	backgroundContainer?: boolean;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

// Slider Block Component
export interface BlockSliderComponentProps {
	images: (ImageArray & { toggle?: boolean })[];
	toggle?: boolean;
	Level?: string;
	text?: string;
	font?: string;
	textcolor?: string;
	size?: string;
	align?: string;
	ratioMobile?: string;
	ratioDesktop?: string;
	controls?: string;
	color?: string;
	time?: string;
	effect?: string;
	direction?: string;
	viewMobile?: string;
	viewDesktop?: string;
	viewPaddingMobile?: string;
	viewPaddingDesktop?: string;
	span?: number;
	global: any;
	backgroundContainer?: boolean;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

// Card Block Component
export interface BlockCardComponentProps {
	title?: string;
	text?: string;
	image?: SvgArray | null;
	hovertoggle?: boolean;
	hovertext?: string;
	linkToggle?: boolean;
	link?: LinkArray;
	aspectRatio?: string;
	justify?: string;
	level?: string;
	titleFont?: string;
	titleSize?: string;
	titleAlign?: string;
	textFont?: string;
	textSize?: string;
	textAlign?: string;
	widthMobile?: string;
	widthDesktop?: string;
	widthAlign?: string;
	cardBackgroundColor?: string;
	cardBackgroundColorActive?: string;
	cardTextColor?: string;
	cardTextColorActive?: string;
	cardBorderColor?: string;
	cardBorderColorActive?: string;
	cardBorderWidth?: string;
	cardBorderRadius?: string;
	cardBorderPaddingDesktop?: string;
	cardBorderPaddingMobile?: string;
	metadata?: MetadataProps;
}

// Code Block Component
export interface BlockCodeComponentProps {
	code: string;
	metadata?: MetadataProps;
}

// Line Block Component
export interface BlockLineComponentProps {
	borderStyle?: string;
	borderWidth?: string;
	borderColor?: string;
	metadata?: MetadataProps;
}

// Divider Block Component
export interface BlockDividerComponentProps {
	global: any;
	spacingMobileTop?: string;
	spacingMobileBottom?: string;
	spacingDesktopTop?: string;
	spacingDesktopBottom?: string;
	metadata?: MetadataProps;
}

// Menu Block Component
export interface BlockMenuComponentProps {
	items: Array<{
		linkobject: LinkArray;
		[key: string]: any;
	}>;
	font?: string;
	color?: string;
	size?: string;
	align?: string;
	gap?: string;
	global: any;
	metadata?: MetadataProps;
}

// Icon List Block Component
export interface BlockIconListComponentProps {
	items: Array<{
		icon?: {
			url: string;
			alt: string;
			source: string;
			width?: number | string;
			height?: number | string;
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

// Button Bar Block Component
export interface BlockButtonBarComponentProps {
	buttons: Array<{
		linkobject: LinkArray;
		[key: string]: any;
	}>;
	global: any;
	adjust?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
	metadata?: MetadataProps;
}

// Navigation Block Component
export interface BlockNavigationComponentProps {
	previousToggle?: boolean;
	nextToggle?: boolean;
	previousLabel?: string;
	nextLabel?: string;
	navigationAlign?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
	global: any;
	data?: any;
	metadata?: MetadataProps;
}

// Accordion Block Component
export interface BlockAccordionComponentProps {
	items: Array<{
		[key: string]: any;
	}>;
	Level?: string;
	titleFont?: string;
	titleColor?: string;
	titleSize?: string;
	textFont?: string;
	textColor?: string;
	textSize?: string;
	textAlign?: string;
	headlines?: any;
	borderWidth?: string;
	borderColor?: string;
	metadata?: MetadataProps;
}

// Quote Slider Block Component
export interface BlockQuoteSliderComponentProps {
	items: Array<{
		[key: string]: any;
	}>;
	titleFont?: string;
	titleColor?: string;
	titleSize?: string;
	textFont?: string;
	textColor?: string;
	textSize?: string;
	textAlign?: string;
	titleAlign?: string;
	controls?: string;
	color?: string;
	time?: string;
	metadata?: MetadataProps;
}

// Featured Block Component
export interface BlockFeaturedComponentProps {
	items: Array<{
		id: string;
		title: string;
		description: string;
		uri: string;
		url: string;
		status: string;
		position: number;
		thumbnail: ImageArray | null;
		coverOnly: boolean;
	}>;
	titleLevel?: string;
	titleFont?: string;
	titleColor?: string;
	titleSize?: string;
	titleAlign?: string;
	textFont?: string;
	textColor?: string;
	textSize?: string;
	textAlign?: string;
	spanMobile?: string;
	spanDesktop?: string;
	gapMobile?: string;
	gapDesktop?: string;
	gapHorizontalMobile?: string;
	gapHorizontalDesktop?: string;
	ratioMobile?: string;
	ratioDesktop?: string;
	fontTitleToggle?: boolean;
	fontTextToggle?: boolean;
	captionAlign?: string;
	captionControls?: string[];
	captionOverlayRange?: number;
	captionColor?: string;
	global: any;
	span?: number;
	metadata?: MetadataProps;
}

// Columns Block Component
export interface BlockColumnsComponentProps {
	columns: Array<{
		id: string;
		width: number;
		span: number;
		nested: boolean;
		blocks: ContentBlock[];
	}>;
	global: any;
	span?: number;
	metadata?: MetadataProps;
}

// Grid Block Component
export interface BlockGridComponentProps {
	grid: {
		content: {
			title?: string;
			grid: Array<{
				id: string;
				columns: Array<{
					id: string;
					width: number;
					span: number;
					nested: boolean;
					blocks: ContentBlock[];
				}>;
			}>;
		};
	};
	global: any;
	span?: number;
	metadata?: MetadataProps;
}
