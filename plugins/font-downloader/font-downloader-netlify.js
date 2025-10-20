import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { createHash } from 'crypto';

/**
 * Generate SHA-256 hash of font configuration
 */
function generateFontConfigHash(fonts) {
	const configString = JSON.stringify(
		fonts.map((f) => ({
			name: f.name,
			url1: f.url1,
			url2: f.url2,
		}))
	);
	return createHash('sha256').update(configString).digest('hex');
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
	let lastError;
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (attempt < maxRetries) {
				const delay = baseDelay * Math.pow(2, attempt);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}
	throw lastError;
}

/**
 * Download a font file with retries and timeout
 */
async function downloadFont(url, options = {}) {
	const { timeout = 30000, maxRetries = 3, retryDelay = 1000 } = options;

	return retryWithBackoff(
		async () => {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const response = await fetch(url, {
					signal: controller.signal,
					headers: {
						'User-Agent': 'Baukasten-Font-Downloader/1.0',
					},
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				return await response.arrayBuffer();
			} catch (error) {
				clearTimeout(timeoutId);
				throw error;
			}
		},
		maxRetries,
		retryDelay
	);
}

/**
 * Get font cache state file path
 */
function getFontCacheStatePath() {
	const astroDir = path.resolve('./.astro');
	if (!fs.existsSync(astroDir)) {
		fs.mkdirSync(astroDir, { recursive: true });
	}
	return path.join(astroDir, 'font-cache-state.json');
}

/**
 * Load font cache state
 */
function loadFontCacheState() {
	const stateFile = getFontCacheStatePath();
	if (!fs.existsSync(stateFile)) {
		return {
			lastSync: null,
			configHash: null,
			fonts: [],
			version: '1.0.0',
		};
	}

	try {
		return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
	} catch (error) {
		console.warn('Invalid font cache state, starting fresh:', error.message);
		return {
			lastSync: null,
			configHash: null,
			fonts: [],
			version: '1.0.0',
		};
	}
}

/**
 * Save font cache state
 */
function saveFontCacheState(state) {
	const stateFile = getFontCacheStatePath();
	try {
		fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
	} catch (error) {
		console.error('Error saving font cache state:', error);
	}
}

/**
 * Check if font configuration has changed
 */
function hasFontConfigChanged(fonts, cachedState) {
	const newHash = generateFontConfigHash(fonts);
	return !cachedState.configHash || cachedState.configHash !== newHash;
}

/**
 * Download fonts with caching support
 */
async function downloadFontsWithCache(fonts, options = {}) {
	const fontsDir = path.resolve('./public/fonts');
	const defaultOptions = {
		timeout: 30000,
		maxRetries: 3,
		retryDelay: 1000,
	};
	const opts = { ...defaultOptions, ...options };

	// Ensure fonts directory exists
	if (!fs.existsSync(fontsDir)) {
		fs.mkdirSync(fontsDir, { recursive: true });
	}

	// Load cache state
	const cacheState = loadFontCacheState();
	const configChanged = hasFontConfigChanged(fonts, cacheState);

	if (!configChanged && cacheState.fonts.length > 0) {
		console.warn(
			chalk.green(
				`✅ [Font Downloader] Font configuration unchanged, using ${cacheState.fonts.length} cached font(s)`
			)
		);
		console.warn(
			chalk.gray(
				`🕐 Last sync: ${new Date(cacheState.lastSync).toLocaleString()}`
			)
		);

		// Verify cached fonts still exist
		const allFilesExist = cacheState.fonts.every((font) => {
			const woffExists =
				!font.woff ||
				fs.existsSync(path.join(fontsDir, path.basename(font.woff)));
			const woff2Exists =
				!font.woff2 ||
				fs.existsSync(path.join(fontsDir, path.basename(font.woff2)));
			return woffExists && woff2Exists;
		});

		if (allFilesExist) {
			// Ensure fonts.json exists
			fs.writeFileSync(
				path.join(fontsDir, 'fonts.json'),
				JSON.stringify({ fonts: cacheState.fonts }, null, 2)
			);
			return cacheState.fonts;
		} else {
			console.warn(
				chalk.yellow(
					'⚠️  [Font Downloader] Some cached fonts are missing, re-downloading...'
				)
			);
		}
	}

	// Configuration changed or no cache - download fonts
	console.warn(
		chalk.blue(
			`🔄 [Font Downloader] ${configChanged ? 'Configuration changed' : 'No cache found'}, downloading fonts...`
		)
	);

	// Clean old fonts (except fonts.json)
	const files = fs.readdirSync(fontsDir);
	for (const file of files) {
		if (file !== 'fonts.json') {
			fs.unlinkSync(path.join(fontsDir, file));
		}
	}

	console.warn(
		chalk.green(`✓ [Font Downloader] ${chalk.dim('Cleaned old font files')}`)
	);

	// Download fonts
	const fontData = [];
	let successCount = 0;
	let skipCount = 0;

	for (const font of fonts) {
		const fontName = font.name;
		let woffPath = null;
		let woff2Path = null;
		let hasSuccessfulDownload = false;

		// Download WOFF
		if (font.url1) {
			try {
				console.warn(
					chalk.cyan(
						`⬇  [Font Downloader] ${chalk.dim(`Downloading WOFF: ${fontName}...`)}`
					)
				);

				const woffBuffer = await downloadFont(font.url1, opts);
				const fileName = path.basename(font.url1);
				fs.writeFileSync(
					path.join(fontsDir, fileName),
					Buffer.from(woffBuffer)
				);
				woffPath = `/fonts/${fileName}`;
				hasSuccessfulDownload = true;

				console.warn(
					chalk.green(
						`✓ [Font Downloader] ${chalk.dim(
							`Downloaded WOFF: ${fontName} (${(
								woffBuffer.byteLength / 1024
							).toFixed(1)}KB)`
						)}`
					)
				);
			} catch (error) {
				console.warn(
					chalk.yellow(
						`⚠️  [Font Downloader] ${chalk.dim(
							`Failed WOFF for ${fontName}: ${error.message}`
						)}`
					)
				);
			}
		}

		// Download WOFF2
		if (font.url2) {
			try {
				console.warn(
					chalk.cyan(
						`⬇  [Font Downloader] ${chalk.dim(
							`Downloading WOFF2: ${fontName}...`
						)}`
					)
				);

				const woff2Buffer = await downloadFont(font.url2, opts);
				const fileName = path.basename(font.url2);
				fs.writeFileSync(
					path.join(fontsDir, fileName),
					Buffer.from(woff2Buffer)
				);
				woff2Path = `/fonts/${fileName}`;
				hasSuccessfulDownload = true;

				console.warn(
					chalk.green(
						`✓ [Font Downloader] ${chalk.dim(
							`Downloaded WOFF2: ${fontName} (${(
								woff2Buffer.byteLength / 1024
							).toFixed(1)}KB)`
						)}`
					)
				);
			} catch (error) {
				console.warn(
					chalk.yellow(
						`⚠️  [Font Downloader] ${chalk.dim(
							`Failed WOFF2 for ${fontName}: ${error.message}`
						)}`
					)
				);
			}
		}

		// Only add font to data if at least one format was successfully downloaded
		if (hasSuccessfulDownload) {
			fontData.push({
				name: fontName,
				woff: woffPath,
				woff2: woff2Path,
			});
			successCount++;
		} else {
			console.warn(
				chalk.yellow(
					`⚠️  [Font Downloader] ${chalk.dim(
						`Skipping ${fontName} - no valid font files downloaded`
					)}`
				)
			);
			skipCount++;
		}

		// Small delay between fonts
		if (fonts.indexOf(font) < fonts.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	// Save font metadata
	fs.writeFileSync(
		path.join(fontsDir, 'fonts.json'),
		JSON.stringify({ fonts: fontData }, null, 2)
	);

	// Update cache state
	saveFontCacheState({
		lastSync: new Date().toISOString(),
		configHash: generateFontConfigHash(fonts),
		fonts: fontData,
		version: '1.0.0',
	});

	// Summary
	console.warn(
		chalk.green.bold(
			`✨ [Font Downloader] Successfully downloaded ${successCount} font(s)`
		)
	);

	if (skipCount > 0) {
		console.warn(
			chalk.yellow.bold(
				`⚠️  [Font Downloader] Skipped ${skipCount} font(s) due to download failures`
			)
		);
	}

	return fontData;
}

// Main Netlify Build Plugin
export default {
	// Before the build starts, restore font cache
	async onPreBuild({ utils }) {
		console.warn(chalk.blue('\n🔤 [Font Downloader] Restoring font cache...'));

		const fontsDir = path.resolve('./public/fonts');
		const cacheStatePath = getFontCacheStatePath();

		try {
			// Restore cached fonts directory and state
			await utils.cache.restore(fontsDir);
			await utils.cache.restore(cacheStatePath);

			if (fs.existsSync(cacheStatePath)) {
				const state = loadFontCacheState();
				const fontCount = state.fonts?.length || 0;
				if (fontCount > 0) {
					console.warn(
						chalk.green(
							`✅ [Font Downloader] Restored ${fontCount} cached font(s)`
						)
					);
				}
			} else {
				console.warn(
					chalk.yellow('📦 [Font Downloader] No cached fonts found')
				);
			}
		} catch (error) {
			console.warn(
				chalk.yellow(
					`⚠️  [Font Downloader] Failed to restore cache: ${error.message}`
				)
			);
		}

		// Download fonts (with caching logic)
		try {
			const API_URL = process.env.KIRBY_URL;
			if (!API_URL) {
				console.warn(
					chalk.yellow('⚠️  [Font Downloader] KIRBY_URL not set, skipping')
				);
				return;
			}

			// Fetch global data
			const globalBuffer = await downloadFont(`${API_URL}/global.json`, {
				timeout: 30000,
				maxRetries: 3,
				retryDelay: 1000,
			});

			const global = JSON.parse(Buffer.from(globalBuffer).toString('utf-8'));
			const fonts = global.font;

			if (!fonts || fonts.length === 0) {
				const fontsDir = path.resolve('./public/fonts');
				if (!fs.existsSync(fontsDir)) {
					fs.mkdirSync(fontsDir, { recursive: true });
				}
				fs.writeFileSync(
					path.join(fontsDir, 'fonts.json'),
					JSON.stringify({ fonts: [] })
				);
				console.warn(
					chalk.yellow('⚠️  [Font Downloader] No fonts found in configuration')
				);
				return;
			}

			await downloadFontsWithCache(fonts);
		} catch (error) {
			console.error(chalk.red(`✖ [Font Downloader] Error: ${error.message}`));

			// Don't fail the build on Netlify
			if (process.env.NETLIFY) {
				console.warn(
					chalk.yellow(
						'⚠️  [Font Downloader] Continuing build despite error on Netlify'
					)
				);
			} else {
				throw error;
			}
		}
	},

	// After the build, cache the fonts
	async onPostBuild({ utils }) {
		console.warn(chalk.blue('\n🔤 [Font Downloader] Saving font cache...'));

		const fontsDir = path.resolve('./public/fonts');
		const cacheStatePath = getFontCacheStatePath();

		try {
			if (fs.existsSync(fontsDir)) {
				await utils.cache.save(fontsDir);
				const fontFiles = fs
					.readdirSync(fontsDir)
					.filter((f) => f !== 'fonts.json');
				console.warn(
					chalk.green(
						`✅ [Font Downloader] Cached ${fontFiles.length} font file(s)`
					)
				);
			}

			if (fs.existsSync(cacheStatePath)) {
				await utils.cache.save(cacheStatePath);
				console.warn(chalk.green('✅ [Font Downloader] Cached font state'));
			}
		} catch (error) {
			console.warn(
				chalk.yellow(
					`⚠️  [Font Downloader] Failed to save cache: ${error.message}`
				)
			);
		}
	},
};

// Export functions for use in Astro integration
export { downloadFontsWithCache, downloadFont };
