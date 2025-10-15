/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
	test: {
		// Vitest configuration options
		environment: 'node',
		globals: true,
		env: {
			PROD: 'true',
			NETLIFY_DEV: 'false',
			NETLIFY_URL: 'https://example.com',
		},
	},
});
