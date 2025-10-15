import type { APIRoute } from 'astro';
import { getFrontendUrl } from '@lib/api';

const robotsTxt = async (frontendUrl: string) =>
	`
User-agent: *
Allow: /
Disallow: /preview

Sitemap: ${new URL('sitemap-index.xml', frontendUrl).href}
`.trim();

export const GET: APIRoute = async () => {
	const frontendUrl = await getFrontendUrl();
	const normalizedUrl = frontendUrl.endsWith('/')
		? frontendUrl
		: `${frontendUrl  }/`;

	return new Response(await robotsTxt(normalizedUrl), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
