/**
 * Configuration Utilities
 *
 * Functions for handling plugin configuration
 */

/**
 * Merge default options with user-provided options
 *
 * @param {Object} defaultOptions - Default option values
 * @param {Object} userOptions - User-provided options
 * @returns {Object} Merged options
 */
export function mergeOptions(defaultOptions, userOptions = {}) {
	return { ...defaultOptions, ...userOptions };
}

/**
 * Create a standardized Astro plugin configuration
 *
 * @param {Object} config - Plugin configuration
 * @param {string} config.name - Plugin name
 * @param {string} config.emoji - Plugin emoji
 * @param {Function} config.color - Kleur color function
 * @param {Object} config.hooks - Astro hooks to register
 * @param {Object} config.defaultOptions - Default options for the plugin
 * @param {Function} config.setup - Function to run on plugin setup
 * @returns {Function} Configured plugin function
 */
export function createPluginConfig({
	name,
	hooks = {},
	defaultOptions = {},
	setup = null,
}) {
	return (userOptions = {}) => {
		const options = mergeOptions(defaultOptions, userOptions);

		return {
			name,
			options,
			hooks: {
				// Run setup function during config setup if provided
				'astro:config:setup': async (params) => {
					if (typeof setup === 'function') {
						await setup({ ...params, options });
					}

					if (typeof hooks['astro:config:setup'] === 'function') {
						await hooks['astro:config:setup']({ ...params, options });
					}
				},

				// Forward other hooks
				...Object.entries(hooks)
					.filter(([hookName]) => hookName !== 'astro:config:setup')
					.reduce((acc, [hookName, hookFn]) => {
						acc[hookName] = (params) => hookFn({ ...params, options });
						return acc;
					}, {}),
			},
		};
	};
}
