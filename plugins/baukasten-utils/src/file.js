/**
 * File Utilities
 *
 * Functions for file system operations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Get the project root directory
 *
 * @param {string} importMetaUrl - import.meta.url from the calling module
 * @returns {string} The absolute path to the project root
 */
export function getProjectRoot(importMetaUrl) {
	const __dirname = path.dirname(fileURLToPath(importMetaUrl));
	return path.resolve(__dirname, '../../../');
}

/**
 * Ensure a directory exists, creating it if necessary
 *
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} True if directory exists or was created
 */
export function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		try {
			fs.mkdirSync(dirPath, { recursive: true });
			return true;
		} catch (error) {
			console.error(`Error creating directory ${dirPath}:`, error);
			return false;
		}
	}
	return true;
}

/**
 * Clean a directory by removing all contents
 *
 * @param {string} dirPath - Path to the directory
 * @param {Object} options - Options for cleaning
 * @param {Array<string>} options.exclude - Files to exclude from cleaning
 * @param {boolean} options.recreate - Whether to recreate the directory if it doesn't exist
 * @returns {boolean} True if successful
 */
export function cleanDirectory(
	dirPath,
	{ exclude = [], recreate = true } = {}
) {
	if (!fs.existsSync(dirPath)) {
		if (recreate) {
			return ensureDirectoryExists(dirPath);
		}
		return false;
	}

	try {
		const files = fs.readdirSync(dirPath);

		for (const file of files) {
			if (exclude.includes(file)) continue;

			const filePath = path.join(dirPath, file);
			if (fs.statSync(filePath).isDirectory()) {
				fs.rmSync(filePath, { recursive: true, force: true });
			} else {
				fs.unlinkSync(filePath);
			}
		}

		return true;
	} catch (error) {
		console.error(`Error cleaning directory ${dirPath}:`, error);
		return false;
	}
}

/**
 * Save JSON data to a file
 *
 * @param {string} filePath - Path to save the file
 * @param {Object} data - Data to save
 * @param {Object} options - Options for saving
 * @param {boolean} options.ensureDir - Whether to ensure the directory exists
 * @param {number} options.indent - Indentation level for JSON
 * @returns {boolean} True if successful
 */
export function saveJsonFile(
	filePath,
	data,
	{ ensureDir = true, indent = 2 } = {}
) {
	try {
		if (ensureDir) {
			const dirPath = path.dirname(filePath);
			ensureDirectoryExists(dirPath);
		}

		fs.writeFileSync(filePath, JSON.stringify(data, null, indent));
		return true;
	} catch (error) {
		console.error(`Error saving file ${filePath}:`, error);
		return false;
	}
}

/**
 * Read JSON data from a file
 *
 * @param {string} filePath - Path to the file
 * @param {Object} options - Options for reading
 * @param {any} options.defaultValue - Value to return if file doesn't exist
 * @returns {Object|null} The parsed JSON or null on error
 */
export function readJsonFile(filePath, { defaultValue = null } = {}) {
	if (!fs.existsSync(filePath)) {
		return defaultValue;
	}

	try {
		const content = fs.readFileSync(filePath, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		console.error(`Error reading file ${filePath}:`, error);
		return defaultValue;
	}
}
