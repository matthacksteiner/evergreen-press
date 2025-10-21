/**
 * Timing Utilities
 *
 * Simple timing helpers for measuring plugin performance
 */

/**
 * Create a timer that can measure elapsed time
 *
 * @returns {Object} Timer object with start() and end() methods
 */
export function createTimer() {
	let startTime = null;

	return {
		/**
		 * Start the timer
		 */
		start() {
			startTime = performance.now();
		},

		/**
		 * Stop the timer and return elapsed time
		 *
		 * @returns {Object} Object with elapsed time in ms and formatted string
		 */
		end() {
			if (!startTime) {
				throw new Error('Timer was not started');
			}

			const elapsed = performance.now() - startTime;
			const formatted = formatDuration(elapsed);

			// Reset for potential reuse
			startTime = null;

			return { ms: elapsed, formatted };
		},

		/**
		 * Get current elapsed time without stopping timer
		 *
		 * @returns {Object} Object with elapsed time in ms and formatted string
		 */
		peek() {
			if (!startTime) {
				throw new Error('Timer was not started');
			}

			const elapsed = performance.now() - startTime;
			const formatted = formatDuration(elapsed);

			return { ms: elapsed, formatted };
		},
	};
}

/**
 * Format duration in milliseconds to human-readable string
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(ms) {
	if (ms < 1000) {
		return `${Math.round(ms)}ms`;
	}

	if (ms < 60000) {
		return `${(ms / 1000).toFixed(2)}s`;
	}

	const minutes = Math.floor(ms / 60000);
	const seconds = ((ms % 60000) / 1000).toFixed(0);
	return `${minutes}m ${seconds}s`;
}

/**
 * Measure execution time of an async function
 *
 * @param {Function} fn - Async function to measure
 * @param {Object} logger - Logger instance (optional)
 * @param {string} label - Label for the operation (optional)
 * @returns {Promise<Object>} Object with result and timing info
 */
export async function measureAsync(fn, logger = null, label = 'Operation') {
	const timer = createTimer();
	timer.start();

	try {
		const result = await fn();
		const timing = timer.end();

		if (logger) {
			logger.info(`${label} completed in ${timing.formatted}`);
		}

		return { result, timing };
	} catch (error) {
		const timing = timer.end();

		if (logger) {
			logger.error(`${label} failed after ${timing.formatted}`, error);
		}

		throw error;
	}
}
