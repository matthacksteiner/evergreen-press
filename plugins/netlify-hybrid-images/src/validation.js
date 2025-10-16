import fs from 'fs';
import path from 'path';

/**
 * Validate that Kirby URL is configured in netlify.toml remote_images
 * @param {string} kirbyUrl
 * @param {string} projectRoot
 * @param {Object} logger
 * @returns {boolean}
 */
export function validateNetlifyToml(kirbyUrl, projectRoot, logger) {
	const tomlPath = path.join(projectRoot, 'netlify.toml');

	if (!fs.existsSync(tomlPath)) {
		logger.warn(
			'netlify.toml not found. If using remote images, ensure it is configured.'
		);
		return false;
	}

	try {
		const tomlContent = fs.readFileSync(tomlPath, 'utf8');

		// Simple regex to extract remote_images array
		const remoteImagesMatch = tomlContent.match(
			/remote_images\s*=\s*\[([\s\S]*?)\]/
		);

		if (!remoteImagesMatch) {
			logger.warn(
				`\n⚠️  No [images] remote_images configuration found in netlify.toml\n` +
					`   Add this to netlify.toml to allow remote image transformations:\n\n` +
					`   [images]\n` +
					`   remote_images = ["${kirbyUrl}/.*"]\n`
			);
			return false;
		}

		const patterns = remoteImagesMatch[1]
			.split(',')
			.map((p) => p.trim().replace(/['"]/g, ''));

		const kirbyDomain = new URL(kirbyUrl).origin;
		const isConfigured = patterns.some((pattern) => {
			try {
				// Test if pattern would match Kirby media URLs
				const regex = new RegExp(pattern.replace(/\\\./g, '.'));
				return regex.test(`${kirbyDomain}/media/test.jpg`);
			} catch {
				return false;
			}
		});

		if (!isConfigured) {
			logger.warn(
				`\n⚠️  Kirby CMS domain not found in netlify.toml remote_images\n` +
					`   Current: ${patterns.join(', ')}\n` +
					`   Expected pattern that matches: ${kirbyDomain}/.*\n\n` +
					`   Update netlify.toml to include:\n` +
					`   remote_images = ["${kirbyDomain}/.*"]\n`
			);
			return false;
		}

		logger.info('✓ Kirby domain properly configured in netlify.toml');
		return true;
	} catch (error) {
		logger.warn(`Unable to validate netlify.toml: ${error.message}`);
		return false;
	}
}

/**
 * Check if Cache-Control headers are configured for media files
 * @param {string} projectRoot
 * @param {string} mediaDir
 * @param {Object} logger
 */
export function checkCacheHeaders(projectRoot, mediaDir, logger) {
	const tomlPath = path.join(projectRoot, 'netlify.toml');
	const headersPath = path.join(projectRoot, 'public', '_headers');

	let hasHeaders = false;

	// Check netlify.toml
	if (fs.existsSync(tomlPath)) {
		const tomlContent = fs.readFileSync(tomlPath, 'utf8');
		if (tomlContent.includes(`for = "/${mediaDir}/`)) {
			hasHeaders = true;
		}
	}

	// Check _headers file
	if (fs.existsSync(headersPath)) {
		const headersContent = fs.readFileSync(headersPath, 'utf8');
		if (headersContent.includes(`/${mediaDir}/`)) {
			hasHeaders = true;
		}
	}

	if (!hasHeaders) {
		logger.info(
			`\n💡 Tip: Add Cache-Control headers for better performance:\n\n` +
				`   In netlify.toml:\n` +
				`   [[headers]]\n` +
				`     for = "/${mediaDir}/*"\n` +
				`     [headers.values]\n` +
				`       Cache-Control = "public, max-age=604800, must-revalidate"\n\n` +
				`   Or in public/_headers:\n` +
				`   /${mediaDir}/*\n` +
				`     Cache-Control: public, max-age=604800, must-revalidate\n`
		);
	}
}
