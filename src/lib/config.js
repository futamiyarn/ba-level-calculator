import {
	PUBLIC_CLOUDFLARE_SITE_KEY,
	PUBLIC_DOUBLE_EXP_INTERVAL_WEEKS,
	PUBLIC_DEV_MODE,
	PUBLIC_OPENROUTER_API_KEY,
	PUBLIC_OPENROUTER_MODEL
} from '$env/static/public';

export const config = {
	// Config AI (OpenRouter)
	openrouter: {
		apiKey: PUBLIC_OPENROUTER_API_KEY || '',
		// Default ke Qwen Free jika env tidak diisi
		model: PUBLIC_OPENROUTER_MODEL || 'qwen/qwen-2.5-vl-7b-instruct:free'
	},

	// Keamanan (Turnstile/Captcha)
	security: {
		turnstileSiteKey: PUBLIC_CLOUDFLARE_SITE_KEY || ''
	},

	// Konfigurasi Game Logic
	game: {
		doubleExpInterval: Number(PUBLIC_DOUBLE_EXP_INTERVAL_WEEKS) || 2
	},

	// Konfigurasi Development
	dev: {
		// Aktif jika PUBLIC_DEV_MODE di .env diisi "true"
		isDev: PUBLIC_DEV_MODE === 'true'
	}
};
