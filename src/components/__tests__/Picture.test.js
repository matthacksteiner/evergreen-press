import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Picture from '../Picture.astro';

describe('Picture Component', () => {
	// Base props configuration for most tests
	const baseProps = {
		src: '/test.jpg',
		urlFocus: '/test-focus.jpg',
		urlFocusMobile: '/test-focus-mobile.jpg',
		width: 1200,
		height: 800,
		alt: 'Test image',
		name: 'test-image',
		ratioMobile: 'original',
		ratioDesktop: 'original',
		span: '6',
		position: 'center',
		loading: 'lazy',
		gridMarginDesktop: 24,
		gridMarginMobile: 16,
		gridGapDesktop: 24,
		gridGapMobile: 16,
		aboveFold: false,
	};

	/**
	 * Core functionality tests
	 */
	test('renders basic picture element with required attributes', async () => {
		const container = await AstroContainer.create({
			env: {
				NETLIFY_URL: 'https://example.com',
			},
		});
		const result = await container.renderToString(Picture, {
			props: baseProps,
		});

		// Check for essential elements
		expect(result).toContain('<picture');
		expect(result).toContain('</picture>');
		expect(result).toContain('<img');
		expect(result).toContain(`alt="Test image"`);
		expect(result).toContain(`loading="lazy"`);
		expect(result).toContain(`width=`);
		expect(result).toContain(`height=`);
	});

	test('handles original ratios correctly', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(Picture, {
			props: baseProps,
		});

		// Since we're using original ratio, it should use the original src
		expect(result).toContain(
			'style="--ratio-mobile: 1.5; --ratio-desktop: 1.5;"'
		);
	});

	test('handles custom ratios correctly', async () => {
		const container = await AstroContainer.create();
		const propsWithCustomRatios = {
			...baseProps,
			ratioMobile: '1/1',
			ratioDesktop: '16/9',
		};

		const result = await container.renderToString(Picture, {
			props: propsWithCustomRatios,
		});

		// Check for correct ratio values
		expect(result).toContain(
			'style="--ratio-mobile: 1; --ratio-desktop: 1.7777'
		);

		// With custom ratios, it should use the focal point images
		// URLs may be encoded in the output
		expect(result).toContain(
			encodeURIComponent(propsWithCustomRatios.urlFocusMobile)
		);
		expect(result).toContain(
			encodeURIComponent(propsWithCustomRatios.urlFocus)
		);
	});

	test('generates fallback alt text from name when alt is not provided', async () => {
		const container = await AstroContainer.create();
		const propsWithoutAlt = {
			...baseProps,
			alt: undefined,
		};

		const result = await container.renderToString(Picture, {
			props: propsWithoutAlt,
		});

		// Should generate "Test Image" from "test-image"
		expect(result).toContain('alt="Test Image"');
	});

	test('throws error when required props are missing', async () => {
		const container = await AstroContainer.create();

		// Test missing src
		const missingSource = { ...baseProps };
		delete missingSource.src;
		await expect(async () => {
			await container.renderToString(Picture, { props: missingSource });
		}).rejects.toThrow('Missing required props');

		// Test missing width
		const missingWidth = { ...baseProps };
		delete missingWidth.width;
		await expect(async () => {
			await container.renderToString(Picture, { props: missingWidth });
		}).rejects.toThrow('Missing required props');

		// Test missing span
		const missingSpan = { ...baseProps };
		delete missingSpan.span;
		await expect(async () => {
			await container.renderToString(Picture, { props: missingSpan });
		}).rejects.toThrow('Missing required props');
	});

	test('validates ratio format', async () => {
		const container = await AstroContainer.create();

		// Test invalid mobile ratio
		const invalidMobileRatio = {
			...baseProps,
			ratioMobile: 'invalid-ratio',
		};
		await expect(async () => {
			await container.renderToString(Picture, { props: invalidMobileRatio });
		}).rejects.toThrow('Invalid ratio format');

		// Test invalid desktop ratio
		const invalidDesktopRatio = {
			...baseProps,
			ratioDesktop: '16:9', // Using colon instead of slash
		};
		await expect(async () => {
			await container.renderToString(Picture, { props: invalidDesktopRatio });
		}).rejects.toThrow('Invalid ratio format');
	});

	/**
	 * Optional props and features tests
	 */
	test('renders with thumbhash when provided', async () => {
		const container = await AstroContainer.create();
		const propsWithThumbhash = {
			...baseProps,
			thumbhash: 'data:image/jpeg;base64,test',
		};

		const result = await container.renderToString(Picture, {
			props: propsWithThumbhash,
		});

		expect(result).toContain('class="thumbhash"');
		expect(result).toContain(
			'background-image: url(data:image/jpeg;base64,test)'
		);
	});

	test('renders with custom class name', async () => {
		const container = await AstroContainer.create();
		const propsWithClass = {
			...baseProps,
			class: 'custom-class',
		};

		const result = await container.renderToString(Picture, {
			props: propsWithClass,
		});

		expect(result).toContain('class="custom-class image-fade"');
	});

	test('applies custom ID to img element', async () => {
		const container = await AstroContainer.create();
		const propsWithId = {
			...baseProps,
			id: 'custom-id',
		};

		const result = await container.renderToString(Picture, {
			props: propsWithId,
		});

		expect(result).toContain('id="custom-id"');
	});

	test('renders with data-zoomable attributes', async () => {
		const container = await AstroContainer.create();
		const zoomableProps = {
			...baseProps,
			dataZoomable: true,
		};

		const result = await container.renderToString(Picture, {
			props: zoomableProps,
		});

		expect(result).toContain('data-zoomable="true"');
		expect(result).toContain('data-zoom-src="/test.jpg"');
	});

	/**
	 * Environment-specific rendering tests
	 */
	test('renders correctly in production environment', async () => {
		const container = await AstroContainer.create({
			env: {
				PROD: true,
				NETLIFY_URL: 'https://example.com',
			},
		});

		const result = await container.renderToString(Picture, {
			props: baseProps,
		});

		// Check for Netlify Image API usage
		expect(result).toContain('/.netlify/images?url=');
		expect(result).toContain('&#38;w='); // HTML encoded &w=
		expect(result).toContain('&#38;h='); // HTML encoded &h=
		expect(result).toContain('&#38;fit=cover&#38;fm=avif&#38;q=70'); // HTML encoded parameters
		expect(result).toContain('&#38;fit=cover&#38;fm=webp&#38;q=70'); // Additional WebP source

		// Check for responsive srcset (1x and 2x DPR values)
		expect(result).toContain('1x,');
		expect(result).toContain('2x');
	});

	test('renders with Netlify Image API in development environment too', async () => {
		const container = await AstroContainer.create({
			env: {
				PROD: false,
				NETLIFY_DEV: false,
				NETLIFY_URL: 'https://example.com',
			},
		});

		const result = await container.renderToString(Picture, {
			props: baseProps,
		});

		// The component is actually using Netlify Image API in dev mode too when NETLIFY_URL is present
		expect(result).toContain('/.netlify/images?url=');
		// Note: The base URL isn't prepended in test environment, just the API path is used
	});

	/**
	 * Performance optimization tests
	 */
	test('sets fetchpriority="high" when aboveFold=true and isFirstSlide=true', async () => {
		const container = await AstroContainer.create();
		const propsWithAboveFold = {
			...baseProps,
			aboveFold: true,
			isFirstSlide: true,
		};

		const result = await container.renderToString(Picture, {
			props: propsWithAboveFold,
		});

		expect(result).toContain('fetchpriority="high"');
		expect(result).not.toContain('loading="lazy"');
	});

	test('sets fetchpriority="low" when aboveFold=true and isFirstSlide=false', async () => {
		const container = await AstroContainer.create();
		const propsWithAboveFold = {
			...baseProps,
			aboveFold: true,
			isFirstSlide: false,
		};

		const result = await container.renderToString(Picture, {
			props: propsWithAboveFold,
		});

		expect(result).toContain('fetchpriority="low"');
		expect(result).not.toContain('loading="lazy"');
	});

	test('defaults to first slide priority when aboveFold=true and isFirstSlide is undefined', async () => {
		const container = await AstroContainer.create();
		const propsWithAboveFold = {
			...baseProps,
			aboveFold: true,
			// isFirstSlide intentionally omitted
		};

		const result = await container.renderToString(Picture, {
			props: propsWithAboveFold,
		});

		expect(result).toContain('fetchpriority="high"');
		expect(result).not.toContain('loading="lazy"');
	});

	test('does not set fetchpriority when aboveFold=false', async () => {
		const container = await AstroContainer.create();
		const propsWithoutAboveFold = {
			...baseProps,
			aboveFold: false,
			isFirstSlide: true,
		};

		const result = await container.renderToString(Picture, {
			props: propsWithoutAboveFold,
		});

		expect(result).not.toContain('fetchpriority');
		expect(result).toContain('loading="lazy"');
	});

	/**
	 * Layout and container tests
	 */
	test('handles backgroundContainer="container" correctly', async () => {
		const container = await AstroContainer.create({
			env: {
				PROD: true,
				NETLIFY_URL: 'https://example.com',
			},
		});
		const propsWithContainer = {
			...baseProps,
			backgroundContainer: 'container',
		};

		const result = await container.renderToString(Picture, {
			props: propsWithContainer,
		});

		expect(result).toContain('<picture');
	});

	test('handles backgroundContainer="full" correctly', async () => {
		const container = await AstroContainer.create({
			env: {
				PROD: true,
				NETLIFY_URL: 'https://example.com',
			},
		});
		const propsWithFull = {
			...baseProps,
			backgroundContainer: 'full',
		};

		const result = await container.renderToString(Picture, {
			props: propsWithFull,
		});

		expect(result).toContain('<picture');
	});

	/**
	 * Known issues and future enhancement tests
	 */
	test('ISSUE: currently ignores custom dataZoomSrc and uses sourceDesktop instead', async () => {
		const container = await AstroContainer.create();
		const customZoomProps = {
			...baseProps,
			dataZoomable: true,
			dataZoomSrc: '/custom-zoom-image.jpg',
		};

		const result = await container.renderToString(Picture, {
			props: customZoomProps,
		});

		expect(result).toContain('data-zoomable="true"');

		// Currently, the component ignores dataZoomSrc and uses sourceDesktop instead
		expect(result).toContain(`data-zoom-src="${customZoomProps.src}"`);

		// The custom zoom src is NOT being used in the current implementation
		expect(result).not.toContain(
			`data-zoom-src="${customZoomProps.dataZoomSrc}"`
		);
	});

	test.todo('ENHANCEMENT: should use custom dataZoomSrc when provided');

	test('ISSUE: position prop defined but not currently applied to img', async () => {
		const container = await AstroContainer.create();
		const positionProps = {
			...baseProps,
			position: 'top left',
		};

		const result = await container.renderToString(Picture, {
			props: positionProps,
		});

		// Position prop is defined in component interface but not currently used
		expect(result).not.toContain('object-position: top left');
	});

	test.todo(
		'ENHANCEMENT: position prop should add object-position style to img'
	);

	/**
	 * Responsive image tests
	 */
	test('generates correct responsive images for all breakpoints', async () => {
		const container = await AstroContainer.create({
			env: {
				PROD: true,
				NETLIFY_URL: 'https://example.com',
			},
		});

		const result = await container.renderToString(Picture, {
			props: baseProps,
		});

		// Check for smallest breakpoint (max-width: 320px)
		expect(result).toContain('media="(max-width: 320px)"');

		// Check for xs breakpoint (updated based on actual breakpoint structure)
		expect(result).toContain(
			'media="(min-width: 375px) and (max-width: 390px)"'
		);

		// Check for sm breakpoint (min-width: 640px) and (max-width: 768px)
		expect(result).toContain(
			'media="(min-width: 640px) and (max-width: 768px)"'
		);

		// Check for md breakpoint (min-width: 768px) and (max-width: 1024px)
		expect(result).toContain(
			'media="(min-width: 768px) and (max-width: 1024px)"'
		);

		// Check for lg breakpoint (min-width: 1024px) and (max-width: 1280px)
		expect(result).toContain(
			'media="(min-width: 1024px) and (max-width: 1280px)"'
		);

		// Check for xl breakpoint (min-width: 1280px) and (max-width: 1440px)
		expect(result).toContain(
			'media="(min-width: 1280px) and (max-width: 1440px)"'
		);

		// Check for 2xl breakpoint (min-width: 1440px) and (max-width: 1920px)
		expect(result).toContain(
			'media="(min-width: 1440px) and (max-width: 1920px)"'
		);

		// Check for largest breakpoint (min-width: 1921px)
		expect(result).toContain('media="(min-width: 1921px)"');

		// Check that srcset contains 1x and 2x DPR values for each source
		expect(result).toContain('1x,');
		expect(result).toContain('2x');

		// Extract all source tags and verify they have the expected structure
		const sourceTagRegex =
			/<source[^>]*srcset="[^"]*"[^>]*media="[^"]*"[^>]*>/g;
		const sourceTags = result.match(sourceTagRegex) || [];

		// We should have at least 5 different source tags for different breakpoints
		expect(sourceTags.length).toBeGreaterThanOrEqual(5);

		// Check a few specific breakpoints
		const mobileSource = sourceTags.find((tag) =>
			tag.includes('(max-width: 320px)')
		);
		expect(mobileSource).toBeDefined();
		expect(mobileSource).toContain('1x,');
		expect(mobileSource).toContain('2x');

		const desktopSource = sourceTags.find((tag) =>
			tag.includes('(min-width: 1921px)')
		);
		expect(desktopSource).toBeDefined();
		expect(desktopSource).toContain('1x,');
		expect(desktopSource).toContain('2x');

		// Verify width progression in one of the sources
		const srcset = desktopSource.match(/srcset="([^"]+)"/)[1];
		const srcsetUrls = srcset.split(',').map((s) => s.trim());

		// Extract widths (handle HTML-encoded ampersands)
		const widths = srcsetUrls.map((url) => {
			const match = url.match(/&#38;w=(\d+)/);
			return match ? parseInt(match[1], 10) : 0;
		});

		// DPR 2x should be roughly double 1x (component only generates 1x and 2x)
		expect(widths[1]).toBeGreaterThan(widths[0] * 1.5);

		// Test with custom ratios to verify different sources are used
		const customRatioContainer = await AstroContainer.create({
			env: {
				PROD: true,
				NETLIFY_URL: 'https://example.com',
			},
		});

		const customRatioResult = await customRatioContainer.renderToString(
			Picture,
			{
				props: {
					...baseProps,
					ratioMobile: '1/1',
					ratioDesktop: '16/9',
				},
			}
		);

		// Extract all source tags from the custom ratio result
		const customSourceTags = customRatioResult.match(sourceTagRegex) || [];

		// Mobile source should use urlFocusMobile (URL-encoded)
		const customMobileSource = customSourceTags.find((tag) =>
			tag.includes('(max-width: 320px)')
		);
		expect(customMobileSource).toBeDefined();
		expect(customMobileSource).toContain('%2Ftest-focus-mobile.jpg');

		// Desktop source should use urlFocus (URL-encoded)
		const customDesktopSource = customSourceTags.find((tag) =>
			tag.includes('(min-width: 1024px)')
		);
		expect(customDesktopSource).toBeDefined();
		expect(customDesktopSource).toContain('%2Ftest-focus.jpg');
	});
});
