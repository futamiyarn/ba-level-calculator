// Constants
const STORAGE_KEY_DATA = 'ba_planner_data';
const STORAGE_KEY_CONFIG = 'ba_planner_config';
const STORAGE_KEY_FILTERS = 'ba_student_list_filters';
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

	// Student List Filters
	saveStudentFilters: (filters) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
	},

	loadStudentFilters: () => {
		if (typeof localStorage === 'undefined') return null;
		const raw = localStorage.getItem(STORAGE_KEY_FILTERS);
		return raw ? JSON.parse(raw) : null;
	},

	// Relationship Calculator Filters
	saveRelationshipFilters: (filters) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem('ba_relationship_filters', JSON.stringify(filters));
	},

	loadRelationshipFilters: () => {
		if (typeof localStorage === 'undefined') return null;
		const raw = localStorage.getItem('ba_relationship_filters');
		return raw ? JSON.parse(raw) : null;
	},

	// Selected Student Persistence
	saveSelectedStudent: (studentId) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem('ba_selected_student', JSON.stringify(studentId));
	},

	loadSelectedStudent: () => {
		if (typeof localStorage === 'undefined') return null;
		const raw = localStorage.getItem('ba_selected_student');
		return raw ? JSON.parse(raw) : null;
	},

	// Pinned Students
	savePinnedStudents: (pinnedIds) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem('ba_pinned_students', JSON.stringify(pinnedIds));
	},

	loadPinnedStudents: () => {
		if (typeof localStorage === 'undefined') return [];
		const raw = localStorage.getItem('ba_pinned_students');
		return raw ? JSON.parse(raw) : [];
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
