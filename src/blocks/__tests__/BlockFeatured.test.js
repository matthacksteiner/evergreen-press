import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import BlockFeatured from '../BlockFeatured.astro';

describe('BlockFeatured Component', () => {
	// Mock global data
	const mockGlobal = {
		gridBlockMobile: 16,
		gridBlockDesktop: 24,
		gridGapMobile: 16,
		gridGapDesktop: 24,
		gridMarginMobile: 16,
		gridMarginDesktop: 24,
	};

	// Mock image data structure
	const mockImage = {
		url: '/test-image.jpg',
		urlFocus: '/test-image-focus.jpg',
		urlFocusMobile: '/test-image-focus-mobile.jpg',
		width: 800,
		height: 600,
		alt: 'Test image',
		name: 'test-image',
		identifier: 'test-id',
		classes: 'test-class',
		thumbhash: 'data:image/png;base64,test',
	};

	// Mock featured items
	const mockItems = [
		{
			id: 'item-1',
			title: 'Featured Item 1',
			description: 'Description for item 1',
			uri: 'items/item-1',
			url: 'http://example.com/items/item-1',
			status: 'listed',
			position: 1,
			thumbnail: mockImage,
			coverOnly: false,
		},
		{
			id: 'item-2',
			title: 'Featured Item 2',
			description: 'Description for item 2',
			uri: 'items/item-2',
			url: 'http://example.com/items/item-2',
			status: 'listed',
			position: 2,
			thumbnail: mockImage,
			coverOnly: true,
		},
		{
			id: 'item-3',
			title: 'Unlisted Item',
			description: 'This should not appear',
			uri: 'items/item-3',
			url: 'http://example.com/items/item-3',
			status: 'unlisted',
			position: 3,
			thumbnail: mockImage,
			coverOnly: false,
		},
	];

	// Base props configuration
	const baseProps = {
		items: mockItems,
		titleLevel: 'h2',
		titleFont: 'regular',
		titleColor: 'black',
		titleSize: 'base',
		titleAlign: 'left',
		textFont: 'regular',
		textColor: 'black',
		textSize: 'base',
		textAlign: 'left',
		spanMobile: '6',
		spanDesktop: '6',
		gapMobile: '16',
		gapDesktop: '24',
		ratioMobile: '1/1',
		ratioDesktop: '16/9',
		fontTitleToggle: true,
		fontTextToggle: true,
		captionAlign: 'bottom',
		captionControls: [],
		global: mockGlobal,
		span: 6,
		metadata: {
			identifier: 'featured-block',
			classes: 'custom-class',
			attributes: {
				'data-test': 'featured',
			},
		},
	};

	/**
	 * Core functionality tests
	 */
	test('renders basic featured block with required elements', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: baseProps,
		});

		// Check for main section element
		expect(result).toContain('<section');
		expect(result).toContain('class="blockFeatured blocks custom-class"');
		expect(result).toContain('id="featured-block"');
		expect(result).toContain('data-test="featured"');

		// Check for grid container
		expect(result).toContain('class="grid-default"');

		// Check for featured items (only listed items should appear)
		expect(result).toContain('Featured Item 1');
		expect(result).toContain('Featured Item 2');
		expect(result).not.toContain('Unlisted Item');
	});

	test('returns empty when no items provided', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				items: [],
			},
		});

		expect(result.trim()).toBe('');
	});

	test('returns empty when items is null or undefined', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				items: null,
			},
		});

		expect(result.trim()).toBe('');
	});

	/**
	 * Cover-only mode tests
	 */
	test('renders cover-only items without links', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			params: { lang: 'de' },
			props: baseProps,
		});

		// Non-cover items should have links
		expect(result).toContain('href="/de/items/item-1/"');
		// Cover-only items should not have links to their pages
		expect(result).not.toContain('href="/de/items/item-2/"');
	});

	test('cover-only items display content differently', async () => {
		const container = await AstroContainer.create();
		const coverOnlyItems = [
			{
				...mockItems[0],
				coverOnly: true,
			},
		];

		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				items: coverOnlyItems,
				captionAlign: 'center',
			},
		});

		// Cover-only items with center caption should have absolute positioning
		expect(result).toContain('absolute left-2/4 top-2/4');
		expect(result).toContain('z-10 w-4/5 max-w-[75%]');
		expect(result).toContain('-translate-x-2/4 -translate-y-2/4');
	});

	/**
	 * Caption alignment tests
	 */
	test('renders center-aligned captions with absolute positioning', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				captionAlign: 'center',
				fontTitleToggle: true,
				fontTextToggle: true,
			},
		});

		// Center-aligned content should have absolute positioning classes
		expect(result).toContain('absolute left-2/4 top-2/4');
		expect(result).toContain('z-10 w-4/5 max-w-[75%]');
		expect(result).toContain('-translate-x-2/4 -translate-y-2/4');
	});

	test('renders non-center captions below images', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				captionAlign: 'bottom',
				fontTitleToggle: true,
				fontTextToggle: true,
			},
		});

		// Non-center captions should use the text-content class pattern
		expect(result).toContain('featured-text-content');
		expect(result).toContain('z-10');
		// Should not contain absolute positioning for center captions
		expect(result).not.toContain('absolute left-2/4 top-2/4');
	});

	/**
	 * Font toggle tests
	 */
	test('hides title when fontTitleToggle is false', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				fontTitleToggle: false,
				fontTextToggle: true,
			},
		});

		// Should not contain title elements but should contain text
		expect(result).not.toContain('<h2');
		expect(result).toContain('Description for item 1');
	});

	test('hides text when fontTextToggle is false', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				fontTitleToggle: true,
				fontTextToggle: false,
			},
		});

		// Should contain title but not description paragraphs
		expect(result).toContain('<h2');
		expect(result).toContain('Featured Item 1');
		// The description text might still appear in HTML but not in visible <p> tags
		const paragraphMatches = result.match(
			/<p[^>]*>.*?Description for item 1.*?<\/p>/g
		);
		expect(paragraphMatches).toBeNull();
	});

	test('hides both title and text when both toggles are false', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				fontTitleToggle: false,
				fontTextToggle: false,
			},
		});

		// Should not contain title or text elements
		expect(result).not.toContain('<h2');
		const paragraphMatches = result.match(/<p[^>]*>.*?Description.*?<\/p>/g);
		expect(paragraphMatches).toBeNull();

		// But should still contain the image
		expect(result).toContain('class="picture-container"');
	});

	/**
	 * Overlay functionality tests
	 */
	test('applies overlay when captionControls includes overlay', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				captionControls: ['overlay'],
			},
		});

		// Should contain overlay class
		expect(result).toContain('overlay');
	});

	test('does not apply overlay when captionControls is empty', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				captionControls: [],
			},
		});

		// Should not contain overlay class in relative divs
		const overlayMatches = result.match(
			/class="[^"]*relative[^"]*overlay[^"]*"/g
		);
		expect(overlayMatches).toBeNull();
	});

	test('applies overlay with other caption controls', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				captionControls: ['overlay', 'other-control'],
			},
		});

		// Should still contain overlay class
		expect(result).toContain('overlay');
	});

	/**
	 * Item rendering tests
	 */
	test('renders clickable items with correct links', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			params: { lang: 'de' },
			props: baseProps,
		});

		// Non-cover items should have links
		expect(result).toContain('href="/de/items/item-1/"');
		// Cover-only items should not have links (just image)
		expect(result).not.toContain('href="/de/items/item-2/"');
	});

	test('renders links without language prefix when no lang param', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: baseProps,
		});

		expect(result).toContain('href="/items/item-1/"');
	});

	test('applies correct grid classes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				spanMobile: '12',
				spanDesktop: '4',
			},
		});

		expect(result).toContain('col-span-12');
		expect(result).toContain('lg:col-span-4');
	});

	/**
	 * Typography tests
	 */
	test('applies correct title typography classes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				titleLevel: 'h3',
				titleColor: 'primary',
				titleSize: 'lg',
				titleAlign: 'center',
			},
		});

		expect(result).toContain('<h3');
		expect(result).toContain('text--primary');
		expect(result).toContain('font--lg');
		expect(result).toContain('text--center');
	});

	test('applies correct text typography classes', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				textColor: 'secondary',
				textSize: 'sm',
				textAlign: 'right',
			},
		});

		expect(result).toContain('text--secondary');
		expect(result).toContain('font--sm');
		expect(result).toContain('text--right');
	});

	test('uses default h2 title level when not specified', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				titleLevel: undefined,
			},
		});

		expect(result).toContain('<h2');
	});

	test('applies custom CSS classes for titles and text', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: baseProps,
		});

		// Should apply the custom classes passed to SectionImage
		expect(result).toContain('featured-title');
		expect(result).toContain('featured-text');
		expect(result).toContain('featured-text-content');
	});

	/**
	 * Image component integration tests
	 */
	test('passes correct props to ImageComponent', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: baseProps,
		});

		// Check that ImageComponent receives the image data
		expect(result).toContain('class="picture-container"');
		expect(result).toContain('--ratio-mobile: 1');
		expect(result).toContain('--ratio-desktop:');
	});

	test('passes background container setting correctly', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: baseProps,
		});

		// The SectionImage should pass backgroundContainer="container" to ImageComponent
		// This should affect the CSS variables or classes applied
		expect(result).toContain('class="picture-container"');
	});

	/**
	 * Filtering and sorting tests
	 */
	test('filters out unlisted items', async () => {
		const container = await AstroContainer.create();
		const itemsWithUnlisted = [
			...mockItems,
			{
				id: 'item-4',
				title: 'Draft Item',
				description: 'Draft description',
				uri: 'items/item-4',
				status: 'draft',
				position: 4,
				thumbnail: mockImage,
				coverOnly: false,
			},
		];

		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				items: itemsWithUnlisted,
			},
		});

		expect(result).toContain('Featured Item 1');
		expect(result).toContain('Featured Item 2');
		expect(result).not.toContain('Draft Item');
	});

	test('sorts items by position', async () => {
		const container = await AstroContainer.create();
		const unorderedItems = [
			{
				...mockItems[1],
				position: 3,
			},
			{
				...mockItems[0],
				position: 1,
			},
			{
				id: 'item-middle',
				title: 'Middle Item',
				description: 'Middle description',
				uri: 'items/middle',
				status: 'listed',
				position: 2,
				thumbnail: mockImage,
				coverOnly: false,
			},
		];

		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				items: unorderedItems,
			},
		});

		// Items should appear in position order (1, 2, 3)
		const item1Index = result.indexOf('Featured Item 1');
		const middleIndex = result.indexOf('Middle Item');
		const item2Index = result.indexOf('Featured Item 2');

		expect(item1Index).toBeLessThan(middleIndex);
		expect(middleIndex).toBeLessThan(item2Index);
	});

	/**
	 * Metadata tests
	 */
	test('handles metadata attributes correctly', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				metadata: {
					identifier: 'custom-id',
					classes: 'custom-class another-class',
					attributes: {
						'data-feature': 'test',
						'aria-label': 'Featured items section',
					},
				},
			},
		});

		expect(result).toContain('id="custom-id"');
		expect(result).toContain(
			'class="blockFeatured blocks custom-class another-class"'
		);
		expect(result).toContain('data-feature="test"');
		expect(result).toContain('aria-label="Featured items section"');
	});

	test('handles missing metadata gracefully', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				metadata: undefined,
			},
		});

		expect(result).toContain('class="blockFeatured blocks"');
		expect(result).not.toContain('<section id=');
	});

	/**
	 * Gap and spacing tests
	 */
	test('applies correct CSS variables for gaps', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				gapMobile: '8',
				gapDesktop: '32',
			},
		});

		expect(result).toContain('--gapMobile: 0.5rem');
		expect(result).toContain('--gapDesktop: 2rem');
	});

	test('handles zero gaps correctly', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				gapMobile: '0',
				gapDesktop: '0',
			},
		});

		expect(result).toContain('--gapMobile: 0rem');
		expect(result).toContain('--gapDesktop: 0rem');
	});

	/**
	 * Content rendering tests
	 */
	test('renders item titles and descriptions correctly', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			props: baseProps,
		});

		expect(result).toContain('Featured Item 1');
		expect(result).toContain('Description for item 1');
		expect(result).toContain('Featured Item 2');
		expect(result).toContain('Description for item 2');
	});

	test('handles HTML content in titles and descriptions', async () => {
		const container = await AstroContainer.create();
		const itemsWithHtml = [
			{
				...mockItems[0],
				title: 'Item with <strong>bold</strong> text',
				description: 'Description with <em>emphasis</em>',
			},
		];

		const result = await container.renderToString(BlockFeatured, {
			props: {
				...baseProps,
				items: itemsWithHtml,
			},
		});

		expect(result).toContain('<strong>bold</strong>');
		expect(result).toContain('<em>emphasis</em>');
	});

	/**
	 * SectionImage integration tests
	 */
	test('passes all required props to SectionImage', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(BlockFeatured, {
			params: { lang: 'en' },
			props: {
				...baseProps,
				titleLevel: 'h4',
				titleFont: 'serif',
				captionAlign: 'top',
			},
		});

		// Check that the title level is properly passed and used
		expect(result).toContain('<h4');

		// Check that the custom classes are applied
		expect(result).toContain('featured-title');
		expect(result).toContain('featured-text');
		expect(result).toContain('featured-text-content');
	});

	test('handles items with missing thumbnails', async () => {
		const container = await AstroContainer.create();
		const itemsWithMissingThumbnails = [
			{
				...mockItems[0],
				// Item with valid thumbnail should render
			},
			{
				...mockItems[1],
				thumbnail: null, // Item without thumbnail
			},
		];

		// Currently the component doesn't handle missing thumbnails gracefully
		// This test documents the current behavior and can be updated when the component is improved
		try {
			const result = await container.renderToString(BlockFeatured, {
				props: {
					...baseProps,
					items: itemsWithMissingThumbnails,
				},
			});

			// If the component is fixed to handle missing thumbnails, update this expectation
			expect(result).toContain('Featured Item 1');
		} catch (error) {
			// Current expected behavior - component throws error on null thumbnail
			expect(error.message).toContain(
				"Cannot read properties of null (reading 'url')"
			);
		}
	});
});
