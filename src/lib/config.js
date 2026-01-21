import { env } from '$env/dynamic/public';

/**
 * Public project configuration.
 * Only non-sensitive values should be added here.
 */
export const config = {
	// AI Model Config (Public because it's not a secret)
	openrouter: {
		model: env.PUBLIC_OPENROUTER_MODEL || 'qwen/qwen-2.5-vl-7b-instruct:free'
	},

	// Security (Turnstile/Captcha)
	security: {
		turnstileSiteKey: env.PUBLIC_CLOUDFLARE_SITE_KEY || ''
	},

	// Game Logic
	game: {
		doubleExpInterval: Number(env.PUBLIC_DOUBLE_EXP_INTERVAL_WEEKS) || 2
	},

	// Development
	dev: {
		isDev: env.PUBLIC_DEV_MODE === 'true'
	}
};
