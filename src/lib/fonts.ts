import path from 'path';
import { isPreviewMode } from '@lib/helpers';
import { getGlobal } from '@lib/api';
import type { FontItem, FontData } from '@app-types';

// Create CSS for font sources
function createFontCSS(
	fontArray: FontItem[],
	usePreviewProxy = false
): FontData {
	if (!fontArray || fontArray.length === 0) {
		return { css: '', fonts: [] };
	}

	// Normalize font items to ensure consistent URLs
	const normalizedFonts = fontArray
		.map((item) => {
			// Ensure font items have properly encoded URLs
			return {
				name: item.name,
				woff: item.woff || item.originalWoff,
				woff2: item.woff2 || item.originalWoff2,
			};
		})
		.filter((item) => item.woff || item.woff2);

	if (normalizedFonts.length === 0) {
		return { css: '', fonts: [] };
	}

	const css = normalizedFonts
		.map((item) => {
			const sources: string[] = [];

			// Handle font sources differently for preview mode
			if (usePreviewProxy) {
				if (item.woff2) {
					sources.push(
						`url('/preview/font-proxy/?url=${encodeURIComponent(
							item.woff2
						)}') format('woff2')`
					);
				}
				if (item.woff) {
					sources.push(
						`url('/preview/font-proxy/?url=${encodeURIComponent(
							item.woff
						)}') format('woff')`
					);
				}
			} else {
				// For local mode, use fonts from /public/fonts folder
				if (item.woff2)
					sources.push(
						`url('/fonts/${path.basename(item.woff2)}') format('woff2')`
					);
				if (item.woff)
					sources.push(
						`url('/fonts/${path.basename(item.woff)}') format('woff')`
					);
			}

			if (sources.length === 0) return '';

			return `@font-face {
        font-family: '${item.name}';
        src: ${sources.join(',\n        ')};
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }`;
		})
		.filter((css) => css !== '')
		.join('\n');

	return { css, fonts: normalizedFonts };
}

// Get fonts function
export async function getFonts(): Promise<FontData> {
	try {
		// For preview mode, we still use the API
		if (isPreviewMode()) {
			const global = await getGlobal();

			if (!global.font || global.font.length === 0) {
				return { css: '', fonts: [] };
			}

			// Create font array with proxy URLs for both CSS and preload
			const fontArray = global.font
				.map((item) => {
					// For preview mode, we don't use the original URLs at all
					// Instead, we send empty URLs in the fontArray so they don't get preloaded directly
					// The CSS will use the proxy URLs instead
					return {
						name: item.name,
						// Include original URLs as data attributes for debugging
						woff: '', // Don't preload the direct URL
						woff2: '', // Don't preload the direct URL
						originalWoff: item.url1,
						originalWoff2: item.url2,
					};
				})
				.filter((item) => item.originalWoff || item.originalWoff2);

			// Use special handling for preview mode to generate CSS with proxied URLs
			const css = fontArray
				.map((item) => {
					const sources: string[] = [];

					if (item.originalWoff2) {
						sources.push(
							`url('/preview/font-proxy/?url=${encodeURIComponent(
								item.originalWoff2
							)}') format('woff2')`
						);
					}

					if (item.originalWoff) {
						sources.push(
							`url('/preview/font-proxy/?url=${encodeURIComponent(
								item.originalWoff
							)}') format('woff')`
						);
					}

					if (sources.length === 0) return '';

					return `@font-face {
						font-family: '${item.name}';
						src: ${sources.join(',\n\t\t\t ')};
						font-weight: normal;
						font-style: normal;
						font-display: swap;
					}`;
				})
				.filter((css) => css !== '')
				.join('\n');

			return { css, fonts: fontArray };
		}

		// For local mode, use fonts from the global data
		const global = await getGlobal();

		if (!global.font || global.font.length === 0) {
			return { css: '', fonts: [] };
		}

		// Create font array from global.font
		const fontArray = global.font
			.map((item) => {
				return {
					name: item.name,
					woff: item.url1,
					woff2: item.url2,
				};
			})
			.filter((item) => item.woff || item.woff2);

		// Generate CSS for fonts
		return createFontCSS(fontArray, false);
	} catch (error) {
		console.error('Error loading fonts:', error);
		return { css: '', fonts: [] };
	}
}

// Function to get sizes to use in CSS variables
export async function getSizes(): Promise<string> {
	const baseFontSize = 16;
	const global = await getGlobal();

	return global.fontSize
		.map((item) => {
			const sizeMobile = item.sizeMobile || baseFontSize;
			const lineHeightMobile = item.lineHeightMobile || sizeMobile;
			const letterSpacingMobile = item.letterSpacingMobile || 0;

			const sizeDesktop = item.sizeDesktop || sizeMobile;
			const lineHeightDesktop = item.lineHeightDesktop || lineHeightMobile;
			const letterSpacingDesktop =
				item.letterSpacingDesktop || letterSpacingMobile;

			const sizeDesktopXl = item.sizeDesktopXl || sizeDesktop;
			const lineHeightDesktopXl = item.lineHeightDesktopXl || lineHeightDesktop;
			const letterSpacingDesktopXl =
				item.letterSpacingDesktopXl || letterSpacingDesktop;

			return `
        .font--${item.name} {
          font-size: ${sizeMobile / baseFontSize}rem;
          line-height: ${lineHeightMobile / sizeMobile};
          letter-spacing: ${letterSpacingMobile / sizeMobile}em;
          text-transform: ${item.transform};
          text-decoration: ${item.decoration};
        }
        @media (min-width: 768px) and (max-width: 1919px) {
          .font--${item.name} {
            font-size: ${sizeDesktop / baseFontSize}rem;
            line-height: ${lineHeightDesktop / sizeDesktop};
            letter-spacing: ${letterSpacingDesktop / sizeDesktop}em;
            text-transform: ${item.transform};
            text-decoration: ${item.decoration};
          }
        }
        @media (min-width: 1920px) {
          .font--${item.name} {
            font-size: ${sizeDesktopXl / baseFontSize}rem;
            line-height: ${lineHeightDesktopXl / sizeDesktopXl};
            letter-spacing: ${letterSpacingDesktopXl / sizeDesktopXl}em;
            text-transform: ${item.transform};
            text-decoration: ${item.decoration};
          }
        }
      `;
		})
		.join('');
}
