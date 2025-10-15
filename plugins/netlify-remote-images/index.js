/**
 * Netlify Remote Images Plugin
 *
 * This plugin updates the remote_images setting in netlify.toml
 * to use the KIRBY_URL from environment variables.
 */

import { createPluginConfig } from '../baukasten-utils/index.js';
import { magenta } from 'kleur/colors';
import netlifyRemoteImagesSetup from './src/setup.js';

// Default options for the plugin
const defaultOptions = {
	// Whether to update netlify.toml
	enabled: true,
	// The pattern to use for remote images
	pattern: '/media/.*',
};

export default createPluginConfig({
	name: 'netlify-remote-images',
	emoji: '🔄',
	color: magenta,
	defaultOptions,
	hooks: {
		'astro:config:setup': netlifyRemoteImagesSetup,
	},
});
