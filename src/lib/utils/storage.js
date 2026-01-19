// Key untuk localStorage
const STORAGE_KEY_DATA = 'ba_planner_data';
const STORAGE_KEY_CONFIG = 'ba_planner_config';
const STORAGE_KEY_LIMIT = 'ba_scan_usage_v2'; // Ganti key biar fresh reset

// Durasi satu minggu dalam milidetik (7 hari)
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SCANS = 8; // Limit per minggu

export const storage = {
	// --- USER DATA ---
	saveUserData: (data) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
	},

	loadUserData: () => {
		if (typeof localStorage === 'undefined') return null;
		const raw = localStorage.getItem(STORAGE_KEY_DATA);
		return raw ? JSON.parse(raw) : null;
	},

	// --- CONFIG DATA ---
	saveUserConfig: (config) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
	},

	loadUserConfig: () => {
		if (typeof localStorage === 'undefined') return null;
		const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
		return raw ? JSON.parse(raw) : null;
	},

	// --- SCAN QUOTA (Logika Limit) ---
	checkScanQuota: () => {
		if (typeof localStorage === 'undefined') return { allowed: false, remaining: 0 };

		const raw = localStorage.getItem(STORAGE_KEY_LIMIT);
		const now = Date.now();
		let usage = raw ? JSON.parse(raw) : { count: 0, weekStart: now };

		// Cek apakah sudah lewat 1 minggu dari `weekStart`
		if (now - usage.weekStart > WEEK_MS) {
			// Reset limit
			usage = { count: 0, weekStart: now };
			localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify(usage));
		}

		return {
			allowed: usage.count < MAX_SCANS,
			remaining: Math.max(0, MAX_SCANS - usage.count),
			count: usage.count,
			resetDate: new Date(usage.weekStart + WEEK_MS) // Info kapan reset (opsional)
		};
	},

	// Fungsi untuk menambah counter HANYA jika scan sukses
	incrementScan: () => {
		if (typeof localStorage === 'undefined') return;

		const raw = localStorage.getItem(STORAGE_KEY_LIMIT);
		let usage = raw ? JSON.parse(raw) : { count: 0, weekStart: Date.now() };

		if (usage.count < MAX_SCANS) {
			usage.count += 1;
			localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify(usage));
		}
	}
};
