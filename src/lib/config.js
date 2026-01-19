import {
	PUBLIC_GEMINI_API_KEY,
	PUBLIC_GEMINI_MODEL,
	PUBLIC_CLOUDFLARE_SITE_KEY,
	PUBLIC_DOUBLE_EXP_INTERVAL_WEEKS,
	PUBLIC_DEV_MODE // <-- Variabel baru
} from '$env/static/public';

export const config = {
	gemini: {
		apiKey: PUBLIC_GEMINI_API_KEY || '',
		model: PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash-preview-09-2025'
	},
	security: {
		turnstileSiteKey: PUBLIC_CLOUDFLARE_SITE_KEY || ''
	},
	game: {
		doubleExpInterval: Number(PUBLIC_DOUBLE_EXP_INTERVAL_WEEKS) || 2
	},
	// Konfigurasi Development
	dev: {
		// Aktif jika PUBLIC_DEV_MODE di .env diisi "true"
		isDev: PUBLIC_DEV_MODE === 'true'
	}
};
