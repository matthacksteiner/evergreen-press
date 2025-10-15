import path from 'path';
import { isPreviewMode, ensureTrailingSlash } from '@lib/helpers';
import type {
	KirbyError,
	Language,
	LanguageData,
	GlobalData,
	FontItem,
	FontData,
	FontSizeItem,
	PageData,
	SectionData,
} from '@app-types';

// Re-export types for backward compatibility
export type {
	KirbyError,
	Language,
	LanguageData,
	GlobalData,
	FontItem,
	FontData,
	FontSizeItem,
	PageData,
	SectionData,
};

// Re-export font functions from the new fonts.ts file
export { getFonts, getSizes } from './fonts';

const API_URL = import.meta.env.KIRBY_URL;
const DEV_MODE = import.meta.env.DEV;
const DEBUG = import.meta.env.DEBUG_MODE ?? false;
// Simple debug logger that only logs when DEBUG is true
function debugLog(message: string) {
	if (DEBUG) {
		console.warn(message);
	}
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

class KirbyApiError extends Error implements KirbyError {
	url: string;
	status: number;

	constructor(message: string, status: number, url: string) {
		super(message);
		this.status = status;
		this.url = url;
		this.name = 'KirbyApiError';
	}
}

// ============================================================================
// CORE API FUNCTIONS
// ============================================================================

/**
 * Check if we're in production mode
 * Production mode always uses local files
 */
function isProdMode(): boolean {
	return !DEV_MODE && !isPreviewMode();
}

/**
 * Determine the current data source mode
 * @returns A string indicating the current data source mode
 */
function getDataSourceMode(): 'api' | 'local' {
	if (isProdMode()) {
		// Production mode ALWAYS uses local files
		return 'local';
	}

	// Preview mode or dev mode use API
	return 'api';
}

// Reusable function for fetching data - use local files in build mode, API in preview mode or dev mode
async function fetchData<T>(uri: string): Promise<T> {
	const mode = getDataSourceMode();

	// In preview mode or dev mode, use direct API calls
	if (mode === 'api') {
		debugLog(
			`🔄 [${
				isPreviewMode() ? 'Preview' : 'Dev'
			}] Fetching from API: ${API_URL}${uri}`
		);

		try {
			const response = await fetch(API_URL + uri, {
				method: 'GET',
			});

			if (response.status !== 200) {
				throw new KirbyApiError(await response.text(), response.status, uri);
			}

			return response.json() as Promise<T>;
		} catch (error) {
			console.error(`Error fetching from API: ${uri}`, error);
			throw error;
		}
	}

	// In production mode, use local content files
	try {
		// Normalize the path for local file access
		const normalizedPath = uri.startsWith('/') ? uri.substring(1) : uri;
		debugLog(`📁 [Production] Using local file: /content/${normalizedPath}`);

		// Server-side vs client-side handling for imports
		if (typeof window === 'undefined') {
			// Server-side: use fs to read the JSON file
			const fs = await import('fs');
			const contentPath = path.join(
				process.cwd(),
				'public',
				'content',
				normalizedPath
			);

			if (!fs.existsSync(contentPath)) {
				if (isProdMode()) {
					console.error(`
---------------------------------------------------------------
CRITICAL ERROR: Content file not found in production mode: ${contentPath}
This indicates the content sync didn't run properly during build.
Make sure astro-kirby-sync plugin is running in production mode.
---------------------------------------------------------------`);
				}
				throw new Error(`Content file not found: ${contentPath}`);
			}

			const data = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
			return data as T;
		} else {
			// Client-side: use fetch to get the JSON file
			const response = await fetch(`/content/${normalizedPath}`);

			if (!response.ok) {
				if (isProdMode()) {
					console.error(`
---------------------------------------------------------------
CRITICAL ERROR: Content file could not be fetched in production mode: ${normalizedPath}
This indicates the content sync didn't run properly during build
or files were not properly deployed.
---------------------------------------------------------------`);
				}
				throw new Error(`Failed to fetch content file: ${normalizedPath}`);
			}

			return response.json() as Promise<T>;
		}
	} catch (error) {
		console.error(`Error loading local content file for ${uri}:`, error);

		if (isProdMode()) {
			console.error(`
---------------------------------------------------------------
CONTENT ERROR IN PRODUCTION MODE
This indicates the content sync didn't run properly during build.
Content files are missing or corrupted.
---------------------------------------------------------------`);
		}

		throw new KirbyApiError(`Failed to load content file: ${uri}`, 404, uri);
	}
}

// Generic data fetching function
export async function getData<T>(uri: string): Promise<T> {
	return fetchData<T>(uri);
}

/**
 * Log once per session when the data source changes
 * Only logs in development mode and only once to avoid console spam
 */
let hasLoggedDataSource = false;
function logDataSourceOnce() {
	if (DEV_MODE && !hasLoggedDataSource) {
		const mode = getDataSourceMode();
		const sourceInfo =
			mode === 'api'
				? `Using live API: ${API_URL}`
				: 'Using local content files';

		console.warn(`[Baukasten] ${sourceInfo}`);
		if (DEBUG) {
			console.warn('[Baukasten] Debug logging enabled');
		}

		hasLoggedDataSource = true;
	}
}

// ============================================================================
// GLOBAL DATA FUNCTIONS
// ============================================================================

export async function getGlobal(): Promise<GlobalData> {
	logDataSourceOnce();
	return fetchData<GlobalData>('/global.json');
}

export async function getFrontendUrl(): Promise<string> {
	const global = await getGlobal();
	return global.frontendUrl;
}

// ============================================================================
// LANGUAGE FUNCTIONS
// ============================================================================

export async function getLanguages(): Promise<LanguageData> {
	const global = await getGlobal();
	return {
		translations: global.translations,
		defaultLang: global.defaultLang,
		allLang: global.allLang,
		prefixDefaultLocale: global.prefixDefaultLocale,
	};
}

// ============================================================================
// PAGE AND CONTENT FUNCTIONS
// ============================================================================

// Get all pages for a specific language or default
export async function getAllPages(lang?: string): Promise<PageData[]> {
	const path = lang ? `/${lang}/index.json` : '/index.json';
	return fetchData<PageData[]>(path);
}

// Get specific page data
export async function getPage(slug: string, lang?: string): Promise<PageData> {
	const path = lang ? `/${lang}/${slug}.json` : `/${slug}.json`;
	try {
		return await fetchData<PageData>(path);
	} catch (error) {
		// If no language is specified and the page is not found at the root level,
		// try to fetch it using the default language as fallback
		if (!lang) {
			const global = await getGlobal();
			const defaultLang = global.defaultLang.code;
			console.warn(`Trying with default language: ${defaultLang}/${slug}`);
			return await fetchData<PageData>(`/${defaultLang}/${slug}.json`);
		}
		throw error;
	}
}

// Get section with its items
export async function getSection(
	section: string,
	lang?: string
): Promise<SectionData> {
	const path = lang ? `/${lang}/${section}.json` : `/${section}.json`;
	return fetchData<SectionData>(path);
}

// Get sections from all pages
export async function getSections(lang?: string): Promise<PageData[]> {
	const pages = await getAllPages(lang);
	return pages.filter((page) => page.intendedTemplate === 'section');
}

// Advanced function to get a page with optional redirection for missing pages
export async function getPageWithFallback(
	slug: string,
	lang?: string,
	fallbackUrl = '/404'
): Promise<PageData> {
	try {
		return await getPage(slug, lang);
	} catch (error) {
		if (error instanceof KirbyApiError && error.status === 404) {
			throw new Error(`REDIRECT:${fallbackUrl}`);
		}
		throw error;
	}
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON OPERATIONS
// ============================================================================

/**
 * Loads both page and global data at once for a given slug and language
 */
export async function getPageAndGlobal(
	slug: string,
	lang?: string
): Promise<{
	page: PageData;
	global: GlobalData;
}> {
	try {
		const pagePromise = getPage(slug, lang);
		const globalPromise = lang
			? getData<GlobalData>(`/${lang}/global.json`)
			: getGlobal();

		const [page, global] = await Promise.all([pagePromise, globalPromise]);

		return { page, global };
	} catch (error) {
		console.error(
			`Error loading data for ${slug} (${lang || 'default'})`,
			error
		);
		throw error;
	}
}

/**
 * Loads both section page, its items, and global data at once
 */
export async function getSectionAndGlobal(
	slug: string,
	lang?: string
): Promise<{
	section: PageData;
	items: PageData[];
	global: GlobalData;
}> {
	try {
		const sectionPromise = getSection(slug, lang);
		const globalPromise = lang
			? getData<GlobalData>(`/${lang}/global.json`)
			: getGlobal();

		const [sectionData, global] = await Promise.all([
			sectionPromise,
			globalPromise,
		]);

		return {
			section: sectionData,
			items: sectionData.items || [],
			global,
		};
	} catch (error) {
		console.error(
			`Error loading section data for ${slug} (${lang || 'default'})`,
			error
		);
		throw error;
	}
}

// ============================================================================
// LANGUAGE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get language information for the current context
 */
export async function getLanguageContext(currentLang?: string): Promise<{
	defaultLang: string;
	allLangs: Language[];
	translations: string[];
	prefixDefaultLocale: boolean;
	currentLang: string;
	selectedLang: Language;
}> {
	const global = await getGlobal();
	const defaultLang = global.defaultLang.code;
	const allLangs = global.allLang;
	const translations = global.translations.map((lang: Language) => lang.code);
	const prefixDefaultLocale = global.prefixDefaultLocale;

	// Determine current language
	const resolvedCurrentLang = currentLang || defaultLang;
	const selectedLang =
		allLangs.find((l: Language) => l.code === resolvedCurrentLang) ||
		global.defaultLang;

	return {
		defaultLang,
		allLangs,
		translations,
		prefixDefaultLocale,
		currentLang: resolvedCurrentLang,
		selectedLang,
	};
}

/**
 * Get the URL for a page in a specific language
 */
export async function getLocalizedPageUrl({
	targetLangCode,
	currentLang,
	currentPageSlug,
	isHome = false,
}: {
	targetLangCode: string;
	currentLang: string;
	currentPageSlug: string;
	isHome?: boolean;
}): Promise<string> {
	const { defaultLang, prefixDefaultLocale } = await getLanguageContext();

	// Home page handling
	if (isHome || currentPageSlug === 'home') {
		return targetLangCode === defaultLang && !prefixDefaultLocale
			? '/'
			: ensureTrailingSlash(`/${targetLangCode}`);
	}

	try {
		// Get pages in target language
		const targetPages = await getAllPages(targetLangCode);
		const currentPages = await getAllPages(currentLang);

		const currentPage = currentPages.find((page) => {
			const uri = page.uri.split('/').pop();
			return uri === currentPageSlug || page.uri === currentPageSlug;
		});

		// Find matching page in target language
		const targetPage = targetPages.find(
			(page) =>
				currentPage?.translations?.[targetLangCode] === page.uri ||
				page.translations?.[currentLang] === currentPage?.uri
		);

		if (targetPage) {
			return targetLangCode === defaultLang && !prefixDefaultLocale
				? ensureTrailingSlash(`/${targetPage.uri}`)
				: ensureTrailingSlash(`/${targetLangCode}/${targetPage.uri}`);
		}
	} catch (error) {
		console.error('Error fetching translations:', error);
	}

	// Fallback to language root if no translation found
	return targetLangCode === defaultLang && !prefixDefaultLocale
		? '/'
		: ensureTrailingSlash(`/${targetLangCode}`);
}

/**
 * Extract current page slug from URL path
 */
export function extractPageSlug({
	pathname,
	translations,
	isHome,
}: {
	pathname: string[];
	translations: string[];
	isHome: boolean;
}): string {
	if (isHome) {
		return 'home';
	}

	if (translations.includes(pathname[0])) {
		// URL format: /[lang]/[page]
		return pathname.slice(1).join('/') || 'home';
	}

	// URL format: /[page]
	return pathname.join('/');
}
