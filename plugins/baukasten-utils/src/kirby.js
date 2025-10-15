/**
 * Kirby CMS Utilities
 *
 * Functions for interacting with the Kirby CMS
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

/**
 * Get the Kirby CMS URL from environment variables
 *
 * @returns {string|null} The Kirby URL without trailing slash or null if not set
 */
export function getKirbyUrl() {
	const url = process.env.KIRBY_URL;
	if (!url) return null;

	// Remove trailing slash if present
	return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Fetch JSON data from Kirby CMS with retry logic
 *
 * @param {string} endpoint - The API endpoint (without leading slash)
 * @param {Object} options - Options for the fetch operation
 * @param {number} options.retries - Number of retry attempts (default: 3)
 * @param {number} options.delay - Delay between retries in ms (default: 1000)
 * @param {Object} options.logger - Logger instance
 * @returns {Promise<Object>} The parsed JSON response
 */
export async function fetchFromKirby(
	endpoint,
	{ retries = 3, delay = 1000, logger = console } = {}
) {
	const kirbyUrl = getKirbyUrl();
	if (!kirbyUrl) {
		throw new Error('KIRBY_URL environment variable is not set');
	}

	// Ensure endpoint doesn't start with a slash
	const cleanEndpoint = endpoint.startsWith('/')
		? endpoint.substring(1)
		: endpoint;
	const url = `${kirbyUrl}/${cleanEndpoint}`;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				if (attempt === retries) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				logger.warn(
					`Attempt ${attempt}/${retries} failed with status ${response.status}. Retrying...`
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
				continue;
			}

			return await response.json();
		} catch (error) {
			if (attempt === retries) {
				throw error;
			}
			logger.warn(
				`Attempt ${attempt}/${retries} failed: ${error.message}. Retrying...`
			);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
}

/**
 * Get global configuration data from Kirby CMS
 *
 * @param {Object} options - Options for fetching global data
 * @param {Object} options.logger - Logger instance
 * @returns {Promise<Object>} The global configuration object
 */
export async function getGlobalConfig({ logger = console } = {}) {
	try {
		return await fetchFromKirby('global.json', { logger });
	} catch (error) {
		logger.error('Failed to fetch global configuration', error);
		throw error;
	}
}
