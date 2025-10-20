// Simple Astro integration for font-downloader
// Note: Uses dynamic imports to avoid bundling Netlify plugin code into SSR
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
				// Skip in development mode
				if (process.env.NODE_ENV === 'development') {
					logger.info(
						'🔤 [Font Downloader] Development mode: Skipping font download'
					);
					return;
				}

				// Check if we're running on Netlify
				if (process.env.NETLIFY) {
					logger.info(
						'🔤 [Font Downloader] Netlify environment: Fonts handled by Netlify Build Plugin'
					);
					return;
				}

				// We're in a local production build - run download directly
				logger.info(
					'🔤 [Font Downloader] Local production build: Downloading fonts...'
				);

				try {
					// Dynamic import to avoid bundling into SSR
					const { downloadFontsWithCache, downloadFont } = await import(
						'./font-downloader-netlify.js'
					);
					const path = await import('path');
					const fs = await import('fs');

					const API_URL = process.env.KIRBY_URL;
					if (!API_URL) {
						logger.warn('⚠️  [Font Downloader] KIRBY_URL not set, skipping');
						return;
					}

					// Fetch global data
					const globalBuffer = await downloadFont(
						`${API_URL}/global.json`,
						options
					);
					const global = JSON.parse(
						Buffer.from(globalBuffer).toString('utf-8')
					);
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
						logger.warn(
							'⚠️  [Font Downloader] No fonts found in configuration'
						);
						return;
					}

					// Always do a full download for local builds
					await downloadFontsWithCache(fonts, options);
					logger.info('✅ [Font Downloader] Fonts downloaded successfully');
				} catch (error) {
					logger.error(`❌ [Font Downloader] Error: ${error.message}`);
					throw error;
				}
			},
		},
	};
}
