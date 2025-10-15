import fs from 'fs';
import path from 'path';
import toml from '@iarna/toml';
import { createPluginLogger } from '../baukasten-utils/index.js';
import { magenta } from 'kleur/colors';

export default async function netlifyPrettyUrlsSetup({ logger: astroLogger }) {
	const logger = createPluginLogger({
		name: 'Pretty URLs',
		emoji: '🔗',
		color: magenta,
		astroLogger,
	});

	try {
		// Path to the generated netlify.toml in .netlify directory
		const netlifyConfigPath = path.resolve('.netlify', 'netlify.toml');

		if (!fs.existsSync(netlifyConfigPath)) {
			logger.warn('Generated netlify.toml not found, skipping pretty_urls fix');
			return;
		}

		// Read the generated config
		const configContent = fs.readFileSync(netlifyConfigPath, 'utf8');
		const config = toml.parse(configContent);

		// Ensure build.processing.html.pretty_urls is set to true
		if (!config.build) config.build = {};
		if (!config.build.processing) config.build.processing = {};
		if (!config.build.processing.html) config.build.processing.html = {};

		const currentValue = config.build.processing.html.pretty_urls;

		if (currentValue !== true) {
			logger.info(`Fixing pretty_urls setting from ${currentValue} to true`);
			config.build.processing.html.pretty_urls = true;

			// Write the corrected config back
			const updatedContent = toml.stringify(config);
			fs.writeFileSync(netlifyConfigPath, updatedContent, 'utf8');

			logger.success(
				'Successfully updated netlify.toml with pretty_urls = true'
			);
		} else {
			logger.info('pretty_urls is already set to true');
		}
	} catch (error) {
		logger.error('Error updating netlify.toml pretty_urls setting:', error);
	}
}
