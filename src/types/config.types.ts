// Screen Configuration
export interface ScreenConfig {
	sm: string;
	md: string;
	lg: string;
	xl: string;
	'2xl': string;
	'3xl': string;
}

// Environment Configuration
export interface Environment {
	api: {
		url: string;
		endpoints: {
			global: string;
			preview: string;
			content: string;
			[key: string]: string;
		};
	};
	site: {
		url: string;
	};
}

// Theme Configuration
export interface ThemeConfig {
	colors: {
		primary: string;
		secondary: string;
		[key: string]: string;
	};
	fonts: {
		base: string;
		heading: string;
		[key: string]: string;
	};
}
