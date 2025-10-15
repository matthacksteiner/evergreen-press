import { defineMiddleware } from 'astro:middleware';
import { getData } from '@lib/api';
import type { GlobalData } from '@app-types';

export const onRequest = defineMiddleware(async (context, next) => {
	const url = context.url;
	const pathname = url.pathname;

	// Skip middleware for maintenance page itself and essential pages
	if (
		pathname === '/maintenance' ||
		pathname === '/maintenance/' ||
		pathname === '/error' ||
		pathname === '/error/' ||
		pathname === '/404' ||
		pathname === '/404/' ||
		pathname.startsWith('/preview/') ||
		pathname.startsWith('/_') ||
		pathname.startsWith('/api/') ||
		pathname.endsWith('.json') ||
		pathname.endsWith('.xml') ||
		pathname.endsWith('.txt') ||
		pathname.endsWith('.ico') ||
		pathname.startsWith('/_astro/') ||
		pathname.startsWith('/assets/')
	) {
		return next();
	}

	// Skip maintenance mode check during development and prerendering
	// to avoid Astro.request.headers warnings
	if (import.meta.env.DEV) {
		// In development mode, maintenance mode is disabled to avoid header warnings
		return next();
	}

	try {
		// Get global data to check maintenance mode
		const globalData = await getData<GlobalData>('/global.json');

		// If maintenance mode is enabled, redirect all pages to maintenance
		if (globalData?.maintenanceToggle === true) {
			// Use rewrite instead of redirect to avoid showing /maintenance in URL
			// Use /maintenance/ to match trailingSlash: 'always' configuration
			return context.rewrite('/maintenance/');
		}
	} catch (error) {
		console.warn('Failed to check maintenance mode in middleware:', error);
		// Continue normally if we can't check maintenance mode
	}

	return next();
});
