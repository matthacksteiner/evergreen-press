/**
 * Netlify Remote Images Plugin
 *
 * This plugin updates the remote_images setting in netlify.toml
 * to use the KIRBY_URL from environment variables.
 * This allows Netlify's Image CDN to fetch and optimize images
 * from the Kirby CMS during preview mode.
 */

export { default } from './netlifyRemoteImages.js';
