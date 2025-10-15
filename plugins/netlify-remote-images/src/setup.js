/**
 * Netlify Remote Images setup function
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	createPluginLogger,
	getKirbyUrl,
	handleNetlifyError,
} from '../../baukasten-utils/index.js';
import { magenta } from 'kleur/colors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../../');

/**
 * Setup function for the netlify-remote-images plugin
 *
 * @param {Object} params - Astro hook parameters with plugin options
 */
export default async function netlifyRemoteImagesSetup({
	logger: astroLogger,
	options,
}) {
	const logger = createPluginLogger({
		name: 'Remote Images',
		emoji: '🔄',
		color: magenta,
		astroLogger,
	});

	// Skip if plugin is disabled
	if (!options.enabled) {
		logger.info('Plugin is disabled. Skipping netlify.toml update.');
		return;
	}

	try {
		// Get Kirby URL from environment variables
		const kirbyUrl = getKirbyUrl();

		if (!kirbyUrl) {
			logger.warn(
				'No KIRBY_URL found in environment variables. Skipping netlify.toml update.'
			);
			return;
		}

		// Read the netlify.toml file
		const netlifyTomlPath = path.join(projectRoot, 'netlify.toml');
		const netlifyToml = await fs.readFile(netlifyTomlPath, 'utf-8');

		// Regular expression to find and replace the remote_images section
		const remoteImagesRegex =
			/\[images\]\s*remote_images\s*=\s*\[\s*"[^"]*"\s*\]/s;
		const newRemoteImages = `[images]\nremote_images = [ "${kirbyUrl}${options.pattern}" ]`;

		// Check if remote_images section exists
		if (remoteImagesRegex.test(netlifyToml)) {
			// Replace the existing section
			const updatedNetlifyToml = netlifyToml.replace(
				remoteImagesRegex,
				newRemoteImages
			);
			await fs.writeFile(netlifyTomlPath, updatedNetlifyToml, 'utf-8');
			logger.success(
				`Updated remote_images in netlify.toml with ${kirbyUrl}${options.pattern}`
			);
		} else {
			// Add the section if it doesn't exist
			const updatedNetlifyToml = `${netlifyToml}\n${newRemoteImages}\n`;
			await fs.writeFile(netlifyTomlPath, updatedNetlifyToml, 'utf-8');
			logger.success(
				`Added remote_images to netlify.toml with ${kirbyUrl}${options.pattern}`
			);
		}
	} catch (error) {
		handleNetlifyError(logger, error);
	}
}
