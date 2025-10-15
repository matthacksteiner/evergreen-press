import type { APIRoute } from 'astro';

const KIRBY_URL = import.meta.env.KIRBY_URL;

const sitemapIndexXml = `
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>${new URL('sitemap.xml', KIRBY_URL).href}</loc>
    </sitemap>
</sitemapindex>
`.trim();

export const GET: APIRoute = () => {
	return new Response(sitemapIndexXml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
};
