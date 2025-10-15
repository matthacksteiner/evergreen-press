import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { createHash } from 'crypto';

// Helper function to generate SHA-256 hash of content
function generateContentHash(content) {
	return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

// Helper function to clean directory
function cleanDirectory(dirPath) {
	if (fs.existsSync(dirPath)) {
		fs.rmSync(dirPath, { recursive: true, force: true });
	}
	fs.mkdirSync(dirPath, { recursive: true });
}

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

// Helper function to fetch JSON from URL with retries
async function fetchJson(url, retries = 3, delay = 1000) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				if (attempt === retries) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				// Wait before retrying
				await new Promise((resolve) => setTimeout(resolve, delay));
				continue;
			}
			return await response.json();
		} catch (error) {
			if (attempt === retries) {
				console.error(
					`Error fetching ${url} after ${retries} attempts:`,
					error
				);
				throw error;
			}
			// Wait before retrying
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
}

// Helper function to save JSON file
function saveJsonFile(filePath, data) {
	try {
		const dirPath = path.dirname(filePath);
		ensureDirectoryExists(dirPath);
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error(`Error saving file ${filePath}:`, error);
		// In production, we want to fail fast if we can't save content
		if (process.env.NODE_ENV === 'production') {
			throw error;
		}
	}
}

// Get sync state file path
function getSyncStateFilePath() {
	// Store in .astro directory to keep it with other build artifacts
	const astroDir = path.resolve('./.astro');
	ensureDirectoryExists(astroDir);
	return path.join(astroDir, 'kirby-sync-state.json');
}

// Load sync state from disk
function loadSyncState() {
	const stateFile = getSyncStateFilePath();

	if (!fs.existsSync(stateFile)) {
		return {
			lastSync: null,
			contentHashes: {},
			version: '1.0.0',
		};
	}

	try {
		const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
		return {
			lastSync: state.lastSync || null,
			contentHashes: state.contentHashes || {},
			version: state.version || '1.0.0',
		};
	} catch (error) {
		console.warn('Invalid sync state file, starting fresh:', error.message);
		return {
			lastSync: null,
			contentHashes: {},
			version: '1.0.0',
		};
	}
}

// Save sync state to disk
function saveSyncState(state) {
	const stateFile = getSyncStateFilePath();
	try {
		fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
	} catch (error) {
		console.error('Error saving sync state:', error);
	}
}

// Check if content has changed by comparing hashes
function hasContentChanged(url, newContent, oldHashes) {
	const newHash = generateContentHash(newContent);
	const oldHash = oldHashes[url];
	return !oldHash || oldHash !== newHash;
}

// Perform incremental sync for a specific language
async function performIncrementalLanguageSync(
	API_URL,
	lang,
	contentDir,
	syncState,
	logger
) {
	const langPath = lang ? `${lang}/` : '';
	const langDir = lang ? path.join(contentDir, lang) : contentDir;
	let changedFiles = 0;
	let totalFiles = 0;

	// Ensure language directory exists
	ensureDirectoryExists(langDir);

	// Fetch and check global.json
	const globalUrl = `${API_URL}/${langPath}global.json`;
	const globalData = await fetchJson(globalUrl);
	totalFiles++;

	const globalFilePath = path.join(langDir, 'global.json');
	const globalContentChanged = hasContentChanged(
		globalUrl,
		globalData,
		syncState.contentHashes
	);

	if (globalContentChanged) {
		logger.info(chalk.gray(`  ↳ Updated global.json`));
		changedFiles++;
		syncState.contentHashes[globalUrl] = generateContentHash(globalData);
	}

	// Always ensure the file exists (create if missing or changed)
	if (globalContentChanged || !fs.existsSync(globalFilePath)) {
		saveJsonFile(globalFilePath, globalData);

		// Also save to root if this is the default language
		if (!lang) {
			saveJsonFile(path.join(contentDir, 'global.json'), globalData);
		}
	}

	// Fetch and check index.json
	const indexUrl = `${API_URL}/${langPath}index.json`;
	const indexData = await fetchJson(indexUrl);
	totalFiles++;

	const indexFilePath = path.join(langDir, 'index.json');
	const indexContentChanged = hasContentChanged(
		indexUrl,
		indexData,
		syncState.contentHashes
	);

	if (indexContentChanged) {
		logger.info(chalk.gray(`  ↳ Updated index.json`));
		changedFiles++;
		syncState.contentHashes[indexUrl] = generateContentHash(indexData);
	}

	// Always ensure the file exists (create if missing or changed)
	if (indexContentChanged || !fs.existsSync(indexFilePath)) {
		saveJsonFile(indexFilePath, indexData);

		// Also save to root if this is the default language
		if (!lang) {
			saveJsonFile(path.join(contentDir, 'index.json'), indexData);
		}
	}

	// Check if we're in maintenance mode by looking at global data
	const isMaintenanceMode = globalData?.maintenanceToggle === true;

	if (isMaintenanceMode) {
		logger.info(
			chalk.yellow(
				`🚧 Maintenance mode detected - syncing only maintenance page`
			)
		);

		// In maintenance mode, clean up all other content files except essential ones
		const essentialFiles = [
			'global.json',
			'index.json',
			'maintenance.json',
			'error.json',
		];
		const allFiles = fs.readdirSync(langDir);
		for (const file of allFiles) {
			if (file.endsWith('.json') && !essentialFiles.includes(file)) {
				const filePath = path.join(langDir, file);
				try {
					fs.unlinkSync(filePath);
					logger.info(chalk.gray(`  ↳ Removed ${file} from ${lang || 'root'}`));
				} catch {
					// Ignore errors when removing files
				}
			}
		}
	}

	// Check each page in the index
	for (const page of indexData) {
		const pageUrl = `${API_URL}/${langPath}${page.uri}.json`;
		const pageData = await fetchJson(pageUrl);
		totalFiles++;

		const pageFilePath = path.join(langDir, `${page.uri}.json`);
		const pageContentChanged = hasContentChanged(
			pageUrl,
			pageData,
			syncState.contentHashes
		);

		if (pageContentChanged) {
			logger.info(chalk.gray(`  ↳ Updated ${page.uri}.json`));
			changedFiles++;
			syncState.contentHashes[pageUrl] = generateContentHash(pageData);
		}

		// Always ensure the file exists (create if missing or changed)
		if (pageContentChanged || !fs.existsSync(pageFilePath)) {
			saveJsonFile(pageFilePath, pageData);

			// Also save to root if this is the default language
			if (!lang) {
				saveJsonFile(path.join(contentDir, `${page.uri}.json`), pageData);
			}
		}

		// Handle sections (fetch additional data if needed)
		if (page.intendedTemplate === 'section') {
			// Section data is the same as page data in this case, no additional fetch needed
			// The section items are included in the page.json response
		}
	}

	return { changedFiles, totalFiles };
}

// Perform full sync (fallback when incremental fails)
async function performFullSync(API_URL, contentDir, logger) {
	logger.info(chalk.blue('\n🔄 Performing full content sync...'));

	// Clean existing content
	logger.info(chalk.gray('🧹 Cleaning existing content...'));
	cleanDirectory(contentDir);

	// Initialize sync state
	const syncState = {
		lastSync: new Date().toISOString(),
		contentHashes: {},
		version: '1.0.0',
	};

	// Fetch global data first to get language information
	let global;
	try {
		global = await fetchJson(`${API_URL}/global.json`);
	} catch (error) {
		throw new Error(`Failed to fetch global configuration: ${error.message}`);
	}

	if (!global || !global.defaultLang || !global.defaultLang.code) {
		throw new Error('Invalid global configuration received from CMS');
	}

	const defaultLanguage = global.defaultLang.code;
	const translations = global.translations.map((lang) => lang.code);

	logger.info(
		chalk.gray(
			`📚 Found languages: ${[defaultLanguage, ...translations].join(', ')}`
		)
	);

	// Sync default language (no prefix) - but we need to sync it both to root AND to its language directory
	logger.info(
		chalk.yellow(`\n📥 Syncing default language (${defaultLanguage})...`)
	);
	await performIncrementalLanguageSync(
		API_URL,
		null,
		contentDir,
		syncState,
		logger
	);

	// ALSO sync default language to its own language directory
	logger.info(
		chalk.yellow(
			`\n📥 Syncing default language to /${defaultLanguage}/ directory...`
		)
	);
	await performIncrementalLanguageSync(
		API_URL,
		defaultLanguage,
		contentDir,
		syncState,
		logger
	);

	// Sync translations
	for (const lang of translations) {
		if (lang === defaultLanguage) continue;

		logger.info(chalk.yellow(`\n📥 Syncing language: ${lang}...`));
		await performIncrementalLanguageSync(
			API_URL,
			lang,
			contentDir,
			syncState,
			logger
		);
	}

	// Save sync state
	saveSyncState(syncState);

	logger.info(chalk.green('\n✨ Full content sync completed successfully!'));
	return syncState;
}

// Perform incremental sync
async function performIncrementalSync(API_URL, contentDir, logger) {
	logger.info(chalk.blue('\n🔄 Performing incremental content sync...'));

	// Load existing sync state
	const syncState = loadSyncState();

	if (!syncState.lastSync) {
		logger.info(
			chalk.yellow('📦 No previous sync found, performing full sync...')
		);
		return await performFullSync(API_URL, contentDir, logger);
	}

	logger.info(
		chalk.gray(
			`🕐 Last sync: ${new Date(syncState.lastSync).toLocaleString('en-US', {
				hour12: false,
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			})}`
		)
	);

	// Ensure content directory exists
	ensureDirectoryExists(contentDir);

	let totalChangedFiles = 0;
	let totalFiles = 0;

	try {
		// Fetch global data to get language information
		const global = await fetchJson(`${API_URL}/global.json`);
		const defaultLanguage = global.defaultLang.code;
		const translations = global.translations.map((lang) => lang.code);

		// Check default language (no prefix)
		logger.info(
			chalk.yellow(`\n🔍 Checking default language (${defaultLanguage})...`)
		);
		const defaultStats = await performIncrementalLanguageSync(
			API_URL,
			null,
			contentDir,
			syncState,
			logger
		);
		totalChangedFiles += defaultStats.changedFiles;
		totalFiles += defaultStats.totalFiles;

		// ALSO check default language in its own language directory
		logger.info(
			chalk.yellow(
				`\n🔍 Checking default language in /${defaultLanguage}/ directory...`
			)
		);
		const defaultLangDirStats = await performIncrementalLanguageSync(
			API_URL,
			defaultLanguage,
			contentDir,
			syncState,
			logger
		);
		totalChangedFiles += defaultLangDirStats.changedFiles;
		totalFiles += defaultLangDirStats.totalFiles;

		// Check translations
		for (const lang of translations) {
			if (lang === defaultLanguage) continue;

			logger.info(chalk.yellow(`\n🔍 Checking language: ${lang}...`));
			const langStats = await performIncrementalLanguageSync(
				API_URL,
				lang,
				contentDir,
				syncState,
				logger
			);
			totalChangedFiles += langStats.changedFiles;
			totalFiles += langStats.totalFiles;
		}

		// Update sync state
		syncState.lastSync = new Date().toISOString();
		saveSyncState(syncState);

		if (totalChangedFiles === 0) {
			logger.info(
				chalk.green(
					`\n✨ Content is up-to-date! Checked ${totalFiles} files, no changes found.`
				)
			);
		} else {
			logger.info(
				chalk.green(
					`\n✨ Incremental sync completed! Updated ${totalChangedFiles}/${totalFiles} files.`
				)
			);
		}

		return syncState;
	} catch (error) {
		logger.warn(chalk.yellow(`\n⚠️ Incremental sync failed: ${error.message}`));
		logger.info(chalk.yellow('🔄 Falling back to full sync...'));
		return await performFullSync(API_URL, contentDir, logger);
	}
}

// Main Netlify Build Plugin
export default {
	// Before the build starts, restore cache and run the content sync (CRITICAL: must be before Astro build)
	async onPreBuild({ utils }) {
		console.warn(
			chalk.blue('\n🔄 [Netlify Build Plugin] Restoring sync state cache...')
		);

		const syncStateFile = getSyncStateFilePath();

		try {
			// Restore the sync state file from cache
			await utils.cache.restore(syncStateFile);

			if (fs.existsSync(syncStateFile)) {
				console.warn(
					chalk.green(
						'✅ [Netlify Build Plugin] Sync state restored from cache'
					)
				);
			} else {
				console.warn(
					chalk.yellow('📦 [Netlify Build Plugin] No cached sync state found')
				);
			}
		} catch (error) {
			console.warn(
				chalk.yellow(
					`⚠️ [Netlify Build Plugin] Failed to restore cache: ${error.message}`
				)
			);
		}
		// Skip content sync in development mode
		if (process.env.CONTEXT === 'dev') {
			console.warn(
				chalk.blue('\n🔄 Development mode detected, skipping content sync...')
			);
			console.warn(
				chalk.gray('Content will be fetched directly from the CMS API')
			);

			// Check if maintenance mode is enabled and show bypass message
			try {
				const API_URL = process.env.KIRBY_URL;
				if (API_URL) {
					const global = await fetchJson(`${API_URL}/global.json`);
					const isMaintenanceMode = global?.maintenanceToggle === true;
					if (isMaintenanceMode) {
						console.warn(
							chalk.yellow('🚧 Maintenance mode is bypassed in development')
						);
					}
				}
			} catch {
				// Ignore errors when checking maintenance mode in dev
			}

			return;
		}

		// We're in production/build mode - content sync is REQUIRED
		console.warn(
			chalk.blue('\n🔄 Production build detected, running content sync...')
		);

		try {
			const API_URL = process.env.KIRBY_URL;
			if (!API_URL) {
				throw new Error('KIRBY_URL environment variable is not set');
			}

			const contentDir = path.resolve('./public/content');

			// Check if we should force a full sync
			const forceFullSync = process.env.FORCE_FULL_SYNC === 'true';

			if (forceFullSync) {
				console.warn(
					chalk.yellow('🔄 FORCE_FULL_SYNC enabled, performing full sync...')
				);
				await performFullSync(API_URL, contentDir, { info: console.warn });
			} else {
				await performIncrementalSync(API_URL, contentDir, {
					info: console.warn,
				});
			}
		} catch (error) {
			console.error(chalk.red('\n❌ Error during content sync:'));
			console.error(chalk.red(error.message));

			// Fail the build in production unless on Netlify
			if (process.env.CONTEXT === 'production' && !process.env.NETLIFY) {
				console.error(
					chalk.red(
						'\n🛑 BUILD FAILED: Content sync is required for production builds'
					)
				);
				throw error;
			}

			// Don't fail the build if plugin errors on Netlify
			if (process.env.NETLIFY) {
				console.warn(
					chalk.yellow('\n⚠️ Continuing build despite plugin error on Netlify')
				);
			}
		}
	},

	// After the build is done, cache the sync state for future builds
	async onPostBuild({ utils }) {
		console.warn(
			chalk.blue('\n🔄 [Netlify Build Plugin] Saving sync state to cache...')
		);

		const syncStateFile = getSyncStateFilePath();

		try {
			if (fs.existsSync(syncStateFile)) {
				// Cache the sync state file for future builds
				await utils.cache.save(syncStateFile);
				console.warn(
					chalk.green(
						'✅ [Netlify Build Plugin] Sync state cached successfully'
					)
				);
			} else {
				console.warn(
					chalk.yellow('⚠️ [Netlify Build Plugin] No sync state file to cache')
				);
			}
		} catch (error) {
			console.warn(
				chalk.yellow(
					`⚠️ [Netlify Build Plugin] Failed to save cache: ${error.message}`
				)
			);
		}
	},
};

// Export sync functions for use in Astro integration
export { performFullSync, performIncrementalSync };
