import {
	getData,
	getLanguages,
	getPageWithFallback,
	type GlobalData,
	type PageData,
} from '@lib/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PreviewState {
	pageData?: PageData;
	globalData?: GlobalData;
	errorState: boolean;
	sectionPageData?: any;
	currentLangCode?: string;
	endpointSlug: string;
}

// ============================================================================
// PREVIEW MODE DETECTION
// ============================================================================

// Function moved to helpers.ts and re-exported here for backward compatibility
export { isPreviewMode } from '@lib/helpers';

// ============================================================================
// PATH HANDLING
// ============================================================================

/**
 * Generates a preview URL path with optional language prefix
 * @param path - The base path to convert to preview mode
 * @param lang - Optional language code to include in the path
 */
export function getPreviewPath(path: string, lang?: string): string {
	if (!path.startsWith('/')) path = `/${path}`;
	return lang ? `/preview/${lang}${path}` : `/preview${path}`;
}

/**
 * Parses a preview path to extract language code and endpoint slug
 * @param slug - The URL slug to parse
 */
export function parsePreviewPath(slug?: string): {
	langCode?: string;
	endpointSlug: string;
} {
	if (!slug) {
		return { endpointSlug: 'home' };
	}

	const slugParts = slug.split('/');
	return {
		langCode: slugParts[0],
		endpointSlug: slugParts.length > 1 ? slugParts.slice(1).join('/') : 'home',
	};
}

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Loads all necessary data for preview mode including:
 * - Page data
 * - Global configuration
 * - Section data (if applicable)
 * - Language information
 *
 * Handles all error states and provides fallbacks where possible
 *
 * @param slug - The URL slug to load data for
 */
export async function loadPreviewData(slug?: string): Promise<PreviewState> {
	const state: PreviewState = {
		errorState: false,
		endpointSlug: 'home',
	};

	try {
		// Get languages and determine current language
		const languages = await getLanguages();
		const langCodes = languages.allLang
			.map((lang: any) => (typeof lang === 'string' ? lang : lang?.code || ''))
			.filter(Boolean);

		// Parse the path and determine language/slug
		if (!slug) {
			state.currentLangCode = undefined;
			state.endpointSlug = 'home';
		} else {
			const slugParts = slug.split('/');
			if (slugParts.length > 0 && langCodes.includes(slugParts[0])) {
				state.currentLangCode = slugParts[0];
				slugParts.shift();
				state.endpointSlug =
					slugParts.length > 0 ? slugParts.join('/') : 'home';
			} else {
				state.currentLangCode = undefined;
				state.endpointSlug = slug;
			}
		}

		try {
			// Load page and global data
			state.pageData = await getPageWithFallback(
				state.endpointSlug,
				state.currentLangCode
			);
			state.globalData = state.currentLangCode
				? await getData<GlobalData>(`/${state.currentLangCode}/global.json`)
				: await getData<GlobalData>(`/global.json`);

			// Handle section pages with pagination
			if (state.pageData?.intendedTemplate === 'section') {
				const endpoint = state.currentLangCode
					? `/${state.currentLangCode}/${state.endpointSlug}.json`
					: `/${state.endpointSlug}.json`;

				const sectionResult = await getData<PageData & { items: PageData[] }>(
					endpoint
				);
				const items = sectionResult.items || [];
				const pageSize = state.globalData?.paginationElements || 10;

				state.sectionPageData = {
					data: items.slice(0, pageSize),
					url: { current: state.endpointSlug, prev: null, next: null },
					currentPage: 1,
					lastPage: Math.ceil(items.length / pageSize),
				};
			}
		} catch (innerError) {
			console.error('Error in preview route:', innerError);

			// Load error page on inner error
			state.pageData = await getData<PageData>(`/error.json`);
			state.globalData = state.currentLangCode
				? await getData<GlobalData>(`/${state.currentLangCode}/global.json`)
				: await getData<GlobalData>(`/global.json`);
		}
	} catch (outerError) {
		console.error('Fatal error in preview route:', outerError);
		state.errorState = true;
	}

	return state;
}
