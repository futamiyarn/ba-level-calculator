import { SchaleDBClient } from 'blue-archive-mcp';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';

// --- CONFIGURATION ---
const client = new SchaleDBClient();
const OUTPUT_DIR = path.join(process.cwd(), 'src/lib/data/students');
const GIFT_FILE = path.join(process.cwd(), 'src/lib/data/gift.json');

// --- GIFT MAPPING SETUP ---
const giftData = JSON.parse(fs.readFileSync(GIFT_FILE, 'utf-8'));
const giftMap = new Map();

// Helper: Normalize strings for key lookup
const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

// Populate map with primary names and aliases -> ID
giftData.items.forEach((g) => {
	giftMap.set(normalize(g.name), g.id);
	if (g.alias && Array.isArray(g.alias)) {
		g.alias.forEach((a) => giftMap.set(normalize(a), g.id));
	}
});

function getGiftId(name) {
	if (!name) return null;
	const norm = normalize(name);
	return giftMap.get(norm) || null;
}

// --- STUDENT NAME NORMALIZATION ---
function normalizeWikiName(text) {
	const typeMapping = {
		track: 'Sportswear',
		gym: 'Sportswear',
		riding: 'Riding',
		cycling: 'Riding',
		'cheer squad': 'Cheerleader',
		small: 'Kid',
		young: 'Kid',
		'pop idol': 'Idol',
		battle: 'Battle',
		armed: 'Battle',
		tactical: 'Battle',
		bunny: 'Bunny Girl',
		camp: 'Camping',
		pajamas: 'Pajama',
		school: 'School Uniform',
		uniform: 'School Uniform',
		'hot spring': 'Hot Spring',
		'new year': 'New Year',
		christmas: 'Christmas',
		maid: 'Maid',
		band: 'Band',
		casual: 'Casual',
		dress: 'Dress',
		'part-timer': 'Part-Timer',
		guide: 'Guide',
		swimsuit: 'Swimsuit'
	};

	const nameFix = { yukka: 'Yuuka' };
	const pattern = /(.+?)\s*\((.+?)\)/gi;

	if (!text.includes('(')) {
		const cleanName = text.trim();
		return nameFix[cleanName.toLowerCase()] || cleanName;
	}

	return text.replace(pattern, (match, charName, altType) => {
		const cleanName = charName.trim();
		const fixedName = nameFix[cleanName.toLowerCase()] || cleanName;
		const cleanType = altType.trim().toLowerCase();

		if (typeMapping[cleanType]) {
			return `${fixedName} (${typeMapping[cleanType]})`;
		}
		const formattedType = cleanType.charAt(0).toUpperCase() + cleanType.slice(1);
		return `${fixedName} (${formattedType})`;
	});
}

// --- WIKI FETCHING ---
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWikiContent(studentName) {
	const wikiName = normalizeWikiName(studentName).replace(/\s+/g, '_');
	const url = `https://bluearchive.wiki/wiki/${wikiName}`;
	console.log(`  Fetching Wiki: ${url}`);

	try {
		const { data } = await axios.get(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		});
		return data;
	} catch (e) {
		console.error(`  [Error] Wiki Fetch Error: ${e.message}`);
		return null;
	}
}

// --- CHEERIO EXTRACTION ---
function extractStudentData(html, studentName) {
	const $ = cheerio.load(html);
	const data = {
		memorial_lobby_unlock_level: null,
		gifts: { loved: [], liked: [] }
	};

	// 1. Extract Gifts
	const giftHeader = $('#Gifts');
	if (giftHeader.length) {
		let container = giftHeader.parent().hasClass('mw-heading') ? giftHeader.parent() : giftHeader;
		let current = container.next();
		let currentMode = null; // 'loved' | 'liked'

		while (current.length && !current.is('h1, h2, h3, .mw-heading')) {
			const text = current.text().toLowerCase();

			if (text.includes('favorite') || text.includes('love')) {
				currentMode = 'loved';
			} else if (text.includes('like')) {
				currentMode = 'liked';
			}

			if (currentMode) {
				const gifts = current.find('.character-gift');
				gifts.each((_, el) => {
					const name = $(el).find('a').last().text().trim() || $(el).text().trim();
					if (name) {
						data.gifts[currentMode].push(name);
					}
				});
			}

			current = current.next();
		}
	}

	// 2. Extract Memorial Lobby
	const memorialIcon = $('img[src*="Icon_memorial_lobby"]');
	if (memorialIcon.length) {
		const levelContainer = memorialIcon.closest('[data-level]');
		if (levelContainer.length) {
			data.memorial_lobby_unlock_level = parseInt(levelContainer.attr('data-level'), 10);
		} else {
			let container = memorialIcon.closest('tr');
			if (!container.length) container = memorialIcon.closest('div, p');

			const text = container.text();
			const match = text.match(/(?:Rank|Lvl|Level)?\s*(\d+)(?::)?/i);
			if (match) {
				data.memorial_lobby_unlock_level = parseInt(match[1], 10);
			}
		}
	}

	return data;
}

// --- HELPER: CONVERT GIFTS ---
function processGifts(studentName, giftNames, type) {
	const ids = [];
	for (const name of giftNames) {
		if (typeof name === 'number') {
			ids.push(name); // Already an ID
			continue;
		}
		const id = getGiftId(name);
		if (!id) {
			console.error(`\n[CRITICAL] Unknown Gift (${type}) for ${studentName}: "${name}"`);
			console.error('Please update src/lib/data/gift.json with this alias or name.');
			process.exit(1);
		}
		ids.push(id);
	}
	return ids;
}

// --- MAIN PROCESS ---
async function run() {
	console.log('Fetching student list from MCP...');
	const students = await client.getStudents({ language: 'en', limit: 1000 });

	// Group students by school
	const studentsBySchool = {};
	const collabNames = ['Hatsune Miku', 'Misaka Mikoto', 'Shokuhou Misaki', 'Saten Ruiko'];

	for (const s of students) {
		// Skip duplicate Hoshino (Armed)
		if (s.Id === 10099) continue;

		let school = s.School || 'Unknown';
		if (collabNames.includes(s.Name)) {
			school = 'Collab';
		}

		if (!studentsBySchool[school]) studentsBySchool[school] = [];
		studentsBySchool[school].push(s);
	}

	for (const school of Object.keys(studentsBySchool)) {
		console.log(`\n=== Processing School: ${school} ===`);
		const schoolDir = path.join(OUTPUT_DIR, school);
		if (!fs.existsSync(schoolDir)) fs.mkdirSync(schoolDir, { recursive: true });

		const processedIds = new Set();
		let currentChunk = [];
		let chunkIndex = 1;

		// 1. PROCESS EXISTING FILES (Validation & Conversion)
		if (fs.existsSync(schoolDir)) {
			const files = fs
				.readdirSync(schoolDir)
				.filter((f) => f.match(/^batch_(\d+)\.json$/))
				.sort((a, b) => {
					const numA = parseInt(a.match(/(\d+)/)[1]);
					const numB = parseInt(b.match(/(\d+)/)[1]);
					return numA - numB;
				});

			for (const f of files) {
				try {
					const filePath = path.join(schoolDir, f);
					let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
					let modified = false;

					if (Array.isArray(data)) {
						data = data.map((student) => {
							processedIds.add(Number(student.id));

							// Convert Gifts to IDs
							const loveIds = processGifts(student.name, student.item.love || [], 'Love');
							const likedIds = processGifts(student.name, student.item.liked || [], 'Liked');

							// Check if modification needed (compare processed vs original)
							if (
								JSON.stringify(loveIds) !== JSON.stringify(student.item.love) ||
								JSON.stringify(likedIds) !== JSON.stringify(student.item.liked)
							) {
								modified = true;
								student.item.love = loveIds;
								student.item.liked = likedIds;
							}
							return student;
						});

						if (modified) {
							console.log(`  [Update] Converting gifts to IDs in ${f}`);
							fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
						}

						// Resume logic
						if (f === files[files.length - 1]) {
							if (data.length < 50) {
								currentChunk = data;
								chunkIndex = parseInt(f.match(/(\d+)/)[1]);
								console.log(`  [Resuming] Batch ${chunkIndex} with ${currentChunk.length} items.`);
							} else {
								chunkIndex = parseInt(f.match(/(\d+)/)[1]) + 1;
							}
						}
					}
				} catch (e) {
					console.error(`  [Error] Reading ${f}: ${e.message}`);
				}
			}
		}

		const schoolStudents = studentsBySchool[school];

		// 2. FETCH MISSING STUDENTS
		for (let i = 0; i < schoolStudents.length; i++) {
			const student = schoolStudents[i];

			if (processedIds.has(Number(student.Id))) {
				continue;
			}

			console.log(`[${i + 1}/${schoolStudents.length}] ${student.Name}`);

			const html = await fetchWikiContent(student.Name);
			if (!html) continue;

			await delay(1000); // Politeness delay

			const extractedData = extractStudentData(html, student.Name);

			// Convert & Validate immediately
			const loveIds = processGifts(student.Name, extractedData.gifts.loved || [], 'Love');
			const likedIds = processGifts(student.Name, extractedData.gifts.liked || [], 'Liked');

			const finalObj = {
				id: student.Id,
				name: student.Name,
				school: student.School,
				rarity: student.StarGrade,
				live2d_lvl: extractedData.memorial_lobby_unlock_level,
				item: {
					love: loveIds,
					liked: likedIds
				}
			};

			console.log(
				`  > Live2D: ${finalObj.live2d_lvl} | Loved: [${loveIds.length}] | Liked: [${likedIds.length}]`
			);
			currentChunk.push(finalObj);

			const filename = path.join(schoolDir, `batch_${chunkIndex}.json`);
			fs.writeFileSync(filename, JSON.stringify(currentChunk, null, 2));

			if (currentChunk.length >= 50) {
				console.log(`  [Batch Complete] ${filename}`);
				currentChunk = [];
				chunkIndex++;
			}
		}
	}
	console.log('\nAll Done!');
}

run();
