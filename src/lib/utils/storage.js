// Constants
const STORAGE_KEY_DATA = 'ba_planner_data';
const STORAGE_KEY_CONFIG = 'ba_planner_config';
const STORAGE_KEY_LIMIT = 'ba_scan_usage_v4';
const STORAGE_KEY_INFO_SEEN = 'ba_info_modal_seen';

const MAX_SCANS_PER_DAY = 3;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 Hours

export const storage = {
	// User Data
	saveUserData: (data) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
	},

	loadUserData: () => {
		if (typeof localStorage === 'undefined') return null;
		const raw = localStorage.getItem(STORAGE_KEY_DATA);
		return raw ? JSON.parse(raw) : null;
	},

	// User Config
	saveUserConfig: (config) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
	},

	loadUserConfig: () => {
		if (typeof localStorage === 'undefined') return null;
		const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
		return raw ? JSON.parse(raw) : null;
	},

	// Info Modal Seen State
	saveInfoModalSeen: (seen) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_INFO_SEEN, JSON.stringify(seen));
	},

	loadInfoModalSeen: () => {
		if (typeof localStorage === 'undefined') return false;
		const raw = localStorage.getItem(STORAGE_KEY_INFO_SEEN);
		return raw ? JSON.parse(raw) : false;
	},

	// Scan Quota (Rolling 24h Window)
	checkScanQuota: () => {
		if (typeof localStorage === 'undefined')
			return { allowed: true, remaining: MAX_SCANS_PER_DAY, resetTime: null };

		const raw = localStorage.getItem(STORAGE_KEY_LIMIT);
		const now = Date.now();
		let usage = raw ? JSON.parse(raw) : { count: 0, firstScanTime: null };

		// Check if reset needed
		if (usage.firstScanTime && now - usage.firstScanTime > COOLDOWN_MS) {
			usage = { count: 0, firstScanTime: null };
			localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify(usage));
		}

		return {
			allowed: usage.count < MAX_SCANS_PER_DAY,
			remaining: Math.max(0, MAX_SCANS_PER_DAY - usage.count),
			count: usage.count,
			resetTime: usage.firstScanTime ? usage.firstScanTime + COOLDOWN_MS : null
		};
	},

	// Increment usage
	incrementScan: () => {
		if (typeof localStorage === 'undefined') return;

		const raw = localStorage.getItem(STORAGE_KEY_LIMIT);
		const now = Date.now();
		let usage = raw ? JSON.parse(raw) : { count: 0, firstScanTime: null };

		// Reset if needed before incrementing (edge case)
		if (usage.firstScanTime && now - usage.firstScanTime > COOLDOWN_MS) {
			usage = { count: 0, firstScanTime: null };
		}

		if (usage.count < MAX_SCANS_PER_DAY) {
			usage.count += 1;
			if (usage.count === 1) {
				usage.firstScanTime = now;
			}
			localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify(usage));
		}
	}
};
