declare module 'swiper' {
	export interface SwiperOptions {
		slidesPerView?: number | 'auto';
		spaceBetween?: number;
		loop?: boolean;
		autoplay?:
			| boolean
			| {
					delay?: number;
					disableOnInteraction?: boolean;
			  };
		navigation?:
			| boolean
			| {
					nextEl?: string | HTMLElement;
					prevEl?: string | HTMLElement;
			  };
		pagination?:
			| boolean
			| {
					el?: string | HTMLElement;
					clickable?: boolean;
					type?: 'bullets' | 'fraction' | 'progressbar';
			  };
		effect?: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip';
		fadeEffect?: {
			crossFade?: boolean;
		};
		direction?: 'horizontal' | 'vertical';
		[key: string]: any;
	}

	export class Swiper {
		constructor(
			container: string | HTMLElement | null,
			options?: SwiperOptions
		);
		destroy(deleteInstance?: boolean, cleanStyles?: boolean): void;
		update(): void;
		slideTo(index: number, speed?: number, runCallbacks?: boolean): void;
		slideNext(speed?: number, runCallbacks?: boolean): void;
		slidePrev(speed?: number, runCallbacks?: boolean): void;
		on(event: string, handler: (...args: any[]) => void): void;
		off(event: string, handler?: (...args: any[]) => void): void;
		static use(modules: any[]): void;
		[key: string]: any;
	}

	export namespace Swiper {
		export interface SwiperOptions {
			slidesPerView?: number | 'auto';
			spaceBetween?: number;
			loop?: boolean;
			autoplay?:
				| boolean
				| {
						delay?: number;
						disableOnInteraction?: boolean;
				  };
			navigation?:
				| boolean
				| {
						nextEl?: string | HTMLElement;
						prevEl?: string | HTMLElement;
				  };
			pagination?:
				| boolean
				| {
						el?: string | HTMLElement;
						clickable?: boolean;
						type?: 'bullets' | 'fraction' | 'progressbar';
				  };
			effect?: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip';
			fadeEffect?: {
				crossFade?: boolean;
			};
			direction?: 'horizontal' | 'vertical';
			[key: string]: any;
		}
	}

	export class Navigation {
		constructor();
	}

	export class Autoplay {
		constructor();
	}

	export class Pagination {
		constructor();
	}

	export class EffectFade {
		constructor();
	}

	export default Swiper;
}
