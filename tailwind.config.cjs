const baseConfig = require('./src/config/tailwind.baseConfig.cjs');
const { screens } = require('./src/config/screens.js');

module.exports = {
	...baseConfig,
	theme: {
		...baseConfig.theme,
		screens,
		extend: {
			...baseConfig.theme.extend,
			// Add your custom extensions here
			colors: {
				...baseConfig.theme.extend.colors,
			},
			// Add more custom properties
		},
	},
	// You can also extend plugins
	plugins: [
		...baseConfig.plugins,
		// Add additional plugins
	],
};
