import giftData from '../../lib/data/gift.json';

/**
 * Server-side load function for the relationship planner page.
 * It prepares the student data and gift mappings required for the UI.
 */
export async function load() {
	try {
		// Initialize gift data mapping
		// Handle potential default export structure in Vite for JSON files
		const items = giftData.items || (giftData.default && giftData.default.items) || [];
		const giftMap = new Map(items.map((g) => [g.id, g]));

		// Load local students from src/lib/data/students using Vite's glob import
		// This allows us to keep student data modular and easily updatable
		const localStudentFiles = import.meta.glob('../../lib/data/students/**/*.json', {
			eager: true
		});
		let localStudents = [];

		const paths = Object.keys(localStudentFiles);

		// Combine all student data from different batch files
		for (const path of paths) {
			const mod = localStudentFiles[path];
			const data = mod.default || mod;
			if (Array.isArray(data)) {
				localStudents = localStudents.concat(data);
			}
		}

		// Process students to enrich them with gift preferences and icons
		localStudents = localStudents.map((student) => {
			const processedGifts = [];
			const seenGifts = new Set();

			/**
			 * Helper to attach gift details and determine appropriate emoticons
			 * @param {number|string} id - Gift ID
			 * @param {string} type - Preference type ('love' or 'liked')
			 */
			const addGift = (id, type) => {
				if (seenGifts.has(id)) return;
				const gift = giftMap.get(id);
				if (!gift) return;

				let emoticon = 'smile';
				if (type === 'love') {
					if (gift.rarity === 'epic') emoticon = 'heart_eyes';
					else if (gift.rarity === 'rare') emoticon = 'xd';
				} else if (type === 'liked') {
					if (gift.rarity === 'epic') emoticon = 'xd';
					else if (gift.rarity === 'rare') emoticon = 'open_smile';
				}

				processedGifts.push({
					...gift,
					type,
					emoticon
				});
				seenGifts.add(id);
			};

			// Process both 'love' and 'liked' categories
			if (student.item?.love) {
				student.item.love.forEach((id) => addGift(id, 'love'));
			}
			if (student.item?.liked) {
				student.item.liked.forEach((id) => addGift(id, 'liked'));
			}

			// Sort gifts by their "power" (emoticon rank) for better visual presentation
			const rank = { heart_eyes: 3, xd: 2, open_smile: 1, smile: 0 };
			processedGifts.sort((a, b) => rank[b.emoticon] - rank[a.emoticon]);

			return {
				...student,
				processedGifts
			};
		});

		// Standardize student sorting by ID (Ascending - Starting from 1)
		localStudents.sort((a, b) => (a.id || 0) - (b.id || 0));

		// Identify the 10 most recently added students for quick access
		const newestStudents = [...localStudents]
			.sort((a, b) => (b.id || 0) - (a.id || 0))
			.slice(0, 10);

		return {
			newestStudents,
			localStudents,
			allGifts: items
		};
	} catch (error) {
		console.error('Failed to load local students:', error);
		return {
			newestStudents: [],
			localStudents: []
		};
	}
}
