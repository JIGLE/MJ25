import '@testing-library/jest-dom';

// Basic matchMedia polyfill for jsdom tests (enough for our usage)
if (typeof window !== 'undefined' && !window.matchMedia) {
	window.matchMedia = function (query) {
		return {
			matches: false,
			media: query,
			onchange: null,
			addEventListener: function () {},
			removeEventListener: function () {},
			addListener: function () {},
			removeListener: function () {},
			dispatchEvent: function () { return false; }
		};
	};
}

// Provide a minimal scrollTo in jsdom
if (typeof window !== 'undefined' && !window.scrollTo) {
	window.scrollTo = function () {};
}

// Provide a simple fetch mock for tests so components that call fetch don't hit network.
// Always wrap/patch fetch so relative URLs don't throw in node/undici. If a test
// or runtime already set a fetch, we preserve it and wrap it.
(() => {
	const globalObj = typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : null);
	if (!globalObj) return;

		// For tests, always intercept fetch and return mocked responses to avoid any network
		// activity. Handle different input shapes: string, Request-like, and URL.
		globalObj.fetch = async (input, init) => {
			let urlStr = '';
			try {
				if (typeof input === 'string') urlStr = input;
				else if (input instanceof URL) urlStr = input.toString();
				else if (input && input.url) urlStr = input.url;
				else if (init && init.href) urlStr = init.href;
			} catch {
				urlStr = '';
			}

			// Gallery endpoint -> return empty items list
			if (typeof urlStr === 'string' && urlStr.includes('/api/gallery')) {
				return {
					ok: true,
					json: async () => ({ items: [] }),
				};
			}

			// Relative paths -> return generic empty object
			if (typeof urlStr === 'string' && urlStr.startsWith('/')) {
				return {
					ok: true,
					json: async () => ({}),
				};
			}

			// Default stub for any other request
			return {
				ok: true,
				json: async () => ({}),
			};
		};
})();
