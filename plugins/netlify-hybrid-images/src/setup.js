import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { cyan } from 'kleur/colors';
import {
	createPluginLogger,
	getKirbyUrl,
	ensureDirectoryExists,
	getProjectRoot,
	handleNetlifyError,
} from '../../baukasten-utils/index.js';
import { validateNetlifyToml, checkCacheHeaders } from './validation.js';

const projectRoot = getProjectRoot(import.meta.url);
const NETLIFY_DIR = '.netlify';
const { readFile, writeFile } = fs.promises;

/**
 * Recursively collect JSON files within a directory.
 * @param {string} directory
 * @returns {string[]}
 */
function collectJsonFiles(directory) {
	if (!fs.existsSync(directory)) {
		return [];
	}

	const entries = fs.readdirSync(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...collectJsonFiles(entryPath));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.json')) {
			files.push(entryPath);
		}
	}

	return files;
}

/**
 * Normalize a Kirby media URL into file system and public paths.
 * @param {string} url
 * @param {Object} context
 * @param {string} context.mediaPrefix
 * @param {string} context.mediaDir
 * @param {string} context.mediaOutputDir
 * @returns {null | {
 *   cacheKey: string;
 *   remoteUrl: string;
 *   downloadUrl: string;
 *   filePath: string;
 *   localPath: string;
 *   localPathWithQuery: string;
 * }}
 */
function resolveMediaPath(url, { mediaPrefix, mediaDir, mediaOutputDir }) {
	if (typeof url !== 'string' || !url.startsWith(mediaPrefix)) {
		return null;
	}

	const remainder = url.slice(mediaPrefix.length);
	const [rawPath, query = ''] = remainder.split('?');

	if (!rawPath) {
		return null;
	}

	// Decode and normalise the Kirby media path
	const decodedPath = decodeURIComponent(rawPath);
	const posixPath = path.posix.normalize(decodedPath);

	// Prevent directory traversal outside the media directory
	if (
		posixPath.startsWith('../') ||
		posixPath.includes('..\\') ||
		posixPath === '..'
	) {
		return null;
	}

	const segments = posixPath.split('/').filter(Boolean);
	if (!segments.length) {
		return null;
	}

	const filePath = path.join(mediaOutputDir, ...segments);
	const localPath = `/${[mediaDir, ...segments].join('/')}`;
	const localPathWithQuery = query ? `${localPath}?${query}` : localPath;

	return {
		cacheKey: `${mediaDir}/${segments.join('/')}`,
		remoteUrl: url,
		downloadUrl: `${mediaPrefix}${rawPath}`,
		filePath,
		localPath,
		localPathWithQuery,
	};
}

/**
 * Traverse a data structure, rewriting Kirby media URLs and collecting assets.
 * @param {unknown} value
 * @param {Object} options
 * @param {Function} transformer
 * @returns {{ value: unknown, modified: boolean }}
 */
function transformContent(value, transformer) {
	let modified = false;

	const visit = (node) => {
		if (Array.isArray(node)) {
			for (let index = 0; index < node.length; index++) {
				const result = visit(node[index]);
				if (result.modified) {
					node[index] = result.value;
					modified = true;
				}
			}
			return { value: node, modified };
		}

		if (node && typeof node === 'object') {
			for (const [key, originalValue] of Object.entries(node)) {
				const result = visit(originalValue);
				if (result.modified) {
					node[key] = result.value;
					modified = true;
				}
			}
			return { value: node, modified };
		}

		if (typeof node === 'string') {
			const transformed = transformer(node);
			if (transformed !== node) {
				modified = true;
				return { value: transformed, modified: true };
			}
		}

		return { value: node, modified: false };
	};

	visit(value);
	return { value, modified };
}

/**
 * Download a Kirby media asset to the local filesystem with retry logic.
 * @param {Object} asset
 * @param {string} asset.downloadUrl
 * @param {string} asset.filePath
 * @param {string} asset.localPath
 * @param {ReturnType<typeof createPluginLogger>} logger
 * @param {number} maxRetries
 * @param {number} retryDelay
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
async function downloadAsset(
	asset,
	logger,
	maxRetries = 3,
	retryDelay = 1000,
	timeout = 30000,
	skipUnchanged = true
) {
	let lastError;
	const fileExists = fs.existsSync(asset.filePath);
	const hasMetadata = Boolean(
		asset.metadata && (asset.metadata.etag || asset.metadata.lastModified)
	);
	const shouldUseConditional = skipUnchanged && fileExists && hasMetadata;

	const conditionalHeaders = {};
	if (shouldUseConditional && asset.metadata.etag) {
		conditionalHeaders['If-None-Match'] = asset.metadata.etag;
	}
	if (shouldUseConditional && asset.metadata.lastModified) {
		conditionalHeaders['If-Modified-Since'] = asset.metadata.lastModified;
	}

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		const controller = new AbortController();
		let timeoutId;

		try {
			ensureDirectoryExists(path.dirname(asset.filePath));

			// Set up timeout using AbortController
			timeoutId = setTimeout(() => controller.abort(), timeout);

			const headers = shouldUseConditional
				? { ...conditionalHeaders }
				: undefined;
			const response = await fetch(asset.downloadUrl, {
				signal: controller.signal,
				headers,
			});

			if (response.status === 304) {
				const metadata = {
					...(asset.metadata || {}),
					checkedAt: new Date().toISOString(),
				};
				logger.info(`Skipped ${asset.localPath} (not modified)`);
				return { status: 'skipped', metadata };
			}

			if (!response.ok) {
				// Don't retry on 404 or other client errors (except 429 rate limit)
				if (
					response.status >= 400 &&
					response.status < 500 &&
					response.status !== 429
				) {
					throw new Error(`HTTP ${response.status} ${response.statusText}`);
				}
				// Server errors (5xx) and rate limit (429) will be retried
				lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
				if (attempt < maxRetries) {
					const delay = retryDelay * attempt; // Exponential backoff
					logger.warn(
						`Attempt ${attempt}/${maxRetries} failed for ${asset.localPath}: ${lastError.message}, retrying in ${delay}ms...`
					);
					await new Promise((resolve) => setTimeout(resolve, delay));
					continue;
				}
				throw lastError;
			}

			const arrayBuffer = await response.arrayBuffer();
			await writeFile(asset.filePath, Buffer.from(arrayBuffer));

			const now = new Date().toISOString();
			const metadata = {
				etag: response.headers.get('etag') || undefined,
				lastModified: response.headers.get('last-modified') || undefined,
				size: arrayBuffer.byteLength,
				downloadedAt: now,
				checkedAt: now,
			};

			logger.success(`Cached ${asset.localPath}`);
			return { status: 'downloaded', metadata };
		} catch (error) {
			lastError = error;

			// Check if it's an abort error (timeout)
			const isTimeout = error.name === 'AbortError';

			// Retry on socket hang up, timeout, and connection reset errors
			const isRetriable =
				isTimeout ||
				error.message?.includes('socket hang up') ||
				error.message?.includes('ECONNRESET') ||
				error.message?.includes('ETIMEDOUT') ||
				error.message?.includes('ECONNREFUSED');

			if (isRetriable && attempt < maxRetries) {
				const delay = retryDelay * attempt; // Exponential backoff
				const errorType = isTimeout ? 'timeout' : 'connection error';
				logger.warn(
					`Attempt ${attempt}/${maxRetries} failed for ${asset.localPath}: ${errorType}, retrying in ${delay}ms...`
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
				continue;
			}

			// Non-retriable error or max retries reached
			if (attempt === maxRetries) {
				logger.error(
					`Failed to cache ${asset.downloadUrl} after ${maxRetries} attempts`,
					lastError
				);
			} else {
				logger.error(`Failed to cache ${asset.downloadUrl}`, lastError);
			}
			return { status: 'failed' };
		} finally {
			// Clean up timeout
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		}
	}

	return { status: 'failed' };
}

/**
 * Run downloads with bounded concurrency.
 * @param {Array<Object>} assets
 * @param {number} concurrency
 * @param {ReturnType<typeof createPluginLogger>} logger
 * @param {number} maxRetries
 * @param {number} retryDelay
 * @param {number} timeout
 */
async function downloadWithConcurrency(
	assets,
	concurrency,
	logger,
	maxRetries,
	retryDelay,
	timeout,
	skipUnchanged
) {
	if (!assets.length) {
		return {
			success: 0,
			skipped: 0,
			failed: 0,
			manifestUpdates: new Map(),
			manifestRemovals: new Set(),
		};
	}

	const boundedConcurrency = Math.max(1, concurrency);
	let index = 0;
	let success = 0;
	let skipped = 0;
	let failed = 0;
	const manifestUpdates = new Map();
	const manifestRemovals = new Set();

	const workers = Array.from(
		{ length: Math.min(boundedConcurrency, assets.length) },
		() =>
			(async () => {
				while (index < assets.length) {
					const currentIndex = index++;
					const asset = assets[currentIndex];
					if (!asset) {
						break;
					}
					const result = await downloadAsset(
						asset,
						logger,
						maxRetries,
						retryDelay,
						timeout,
						skipUnchanged
					);
					if (result.status === 'downloaded') {
						success++;
					} else if (result.status === 'skipped') {
						skipped++;
					} else {
						failed++;
					}

					if (result.metadata) {
						manifestUpdates.set(asset.cacheKey, {
							...result.metadata,
							remoteUrl: asset.remoteUrl,
							localPath: asset.localPath,
						});
					}

					if (result.status === 'failed') {
						manifestRemovals.add(asset.cacheKey);
					}
				}
			})()
	);

	await Promise.all(workers);
	return { success, skipped, failed, manifestUpdates, manifestRemovals };
}

export default async function netlifyHybridImagesSetup({
	logger: astroLogger,
	options,
}) {
	const logger = createPluginLogger({
		name: 'Hybrid Images',
		emoji: '🖼️',
		color: cyan,
		astroLogger,
	});

	if (!options.enabled) {
		logger.info('Plugin disabled via configuration');
		return;
	}

	try {
		const kirbyUrl = getKirbyUrl();

		if (!kirbyUrl) {
			logger.warn('KIRBY_URL is not defined. Skipping hybrid image caching.');
			return;
		}

		// Validate netlify.toml configuration
		validateNetlifyToml(kirbyUrl, projectRoot, logger);

		// Check for Cache-Control headers
		checkCacheHeaders(projectRoot, options.mediaDir, logger);

		const mediaPrefix = `${kirbyUrl}/media/`;
		const publicDir = path.resolve(projectRoot, options.publicDir);
		const contentDir = path.join(publicDir, 'content');
		const mediaOutputDir = path.join(publicDir, options.mediaDir);
		// Store manifest in .netlify/ directory instead of public/
		const manifestPath = options.cacheManifest
			? path.join(projectRoot, NETLIFY_DIR, options.cacheManifest)
			: null;
		let manifest = {};

		// Ensure .netlify directory exists
		if (manifestPath) {
			ensureDirectoryExists(path.dirname(manifestPath));
		}

		if (manifestPath) {
			try {
				const rawManifest = await readFile(manifestPath, 'utf8');
				manifest = JSON.parse(rawManifest);
			} catch (error) {
				if (error.code !== 'ENOENT') {
					logger.warn(
						`Unable to read cache manifest at ${manifestPath}. Rebuilding metadata.`
					);
				}
			}
		}

		const skipUnchanged = Boolean(options.skipUnchanged && manifestPath);

		ensureDirectoryExists(mediaOutputDir);

		if (!fs.existsSync(contentDir)) {
			logger.warn(
				`Content directory not found at ${contentDir}. Nothing to process.`
			);
			return;
		}

		const jsonFiles = collectJsonFiles(contentDir);

		if (!jsonFiles.length) {
			logger.warn(
				'No Kirby JSON cache files found. Skipping hybrid image caching.'
			);
			return;
		}

		logger.info(
			`Scanning ${jsonFiles.length} JSON file${
				jsonFiles.length === 1 ? '' : 's'
			} for Kirby media references`
		);

		const assetMap = new Map();
		const fileEntries = [];

		for (const filePath of jsonFiles) {
			try {
				const rawContent = await readFile(filePath, 'utf8');
				const data = JSON.parse(rawContent);

				transformContent(data, (value) => {
					const match = resolveMediaPath(value, {
						mediaPrefix,
						mediaDir: options.mediaDir,
						mediaOutputDir,
					});

					if (!match) {
						return value;
					}

					if (!assetMap.has(match.cacheKey)) {
						const cachedMetadata =
							manifestPath && manifest
								? manifest[match.cacheKey] || null
								: null;
						assetMap.set(match.cacheKey, {
							...match,
							metadata: cachedMetadata,
						});
					}

					return value;
				});

				fileEntries.push({ filePath, data });
			} catch (error) {
				logger.warn(
					`Skipping unreadable JSON file: ${filePath} - ${error.message}`
				);
			}
		}

		if (!assetMap.size) {
			logger.warn(
				'No Kirby media URLs detected in content. Skipping downloads.'
			);
			return;
		}

		logger.info(
			`Preparing to cache ${assetMap.size} media asset${
				assetMap.size === 1 ? '' : 's'
			} locally`
		);

		const downloadResult = await downloadWithConcurrency(
			Array.from(assetMap.values()),
			options.concurrency,
			logger,
			options.maxRetries || 3,
			options.retryDelay || 1000,
			options.timeout || 30000,
			skipUnchanged
		);

		if (downloadResult.success > 0) {
			logger.info(
				`Cached ${downloadResult.success} media asset${
					downloadResult.success === 1 ? '' : 's'
				} to /${options.mediaDir}`
			);
		}

		if (downloadResult.skipped > 0) {
			logger.info(
				`Skipped re-downloading ${downloadResult.skipped} cached asset${
					downloadResult.skipped === 1 ? '' : 's'
				}`
			);
		}

		if (manifestPath) {
			let manifestChanged = false;

			for (const [key, data] of downloadResult.manifestUpdates) {
				const previous = manifest[key] || {};
				manifest[key] = { ...previous, ...data };
				manifestChanged = true;
			}

			for (const key of downloadResult.manifestRemovals) {
				if (manifest[key]) {
					delete manifest[key];
					manifestChanged = true;
				}
			}

			if (manifestChanged) {
				ensureDirectoryExists(path.dirname(manifestPath));
				await writeFile(
					manifestPath,
					`${JSON.stringify(manifest, null, 2)}\n`,
					'utf8'
				);
				logger.info(
					`Updated cache manifest at ${path.relative(projectRoot, manifestPath)}`
				);
			}
		}

		if (downloadResult.failed > 0) {
			logger.warn(
				`Skipped URL rewriting because ${downloadResult.failed} asset${
					downloadResult.failed === 1 ? '' : 's'
				} failed to cache`
			);
			return;
		}

		if (options.rewriteContent) {
			let rewrittenFiles = 0;
			for (const entry of fileEntries) {
				const { data, filePath } = entry;
				const { modified } = transformContent(data, (value) => {
					const match = resolveMediaPath(value, {
						mediaPrefix,
						mediaDir: options.mediaDir,
						mediaOutputDir,
					});

					if (!match) {
						return value;
					}

					return match.localPathWithQuery;
				});

				if (modified) {
					await writeFile(
						filePath,
						`${JSON.stringify(data, null, 2)}\n`,
						'utf8'
					);
					rewrittenFiles++;
				}
			}

			logger.success(
				`Rewrote media URLs in ${rewrittenFiles} JSON file${
					rewrittenFiles === 1 ? '' : 's'
				}`
			);
		}

		logger.success('Hybrid image caching completed');
	} catch (error) {
		const shouldContinue = handleNetlifyError(logger, error, false);
		if (!shouldContinue) {
			throw error;
		}
	}
}
