import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export default function langFolderRename() {
	return {
		name: 'lang-folder-rename',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				try {
					const pluginName = chalk.cyan.bold('🌐 [Lang Folder]');
					const API_URL = process.env.KIRBY_URL;
					if (!API_URL) {
						logger.warn(
							`${pluginName} ${chalk.yellow(
								'⚠️ KIRBY_URL environment variable is not set'
							)}`
						);
						return;
					}

					const response = await fetch(`${API_URL}/global.json`);
					const global = await response.json();
					const translations = global.translations;

					const pagesDir = path.resolve('./src/pages');
					const langFolder = path.join(pagesDir, '[lang]');
					const noLangFolder = path.join(pagesDir, '_[lang]');

					// Check if translations is empty or has length 0
					if (!translations || translations.length === 0) {
						// Only rename if [lang] exists and _[lang] doesn't
						if (fs.existsSync(langFolder) && !fs.existsSync(noLangFolder)) {
							fs.renameSync(langFolder, noLangFolder);
							logger.info(
								`${pluginName} ${chalk.yellow('⚠️')} ${chalk.dim(
									'No translations found.'
								)} ${chalk.cyan('[lang]')} → ${chalk.cyan('_[lang]')}`
							);
						}
					} else {
						// Rename back to [lang] if translations exist and _[lang] exists
						if (fs.existsSync(noLangFolder) && !fs.existsSync(langFolder)) {
							fs.renameSync(noLangFolder, langFolder);
							logger.info(
								`${pluginName} ${chalk.green('✓')} ${chalk.dim(
									'Translations found.'
								)} ${chalk.cyan('_[lang]')} → ${chalk.cyan('[lang]')}`
							);
						}
					}
				} catch (error) {
					const pluginName = chalk.cyan.bold('🌐 [Lang Folder]');
					logger.error(
						`${pluginName} ${chalk.red('✖ Error:')} ${chalk.red.dim(
							error.message
						)}`
					);
					// Don't fail the build if plugin errors
					if (process.env.NETLIFY) {
						logger.warn(
							`${pluginName} ${chalk.yellow(
								'⚠️ Continuing build despite plugin error on Netlify'
							)}`
						);
					}
				}
			},
			'astro:build:done': async ({ logger }) => {
				try {
					const pluginName = chalk.cyan.bold('🌐 [Lang Folder]');
					const pagesDir = path.resolve('./src/pages');
					const langFolder = path.join(pagesDir, '[lang]');
					const noLangFolder = path.join(pagesDir, '_[lang]');

					// Always try to restore to [lang] after build
					if (fs.existsSync(noLangFolder) && !fs.existsSync(langFolder)) {
						fs.renameSync(noLangFolder, langFolder);
						logger.info(
							`${pluginName} ${chalk.green('✓')} ${chalk.dim(
								'Restored folder name'
							)} ${chalk.cyan('_[lang]')} → ${chalk.cyan('[lang]')}`
						);
					}
				} catch (error) {
					const pluginName = chalk.cyan.bold('🌐 [Lang Folder]');
					logger.error(
						`${pluginName} ${chalk.red('✖ Error:')} ${chalk.red.dim(
							error.message
						)}`
					);
					// Don't fail the build if plugin errors
					if (process.env.NETLIFY) {
						logger.warn(
							`${pluginName} ${chalk.yellow(
								'⚠️ Continuing build despite plugin error on Netlify'
							)}`
						);
					}
				}
			},
		},
	};
}
