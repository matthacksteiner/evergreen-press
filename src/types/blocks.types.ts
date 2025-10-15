import type { ContentBlock } from './api.types';

// Base interfaces for commonly used structures
export interface MetadataProps {
	identifier?: string;
	classes?: string;
	attributes?: Record<string, any>;
}

export interface LinkArray {
	href?: string;
	uri?: string;
	url?: string;
	text?: string;
	target?: string;
	type?: string;
}

export interface ImageArray {
	url: string;
	width: number;
	height: number;
	alt: string;
	name: string;
	identifier: string;
	classes: string;
	captiontoggle: boolean;
	captiontitle: string;
	captiontextfont: string;
	captiontextsize: string;
	captiontextcolor: string;
	captiontextalign: string;
	captionoverlay: string;
	captionalign: string;
	captionOverlayRange: number;
	captionColor: string;
	linktoggle: boolean;
	linkexternal: LinkArray;
	// Focus-related properties (for non-SVG images with ratios)
	thumbhash?: string;
	urlFocus?: string;
	urlFocusMobile?: string;
	focusX?: number;
	focusY?: number;
	// Copyright properties
	copyrighttoggle?: boolean;
	copyrighttitle?: string;
	copyrighttextfont?: string;
	copyrighttextsize?: string;
	copyrighttextcolor?: string;
	copyrighbackgroundcolor?: string;
	copyrightposition?: string;
}

export interface SvgArray {
	url: string;
	width: number;
	height: number;
	alt: string;
	name: string;
	identifier: string;
	classes: string;
	linktoggle: boolean;
	linkexternal: LinkArray;
	source: string;
}

export interface ButtonSettings {
	buttonfont?: string;
	buttonfontsize?: string;
	buttonborderradius?: number;
	buttonborderwidth?: number;
	buttonpadding?: number;
}

export interface ButtonColors {
	buttonbackgroundcolor?: string;
	buttonbackgroundcoloractive?: string;
	buttontextcolor?: string;
	buttontextcoloractive?: string;
	buttonbordercolor?: string;
	buttonbordercoloractive?: string;
}

// Base Block Props
export interface BaseBlockProps {
	type: string;
	id: string;
	content: {
		metadata?: MetadataProps;
	};
}

// Text Block
export interface BlockTextProps extends BaseBlockProps {
	text: string;
	font?: string;
	color?: string;
	size?: string;
	align?: string;
	headlines?: any;
}

// Title Block
export interface BlockTitleProps extends BaseBlockProps {
	title: string;
	Level?: string;
	font?: string;
	color?: string;
	size?: string;
	align?: string;
}

// Image Block
export interface BlockImageProps extends BaseBlockProps {
	global: any;
	image: ImageArray | null;
	ratioMobile?: string;
	ratioDesktop?: string;
	span?: number;
	backgroundContainer?: boolean;
	aboveFold?: boolean;
}

// Vector Block
export interface BlockVectorProps extends BaseBlockProps {
	image: SvgArray | null;
	widthMobile?: string;
	widthDesktop?: string;
	widthAlign?: string;
}

// Video Block
export interface BlockVideoProps extends BaseBlockProps {
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
	aboveFold?: boolean;
}

// Gallery Block
export interface BlockGalleryProps extends BaseBlockProps {
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
}

// Slider Block
export interface BlockSliderProps extends BaseBlockProps {
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
}

// Code Block
export interface BlockCodeProps extends BaseBlockProps {
	code: string;
}

// Line Block
export interface BlockLineProps extends BaseBlockProps {
	borderStyle?: string;
	borderWidth?: string;
	borderColor?: string;
}

// Divider Block
export interface BlockDividerProps extends BaseBlockProps {
	global: any;
	spacingMobileTop?: string;
	spacingMobileBottom?: string;
	spacingDesktopTop?: string;
	spacingDesktopBottom?: string;
}

// Button Block
export interface BlockButtonProps extends BaseBlockProps {
	link: LinkArray;
	global: any;
	align?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
}

// Button Bar Block
export interface BlockButtonBarProps extends BaseBlockProps {
	buttons: Array<{
		linkobject: LinkArray;
		[key: string]: any;
	}>;
	global: any;
	adjust?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
}

// Menu Block
export interface BlockMenuProps extends BaseBlockProps {
	items: Array<{
		linkobject: LinkArray;
		[key: string]: any;
	}>;
	font?: string;
	color?: string;
	size?: string;
	gap?: string;
	global: any;
}

// Icon List Block
export interface BlockIconListProps extends BaseBlockProps {
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
}

// Card Block
export interface BlockCardProps extends BaseBlockProps {
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
}

// Navigation Block
export interface BlockNavigationProps extends BaseBlockProps {
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
}

// Columns Block
export interface BlockColumnsProps extends BaseBlockProps {
	columns: Array<{
		id: string;
		width: number;
		span: number;
		nested: boolean;
		blocks: ContentBlock[];
	}>;
	global: any;
	span?: number;
}

// Grid Block
export interface BlockGridProps extends BaseBlockProps {
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
}

// Featured Block
export interface BlockFeaturedProps extends BaseBlockProps {
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
}

// Accordion Block
export interface BlockAccordionProps extends BaseBlockProps {
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
}

// Quote Slider Block
export interface BlockQuoteSliderProps extends BaseBlockProps {
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
}

// Contact Form Block
export interface BlockContactFormProps extends BaseBlockProps {
	formName: string;
	emailSubject: string;
	successPage?: LinkArray;
	spamProtection: 'captcha' | 'honeypot' | 'none';
	fields?: {
		firstname?: {
			label?: string;
			placeholder?: string;
			help?: string;
		};
		lastname?: {
			label?: string;
			placeholder?: string;
			help?: string;
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
	formBorderRadius?: number;
	textGroup?: {
		textfont?: string;
		textcolor?: string;
		textsize?: string;
	};
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings | null;
	buttonColors?: ButtonColors | null;
	buttonAlign?: 'start' | 'center' | 'end';
	global: any;
}
