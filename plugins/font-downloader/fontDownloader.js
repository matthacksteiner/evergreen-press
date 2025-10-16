import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';

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

export default function fontDownloader(userOptions = {}) {
	const defaultOptions = {
		timeout: 30000,
		maxRetries: 3,
		retryDelay: 1000,
	};

	const options = { ...defaultOptions, ...userOptions };

	return {
		name: 'font-downloader',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				const pluginName = chalk.magenta.bold('🔤 [Font Downloader]');

				try {
					const API_URL = process.env.KIRBY_URL;
					if (!API_URL) {
						logger.warn(
							`${pluginName} ${chalk.yellow(
								'⚠️ KIRBY_URL environment variable is not set'
							)}`
						);
						return;
					}

					// Create fonts directory
					const fontsDir = path.resolve('./public/fonts');
					if (!fs.existsSync(fontsDir)) {
						fs.mkdirSync(fontsDir, { recursive: true });
						logger.info(
							`${pluginName} ${chalk.green('✓')} ${chalk.dim(
								'Created fonts directory'
							)}`
						);
					}

					// Clean old font files except fonts.json
					const files = fs.readdirSync(fontsDir);
					for (const file of files) {
						if (file !== 'fonts.json') {
							fs.unlinkSync(path.join(fontsDir, file));
						}
					}
					logger.info(
						`${pluginName} ${chalk.green('✓')} ${chalk.dim(
							'Cleaned old font files'
						)}`
					);

					// Fetch global data from API
					logger.info(
						`${pluginName} ${chalk.cyan('ℹ')} ${chalk.dim(
							`Fetching font data from: ${API_URL}`
						)}`
					);

					const globalBuffer = await downloadFont(`${API_URL}/global.json`, {
						timeout: options.timeout,
						maxRetries: options.maxRetries,
						retryDelay: options.retryDelay,
					});

					const global = JSON.parse(
						Buffer.from(globalBuffer).toString('utf-8')
					);
					const fonts = global.font;

					if (!fonts || fonts.length === 0) {
						fs.writeFileSync(
							path.join(fontsDir, 'fonts.json'),
							JSON.stringify({ fonts: [] })
						);
						logger.info(
							`${pluginName} ${chalk.yellow('⚠️')} ${chalk.dim(
								'No fonts found in configuration'
							)}`
						);
						return;
					}

					logger.info(
						`${pluginName} ${chalk.cyan('ℹ')} ${chalk.dim(
							`Found ${fonts.length} font(s) to download`
						)}`
					);

					// Download fonts sequentially to avoid overwhelming the server
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
								logger.info(
									`${pluginName} ${chalk.cyan('⬇')} ${chalk.dim(
										`Downloading WOFF: ${fontName}...`
									)}`
								);

								const woffBuffer = await downloadFont(font.url1, options);
								const fileName = path.basename(font.url1);
								fs.writeFileSync(
									path.join(fontsDir, fileName),
									Buffer.from(woffBuffer)
								);
								woffPath = `/fonts/${fileName}`;
								hasSuccessfulDownload = true;

								logger.info(
									`${pluginName} ${chalk.green('✓')} ${chalk.dim(
										`Downloaded WOFF: ${fontName} (${(
											woffBuffer.byteLength / 1024
										).toFixed(1)}KB)`
									)}`
								);
							} catch (error) {
								logger.warn(
									`${pluginName} ${chalk.yellow('⚠️')} ${chalk.dim(
										`Failed WOFF for ${fontName}: ${error.message}`
									)}`
								);
							}
						}

						// Download WOFF2
						if (font.url2) {
							try {
								logger.info(
									`${pluginName} ${chalk.cyan('⬇')} ${chalk.dim(
										`Downloading WOFF2: ${fontName}...`
									)}`
								);

								const woff2Buffer = await downloadFont(font.url2, options);
								const fileName = path.basename(font.url2);
								fs.writeFileSync(
									path.join(fontsDir, fileName),
									Buffer.from(woff2Buffer)
								);
								woff2Path = `/fonts/${fileName}`;
								hasSuccessfulDownload = true;

								logger.info(
									`${pluginName} ${chalk.green('✓')} ${chalk.dim(
										`Downloaded WOFF2: ${fontName} (${(
											woff2Buffer.byteLength / 1024
										).toFixed(1)}KB)`
									)}`
								);
							} catch (error) {
								logger.warn(
									`${pluginName} ${chalk.yellow('⚠️')} ${chalk.dim(
										`Failed WOFF2 for ${fontName}: ${error.message}`
									)}`
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
							logger.warn(
								`${pluginName} ${chalk.yellow('⚠️')} ${chalk.dim(
									`Skipping ${fontName} - no valid font files downloaded`
								)}`
							);
							skipCount++;
						}

						// Small delay between fonts to avoid overwhelming the server
						if (fonts.indexOf(font) < fonts.length - 1) {
							await new Promise((resolve) => setTimeout(resolve, 100));
						}
					}

					// Save font metadata
					fs.writeFileSync(
						path.join(fontsDir, 'fonts.json'),
						JSON.stringify({ fonts: fontData }, null, 2)
					);

					// Summary
					logger.info(
						`${pluginName} ${chalk.green.bold(
							'✨ Successfully downloaded'
						)} ${chalk.cyan.bold(successCount)} ${chalk.green.bold('font(s)')}`
					);

					if (skipCount > 0) {
						logger.warn(
							`${pluginName} ${chalk.yellow.bold(
								`⚠️ Skipped ${skipCount} font(s) due to download failures`
							)}`
						);
					}
				} catch (error) {
					logger.error(
						`${pluginName} ${chalk.red('✖ Error:')} ${chalk.red.dim(
							error.message
						)}`
					);

					// Don't fail the build on Netlify
					if (process.env.NETLIFY) {
						logger.warn(
							`${pluginName} ${chalk.yellow(
								'⚠️ Continuing build despite plugin error on Netlify'
							)}`
						);
					} else {
						// In local development, we can be more strict
						throw error;
					}
				}
			},
		},
	};
}
