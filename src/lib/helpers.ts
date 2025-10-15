import type { AstroGlobal } from 'astro';

/**
 * Checks if the current page is the home page
 * @param pageContext - The Astro global context
 * @returns boolean indicating if current page is home
 */
export function checkIsHome(pageContext: AstroGlobal): boolean {
	const path = pageContext.url.pathname;
	const currentLang = pageContext.currentLocale;

	return (
		path === '/' || path === `/${currentLang}` || path === `/${currentLang}/`
	);
}

/**
 * Determines if the current request is in preview mode
 * Preview mode is only available on the server and when the path includes /preview/
 * @returns boolean indicating if preview mode is active
 */
export function isPreviewMode(): boolean {
	const isServer = typeof window === 'undefined';
	const astroPath = process.env.ASTRO_PATH;
	return (
		isServer &&
		!!astroPath &&
		(astroPath.includes('/preview/') || astroPath === '/preview')
	);
}

/**
 * Converts a pixel value to rem units
 * @param value - The pixel value to convert
 * @returns string with rem unit
 */
export function toRem(value: number): string {
	return `${value / 16}rem`;
}

/**
 * Generates a human-readable alt text from an image name
 * @param name - The image name to convert
 * @returns Formatted alt text string
 */
export function getAltFallback(name?: string): string {
	return name
		? name
				.replace(/[-_]/g, ' ')
				.replace(/[^\w\s]/g, '')
				.replace(/\b\w/g, (char) => char.toUpperCase())
		: 'Image';
}

/**
 * Ensures a URL has a trailing slash for internal page links
 * External URLs, anchor links, and file links are returned unchanged
 * @param url - The URL to process
 * @param isInternalPage - Whether this is an internal page link (defaults to true)
 * @returns URL with trailing slash if it's an internal page link
 */
export function ensureTrailingSlash(
	url: string,
	isInternalPage: boolean = true
): string {
	// Don't modify external URLs, anchor links, or special URLs
	if (
		!isInternalPage ||
		url.startsWith('http') ||
		url.startsWith('//') ||
		url.includes('#') ||
		url.startsWith('mailto:') ||
		url.startsWith('tel:') ||
		url === '/' ||
		url === ''
	) {
		return url;
	}

	// Ensure trailing slash for internal page links
	return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Prepares SVG source for better inline rendering by adding viewBox and setting dimensions
 * @param svgSource - The SVG source code to process
 * @param fallbackWidth - Optional fallback width if not found in SVG attributes
 * @param fallbackHeight - Optional fallback height if not found in SVG attributes
 * @returns Processed SVG source with viewBox and 100% dimensions
 */
export function prepareSvgSource(
	svgSource: string,
	fallbackWidth?: number | string,
	fallbackHeight?: number | string
): string {
	if (!svgSource) return '';

	// Generate a unique ID for this SVG instance
	const uniqueId = `svg-${Math.random().toString(36).slice(2, 11)}`;

	// First, scope any internal style classes to prevent conflicts
	let processedSvg = svgSource;

	// Find and process <style> tags
	processedSvg = processedSvg.replace(
		/<style([^>]*)>([\s\S]*?)<\/style>/gi,
		(_match, attributes, styleContent) => {
			// Scope all class selectors by prepending the unique ID
			const scopedStyles = styleContent.replace(
				/\.([a-zA-Z0-9_-]+)/g,
				`.${uniqueId} .$1`
			);
			return `<style${attributes}>${scopedStyles}</style>`;
		}
	);

	// Add the unique ID as a class to the SVG element
	// Add viewBox if missing and ensure width/height are set to 100%
	const svgWithViewBox = processedSvg.replace(
		/<svg([^>]*)>/i,
		(_match, attributes) => {
			let newAttributes = attributes;

			// Extract original width and height if present
			const widthMatch = attributes.match(/\bwidth\s*=\s*["']([^"']*)["']/i);
			const heightMatch = attributes.match(/\bheight\s*=\s*["']([^"']*)["']/i);
			const origWidth = widthMatch ? widthMatch[1] : fallbackWidth;
			const origHeight = heightMatch ? heightMatch[1] : fallbackHeight;

			// If no viewBox but has width/height, add viewBox
			if (!attributes.includes('viewBox') && origWidth && origHeight) {
				newAttributes += ` viewBox="0 0 ${origWidth} ${origHeight}"`;
			}

			// Set width and height to 100% but preserve aspect ratio
			newAttributes = newAttributes
				.replace(/\bwidth\s*=\s*["'][^"']*["']/i, 'width="100%"')
				.replace(/\bheight\s*=\s*["'][^"']*["']/i, 'height="100%"');

			// If width/height weren't in the original, add them
			if (!widthMatch) newAttributes += ' width="100%"';
			if (!heightMatch) newAttributes += ' height="100%"';

			// Add preserveAspectRatio to maintain consistent sizing
			if (!attributes.includes('preserveAspectRatio')) {
				newAttributes += ' preserveAspectRatio="xMidYMid meet"';
			}

			// Add the unique class for scoping styles
			if (attributes.includes('class=')) {
				newAttributes = newAttributes.replace(
					/class\s*=\s*["']([^"']*)["']/i,
					`class="${uniqueId} $1"`
				);
			} else {
				newAttributes += ` class="${uniqueId}"`;
			}

			return `<svg${newAttributes}>`;
		}
	);

	return svgWithViewBox;
}
