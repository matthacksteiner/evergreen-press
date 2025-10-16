/**
 * Netlify Hybrid Images Plugin
 *
 * Fetch Kirby media assets at build time and make them available
 * from the local /public directory so Netlify's on-demand image CDN
 * can process and cache responsive variants at the edge.
 */

import { createPluginConfig } from '../baukasten-utils/index.js';
import { cyan } from 'kleur/colors';
import netlifyHybridImagesSetup from './src/setup.js';

const defaultOptions = {
	// Enable or disable the plugin
	enabled: true,
	// Relative path (from project root) where static assets are published
	publicDir: 'public',
	// Folder inside publicDir where Kirby media will be stored
	mediaDir: 'media',
	// Maximum number of concurrent download operations
	concurrency: 2,
	// Cache manifest filename (stored in .netlify/ directory, not in public/)
	cacheManifest: 'hybrid-images-manifest.json',
	// Skip fetching assets when remote responds not modified
	skipUnchanged: true,
	// Whether to rewrite Kirby media URLs inside cached JSON content
	rewriteContent: true,
	// Number of retry attempts for failed downloads
	maxRetries: 3,
	// Base delay between retries in milliseconds (will use exponential backoff)
	retryDelay: 1000,
	// Request timeout in milliseconds
	timeout: 30000,
};

export default createPluginConfig({
	name: 'netlify-hybrid-images',
	emoji: '🖼️',
	color: cyan,
	defaultOptions,
	hooks: {
		'astro:build:start': netlifyHybridImagesSetup,
	},
});
