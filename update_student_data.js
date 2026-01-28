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
if (!fs.existsSync(GIFT_FILE)) {
	console.error(`GIFT_FILE not found at ${GIFT_FILE}`);
	process.exit(1);
}
const giftData = JSON.parse(fs.readFileSync(GIFT_FILE, 'utf-8'));
const giftMap = new Map();
const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

giftData.items.forEach((g) => {
	giftMap.set(normalize(g.name), g.id);
	if (g.alias && Array.isArray(g.alias)) {
		g.alias.forEach((a) => giftMap.set(normalize(a), g.id));
	}
});

function getGiftId(name) {
	if (!name) return null;
	if (typeof name === 'number') return name;
	const norm = normalize(name);
	return giftMap.get(norm) || null;
}

// --- NORMALIZATION ---
/**
 * Normalizes school names to match folder structure.
 * Handles typos like "milenimilenium" or variations.
 */
function normalizeSchoolName(name) {
	if (!name) return 'Unknown';
	const fixes = {
		milenimilenium: 'Millennium',
		millenium: 'Millennium',
		'millennium science school': 'Millennium'
	};
	const norm = name.trim();
	return fixes[norm.toLowerCase()] || norm;
}

/**
 * Maps game names to wiki-friendly names and normalizes suffixes.
 */
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

	try {
		const { data } = await axios.get(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		});
		return data;
	} catch (e) {
		console.error(`    [Error] Wiki Fetch Error for ${studentName}: ${e.message}`);
		return null;
	}
}

// --- DATA EXTRACTION ---
function extractStudentData(html, studentName) {
	const $ = cheerio.load(html);
	const data = {
		memorial_lobby_unlock_level: null,
		gifts: { loved: [], liked: [] }
	};

	// Gifts extraction
	const giftHeader = $('#Gifts');
	if (giftHeader.length) {
		let container = giftHeader.parent().hasClass('mw-heading') ? giftHeader.parent() : giftHeader;
		let current = container.next();
		let currentMode = null;

		while (current.length && !current.is('h1, h2, h3, .mw-heading')) {
			const text = current.text().toLowerCase();
			if (text.includes('favorite') || text.includes('love')) currentMode = 'loved';
			else if (text.includes('like')) currentMode = 'liked';

			if (currentMode) {
				current.find('.character-gift').each((_, el) => {
					const name = $(el).find('a').last().text().trim() || $(el).text().trim();
					if (name) data.gifts[currentMode].push(name);
				});
			}
			current = current.next();
		}
	}

	// Memorial Lobby extraction
	const memorialIcon = $('img[src*="Icon_memorial_lobby"]');
	if (memorialIcon.length) {
		const levelContainer = memorialIcon.closest('[data-level]');
		if (levelContainer.length) {
			data.memorial_lobby_unlock_level = parseInt(levelContainer.attr('data-level'), 10);
		} else {
			const text = memorialIcon.closest('tr, div, p').text();
			const match = text.match(/(?:Rank|Lvl|Level)?\s*(\d+)(?::)?/i);
			if (match) data.memorial_lobby_unlock_level = parseInt(match[1], 10);
		}
	}

	return data;
}

function processGifts(studentName, giftNames, type) {
	const ids = [];
	for (const name of giftNames) {
		const id = getGiftId(name);
		if (!id) {
			console.error(`\n[CRITICAL] Unknown Gift (${type}) for ${studentName}: "${name}"`);
			process.exit(1);
		}
		ids.push(id);
	}
	return ids;
}

// --- MAIN ---
async function run() {
	console.log('--- Blue Archive Student Data Sync ---');

	// 1. Scan Existing Files to build a global ID set
	console.log('Scanning existing student data...');
	const existingIds = new Set();
	if (fs.existsSync(OUTPUT_DIR)) {
		const schools = fs.readdirSync(OUTPUT_DIR);
		for (const school of schools) {
			const schoolDir = path.join(OUTPUT_DIR, school);
			if (!fs.lstatSync(schoolDir).isDirectory()) continue;
			const files = fs.readdirSync(schoolDir).filter((f) => f.endsWith('.json'));
			for (const f of files) {
				try {
					const data = JSON.parse(fs.readFileSync(path.join(schoolDir, f), 'utf-8'));
					if (Array.isArray(data)) {
						data.forEach((s) => existingIds.add(Number(s.id)));
					}
				} catch (e) {
					console.error(`  [Error] Failed to read ${f}: ${e.message}`);
				}
			}
		}
	}
	console.log(`Found ${existingIds.size} students in local files.`);

	// 2. Fetch from MCP
	console.log('Fetching student list from MCP...');
	const allStudentsFromApi = await client.getStudents({ language: 'en', limit: 1000 });
	console.log(`API returned ${allStudentsFromApi.length} students.`);

	// 3. Filter New Students
	const collabNames = ['Hatsune Miku', 'Misaka Mikoto', 'Shokuhou Misaki', 'Saten Ruiko'];
	const collabSchools = ['Tokiwadai', 'Sakugawa', 'ETC'];

	const newStudents = allStudentsFromApi.filter((s) => {
		if (s.Id === 10099) return false; // Skip duplicate Hoshino (Armed)
		return !existingIds.has(Number(s.Id));
	});

	if (newStudents.length === 0) {
		console.log('No new students found in the API.');
		console.log('All local data is up to date.');
		return;
	}

	console.log(`Found ${newStudents.length} new students!`);

	// 4. Group by School
	const studentsBySchool = {};
	for (const s of newStudents) {
		let school = normalizeSchoolName(s.School);
		// Remap collab students to a single folder
		if (collabSchools.includes(school) || collabNames.some((cn) => s.Name.includes(cn))) {
			school = 'Collab';
		}
		if (!studentsBySchool[school]) studentsBySchool[school] = [];
		studentsBySchool[school].push(s);
	}

	// 5. Process and Save
	for (const school of Object.keys(studentsBySchool)) {
		console.log(`\nProcessing school: ${school}`);
		const schoolDir = path.join(OUTPUT_DIR, school);
		if (!fs.existsSync(schoolDir)) fs.mkdirSync(schoolDir, { recursive: true });

		// Find the last batch file to resume or create a new one
		const schoolFiles = fs
			.readdirSync(schoolDir)
			.filter((f) => f.match(/^batch_(\d+)\.json$/))
			.sort((a, b) => parseInt(a.match(/(\d+)/)[1]) - parseInt(b.match(/(\d+)/)[1]));

		let currentChunk = [];
		let chunkIndex = 1;

		if (schoolFiles.length > 0) {
			const lastFile = schoolFiles[schoolFiles.length - 1];
			chunkIndex = parseInt(lastFile.match(/(\d+)/)[1]);
			currentChunk = JSON.parse(fs.readFileSync(path.join(schoolDir, lastFile), 'utf-8'));
			if (currentChunk.length >= 50) {
				currentChunk = [];
				chunkIndex++;
			}
		}

		for (const s of studentsBySchool[school]) {
			console.log(`  [${s.Id}] ${s.Name}`);
			const html = await fetchWikiContent(s.Name);
			if (!html) {
				console.log(`    Skipping: Wiki content not found.`);
				continue;
			}

			await delay(1000); // Be kind to the wiki

			extracted = extractStudentData(html, s.Name);
			const finalObj = {
				id: s.Id,
				name: s.Name,
				school: s.School,
				rarity: s.StarGrade,
				live2d_lvl: extracted.memorial_lobby_unlock_level,
				item: {
					love: processGifts(s.Name, extracted.gifts.loved, 'Love'),
					liked: processGifts(s.Name, extracted.gifts.liked, 'Liked')
				}
			};

			currentChunk.push(finalObj);
			const filename = path.join(schoolDir, `batch_${chunkIndex}.json`);
			fs.writeFileSync(filename, JSON.stringify(currentChunk, null, 2));

			if (currentChunk.length >= 50) {
				console.log(`    Batch ${chunkIndex} complete. Creating next batch...`);
				currentChunk = [];
				chunkIndex++;
			}
		}
	}

	console.log('\nAll data updated successfully!');
}

run();
