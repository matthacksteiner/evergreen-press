import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Link from '../Link.astro';

describe('Link Component', () => {
	test('throws error when link prop is missing', async () => {
		const container = await AstroContainer.create();
		await expect(async () => {
			await container.renderToString(Link, {
				props: {},
			});
		}).rejects.toThrow('Missing link prop in Link.astro');
	});

	test('renders URL type link correctly', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'url',
				href: 'https://example.com',
				title: 'Example Link',
			},
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('href="https://example.com"');
		expect(result).toContain('Example Link');
	});

	test('renders page type link with language and hash correctly', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'page',
				uri: 'about',
				hash: 'section1',
				title: 'About Us',
			},
		};

		const result = await container.renderToString(Link, {
			props,
			params: { lang: 'en' },
		});
		expect(result).toContain('href="/en/about/#section1"');
		expect(result).toContain('About Us');
	});

	test('renders page type link without language prefix', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'page',
				uri: 'contact',
				title: 'Contact',
			},
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('href="/contact/"');
		expect(result).toContain('Contact');
	});

	test('renders home page link correctly with language', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'page',
				uri: '',
				title: 'Home',
			},
		};

		const result = await container.renderToString(Link, {
			props,
			params: { lang: 'en' },
		});
		expect(result).toContain('href="/en/"');
		expect(result).toContain('Home');
	});

	test('renders home page link correctly without language', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'page',
				uri: '',
				title: 'Home',
			},
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('href="/"');
		expect(result).toContain('Home');
	});

	test('renders file type link with download attribute', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'file',
				href: '/documents/sample.pdf',
				title: 'Download PDF',
			},
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('href="/documents/sample.pdf"');
		expect(result).toContain('download');
		expect(result).toContain('Download PDF');
	});

	test('renders email type link correctly', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'email',
				href: 'test@example.com',
				title: 'Email Us',
			},
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('href="test@example.com"');
		expect(result).toContain('Email Us');
	});

	test('renders telephone type link correctly', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'tel',
				href: '1234567890',
				title: 'Call Us',
			},
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('href="tel:1234567890"');
		expect(result).toContain('Call Us');
	});

	test('adds popup attributes for external links', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'url',
				href: 'https://example.com',
				popup: true,
				title: 'External Link',
			},
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('target="_blank"');
		expect(result).toContain('rel="noopener"');
	});

	test('renders with custom class name', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'url',
				href: 'https://example.com',
				title: 'Styled Link',
			},
			class: 'custom-link-class',
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('class="custom-link-class"');
	});

	test('uses fallback content when title is missing', async () => {
		const container = await AstroContainer.create();
		const props = {
			link: {
				type: 'url',
				href: 'https://example.com',
			},
		};

		const result = await container.renderToString(Link, { props });
		expect(result).toContain('https://example.com');
	});
});
