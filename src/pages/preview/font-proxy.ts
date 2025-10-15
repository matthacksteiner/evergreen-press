export const prerender = false;

interface FontProxyResponse {
	status: number;
	headers: Record<string, string>;
	body?: ArrayBuffer;
}

const CACHE_DURATION = 31536000; // 1 year in seconds
const ALLOWED_FONT_TYPES = {
	woff: 'font/woff',
	woff2: 'font/woff2',
	ttf: 'font/ttf',
} as const;

function getFontContentType(url: string): string {
	const extension = url.split('.').pop()?.toLowerCase();
	return (
		ALLOWED_FONT_TYPES[extension as keyof typeof ALLOWED_FONT_TYPES] ||
		'font/woff'
	);
}

async function handleFontProxy(url: string): Promise<FontProxyResponse> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			return {
				status: response.status,
				headers: { 'Content-Type': 'text/plain' },
			};
		}

		const fontData = await response.arrayBuffer();
		const contentType = getFontContentType(url);

		return {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': `public, max-age=${CACHE_DURATION}, immutable`,
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Max-Age': '86400',
				Vary: 'Origin',
			},
			body: fontData,
		};
	} catch (error) {
		console.error('Error proxying font:', error);
		return {
			status: 500,
			headers: {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
			},
		};
	}
}

export async function GET({ url }): Promise<Response> {
	const fontUrl = url.searchParams.get('url');

	if (!fontUrl) {
		return new Response('Font URL is required', {
			status: 400,
			headers: { 'Content-Type': 'text/plain' },
		});
	}

	const { status, headers, body } = await handleFontProxy(fontUrl);
	return new Response(body, { status, headers });
}

export function OPTIONS(): Response {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Max-Age': '86400',
		},
	});
}
