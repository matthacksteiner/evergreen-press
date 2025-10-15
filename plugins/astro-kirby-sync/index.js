// Import the sync function from the Netlify Build Plugin file
import { performFullSync } from './astro-kirby-sync.js';
import path from 'path';
import fetch from 'node-fetch';

// Helper function to fetch JSON from URL
async function fetchJson(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		throw error;
	}
}

// Simple Astro integration for astro-kirby-sync
export default function astroKirbySync() {
	return {
		name: 'astro-kirby-sync',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				// Skip in development mode
				if (process.env.NODE_ENV === 'development') {
					logger.info('🔄 Development mode: Skipping content sync');

					// Check if maintenance mode is enabled and show bypass message
					try {
						const API_URL =
							process.env.KIRBY_URL ||
							'https://cms.baukasten.matthiashacksteiner.net';
						const global = await fetchJson(`${API_URL}/global.json`);
						const isMaintenanceMode = global?.maintenanceToggle === true;
						if (isMaintenanceMode) {
							logger.warn('🚧 Maintenance mode is bypassed in development');
						}
					} catch {
						// Ignore errors when checking maintenance mode in dev
					}

					return;
				}

				// Check if we're running on Netlify
				if (process.env.NETLIFY) {
					logger.info(
						'🔄 Netlify environment: Content sync handled by Netlify Build Plugin'
					);
					return;
				}

				// We're in a local production build - run sync directly
				logger.info('🔄 Local production build: Running content sync...');

				try {
					const API_URL =
						process.env.KIRBY_URL ||
						'https://cms.baukasten.matthiashacksteiner.net';
					const contentDir = path.resolve('./public/content');

					// Always do a full sync for local builds to be safe
					await performFullSync(API_URL, contentDir, logger);
					logger.info('✅ Content sync completed successfully');
				} catch (error) {
					logger.error('❌ Content sync failed:', error.message);
					throw error;
				}
			},
		},
	};
}
