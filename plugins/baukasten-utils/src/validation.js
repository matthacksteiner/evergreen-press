/**
 * Validation Utilities
 *
 * Functions for validating URLs, paths, and plugin options
 */

import path from 'path';

/**
 * Validate a URL string
 *
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.requireHttps - Require HTTPS protocol (default: false)
 * @param {string} options.fieldName - Field name for error messages (default: 'URL')
 * @returns {string} The validated URL
 * @throws {Error} If URL is invalid
 */
export function validateUrl(
	url,
	{ requireHttps = false, fieldName = 'URL' } = {}
) {
	if (!url || typeof url !== 'string') {
		throw new Error(`${fieldName} is required and must be a string`);
	}

	try {
		const parsed = new URL(url);

		if (requireHttps && parsed.protocol !== 'https:') {
			throw new Error(`${fieldName} must use HTTPS protocol`);
		}

		return parsed.toString();
	} catch (error) {
		if (error.message.includes('Invalid URL')) {
			throw new Error(`${fieldName} is not a valid URL: ${url}`);
		}
		throw error;
	}
}

/**
 * Sanitize a file path to prevent directory traversal attacks
 *
 * @param {string} inputPath - Path to sanitize
 * @param {Object} options - Sanitization options
 * @param {string} options.fieldName - Field name for error messages (default: 'Path')
 * @returns {string} The sanitized path
 * @throws {Error} If path contains directory traversal attempts
 */
export function sanitizePath(inputPath, { fieldName = 'Path' } = {}) {
	if (!inputPath || typeof inputPath !== 'string') {
		throw new Error(`${fieldName} is required and must be a string`);
	}

	// Normalize using posix style for cross-platform consistency
	const normalized = path.posix.normalize(inputPath);

	// Check for directory traversal attempts
	if (
		normalized.startsWith('../') ||
		normalized.includes('/../') ||
		normalized.includes('..\\') ||
		normalized === '..'
	) {
		throw new Error(
			`${fieldName} contains invalid directory traversal: ${inputPath}`
		);
	}

	// Check for absolute paths that might escape the working directory
	if (path.isAbsolute(normalized)) {
		throw new Error(`${fieldName} must be a relative path: ${inputPath}`);
	}

	return normalized;
}

/**
 * Validate plugin options against expected types and constraints
 *
 * @param {Object} options - Plugin options to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} The validated options
 * @throws {Error} If validation fails
 */
export function validateOptions(options, schema) {
	const errors = [];

	for (const [key, validator] of Object.entries(schema)) {
		const value = options[key];

		// Check required fields
		if (validator.required && (value === undefined || value === null)) {
			errors.push(`Option '${key}' is required`);
			continue;
		}

		// Skip validation if value is not provided and not required
		if (value === undefined || value === null) {
			continue;
		}

		// Type validation
		if (validator.type && typeof value !== validator.type) {
			errors.push(
				`Option '${key}' must be of type ${validator.type}, got ${typeof value}`
			);
			continue;
		}

		// Min/max for numbers
		if (validator.type === 'number') {
			if (validator.min !== undefined && value < validator.min) {
				errors.push(`Option '${key}' must be >= ${validator.min}`);
			}
			if (validator.max !== undefined && value > validator.max) {
				errors.push(`Option '${key}' must be <= ${validator.max}`);
			}
		}

		// Custom validator function
		if (validator.validate && typeof validator.validate === 'function') {
			try {
				validator.validate(value);
			} catch (error) {
				errors.push(`Option '${key}': ${error.message}`);
			}
		}
	}

	if (errors.length > 0) {
		throw new Error(
			`Plugin option validation failed:\n  - ${errors.join('\n  - ')}`
		);
	}

	return options;
}

/**
 * Validate file extension against allowed list
 *
 * @param {string} filename - Filename to check
 * @param {string[]} allowedExtensions - List of allowed extensions (e.g. ['.jpg', '.png'])
 * @param {Object} options - Validation options
 * @param {string} options.fieldName - Field name for error messages (default: 'File')
 * @returns {boolean} True if extension is allowed
 * @throws {Error} If extension is not allowed
 */
export function validateFileExtension(
	filename,
	allowedExtensions,
	{ fieldName = 'File' } = {}
) {
	if (!filename || typeof filename !== 'string') {
		throw new Error(`${fieldName} name is required`);
	}

	if (!Array.isArray(allowedExtensions) || allowedExtensions.length === 0) {
		throw new Error('Allowed extensions list is required');
	}

	const ext = path.extname(filename).toLowerCase();

	if (!allowedExtensions.includes(ext)) {
		throw new Error(
			`${fieldName} extension '${ext}' is not allowed. Allowed: ${allowedExtensions.join(', ')}`
		);
	}

	return true;
}
