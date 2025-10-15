/**
 * Netlify Remote Images Plugin
 *
 * This plugin updates the remote_images setting in netlify.toml
 * to use the KIRBY_URL from environment variables.
 */

import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { bold, green, yellow } from 'kleur/colors';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

export default function netlifyRemoteImages() {
	return {
		name: 'netlify-remote-images',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				try {
					// Load environment variables
					dotenv.config();
					const kirbyUrl = process.env.KIRBY_URL;

					if (!kirbyUrl) {
						logger.warn(
							yellow(
								'No KIRBY_URL found in environment variables. Skipping netlify.toml update.'
							)
						);
						return;
					}

					// Clean URL by removing trailing slash
					const cleanKirbyUrl = kirbyUrl.endsWith('/')
						? kirbyUrl.slice(0, -1)
						: kirbyUrl;

					// Read the netlify.toml file
					const netlifyTomlPath = path.join(projectRoot, 'netlify.toml');
					const netlifyToml = await fs.readFile(netlifyTomlPath, 'utf-8');

					// Regular expression to find and replace the remote_images section
					const remoteImagesRegex =
						/\[images\]\s*remote_images\s*=\s*\[\s*"[^"]*"\s*\]/s;
					const newRemoteImages = `[images]\nremote_images = [ "${cleanKirbyUrl}/media/.*" ]`;

					// Check if remote_images section exists
					if (remoteImagesRegex.test(netlifyToml)) {
						// Replace the existing section
						const updatedNetlifyToml = netlifyToml.replace(
							remoteImagesRegex,
							newRemoteImages
						);
						await fs.writeFile(netlifyTomlPath, updatedNetlifyToml, 'utf-8');
						logger.info(
							green(
								`✓ Updated remote_images in netlify.toml with ${bold(
									cleanKirbyUrl
								)}/media/.*`
							)
						);
					} else {
						// Add the section if it doesn't exist
						const updatedNetlifyToml = `${netlifyToml}\n${newRemoteImages}\n`;
						await fs.writeFile(netlifyTomlPath, updatedNetlifyToml, 'utf-8');
						logger.info(
							green(
								`✓ Added remote_images to netlify.toml with ${bold(
									cleanKirbyUrl
								)}/media/.*`
							)
						);
					}
				} catch (error) {
					logger.error(`Failed to update netlify.toml: ${error.message}`);
				}
			},
		},
	};
}
