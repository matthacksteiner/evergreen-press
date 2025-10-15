/**
 * Logger Utilities
 *
 * Consistent logging functions for Baukasten plugins
 */

import { bold, cyan, green, yellow, red, dim } from 'kleur/colors';

/**
 * Creates a plugin-specific logger with consistent styling
 *
 * @param {Object} options - Logger options
 * @param {string} options.name - Plugin name
 * @param {string} options.emoji - Emoji prefix
 * @param {Function} options.color - Kleur color function
 * @param {Object} options.astroLogger - Astro logger instance (optional)
 * @returns {Object} Logger object with info, warn, error methods
 */
export function createPluginLogger({
	name,
	emoji,
	color = cyan,
	astroLogger = null,
}) {
	const prefix = color(`${bold(`${emoji} [${name}]`)}`);

	// Use Astro logger if provided, otherwise use console
	const logger = astroLogger || console;

	return {
		/**
		 * Log informational message
		 * @param {string} message - Message to log
		 */
		info: (message) => {
			logger.info(`${prefix} ${dim(message)}`);
		},

		/**
		 * Log success message
		 * @param {string} message - Message to log
		 */
		success: (message) => {
			logger.info(`${prefix} ${green(`✓ ${message}`)}`);
		},

		/**
		 * Log warning message
		 * @param {string} message - Message to log
		 */
		warn: (message) => {
			logger.warn(`${prefix} ${yellow(`⚠️ ${message}`)}`);
		},

		/**
		 * Log error message
		 * @param {string} message - Message to log
		 * @param {Error} [error] - Optional error object
		 */
		error: (message, error = null) => {
			const errorMessage = error ? `${message}: ${error.message}` : message;
			logger.error(`${prefix} ${red(`✖ ${errorMessage}`)}`);
			if (error && error.stack && process.env.DEBUG) {
				logger.error(red(error.stack));
			}
		},
	};
}

/**
 * Handle errors in Netlify environment
 *
 * @param {Object} logger - Plugin logger
 * @param {Error} error - The error that occurred
 * @param {boolean} shouldThrow - Whether to throw in non-Netlify environments
 * @returns {boolean} - true if execution should continue, false to stop
 */
export function handleNetlifyError(logger, error, shouldThrow = true) {
	logger.error('Error occurred', error);

	// On Netlify, log a warning and continue
	if (process.env.NETLIFY) {
		logger.warn('Continuing build despite plugin error on Netlify');
		return true; // Continue execution
	}

	// In production, throw the error to stop the build
	if (shouldThrow && process.env.NODE_ENV === 'production') {
		return false; // Stop execution
	}

	// In development, log but continue
	logger.warn('Continuing in development mode despite error');
	return true;
}
