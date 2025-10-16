import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import compress from '@playform/compress';
import langFolderRename from './plugins/lang-folder-rename/langFolderRename.js';
import fontDownloader from './plugins/font-downloader/fontDownloader.js';
import astroKirbySync from './plugins/astro-kirby-sync/index.js';
import netlifyRemoteImages from './plugins/netlify-remote-images/index.js';
import netlifyHybridImages from './plugins/netlify-hybrid-images/index.js';
import netlifyPrettyUrls from './plugins/netlify-pretty-urls/index.js';
import path from 'path';

const API_URL = process.env.KIRBY_URL;
const response = await fetch(`${API_URL}/global.json`);
const global = await response.json();
const defaultLanguage = global.defaultLang.code;
const translations = global.translations.map((lang) => lang.code);
const prefixDefaultLocale = global.prefixDefaultLocale;
const frontendUrl = global.frontendUrl.endsWith('/')
	? global.frontendUrl
	: `${global.frontendUrl}/`;

// https://astro.build/config
export default defineConfig({
	prefetch: {
		prerender: true,
	},
	site: frontendUrl,
	trailingSlash: 'always',
	redirects: {
		'/maintenance': '/maintenance/',
		'/preview': '/preview/home/',
	},
	i18n:
		translations && translations.length > 0
			? {
					defaultLocale: defaultLanguage,
					locales: [defaultLanguage, ...translations],
					routing: {
						prefixDefaultLocale,
					},
				}
			: undefined,
	integrations: [
		astroKirbySync(),
		tailwind({
			nesting: true,
			config: { path: './src/overrides/tailwind.config.cjs' },
		}),
		icon(),
		langFolderRename(),
		fontDownloader(),
		netlifyRemoteImages(),
		netlifyHybridImages(),
		netlifyPrettyUrls(),
		compress({
			HTML: true,
			JavaScript: true,
			CSS: true,
			Image: false,
			SVG: true,
		}),
	],
	adapter: netlify({
		imageCDN: true,
	}),
	vite: {
		resolve: {
			alias: {
				'@public': path.resolve('./public'),
			},
		},
	},
});
