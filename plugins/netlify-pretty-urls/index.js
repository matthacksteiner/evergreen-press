import netlifyPrettyUrlsSetup from './netlifyPrettyUrls.js';

export default function netlifyPrettyUrls() {
	return {
		name: 'netlify-pretty-urls',
		hooks: {
			'astro:build:done': netlifyPrettyUrlsSetup,
		},
	};
}
