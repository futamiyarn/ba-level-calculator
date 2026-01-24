import studentExpData from '$lib/data/student_exp.json';

// Transform the array into a map for easier lookup: level -> experience needed to reach next level
const expMap = {};
studentExpData.forEach((entry) => {
	expMap[entry.level] = entry.experience;
});

/**
 * Contains EXP values for each type of activity report.
 * Official names: Superior (Pink), Advanced (Orange), Normal (Blue), Novice (Gray).
 * Gray: 50, Blue: 500, Orange: 2000, Pink: 10000
 */
export const reportExp = {
	superior: 10000,
	advanced: 2000,
	normal: 500,
	novice: 50
};

/**
 * Calculates the total EXP required to level up from a current level to a target level,
 * accounting for experience already gained in the current level.
 * @param {number} currentLevel - The starting level.
 * @param {number} targetLevel - The desired level.
 * @param {number} [currentExp=0] - EXP already gained in the current level.
 * @returns {number} The total amount of EXP required.
 */
export function calculateTotalExpNeeded(currentLevel, targetLevel, currentExp = 0) {
	const start = parseInt(currentLevel);
	const end = parseInt(targetLevel);
	const startExp = parseInt(currentExp) || 0;

	if (isNaN(start) || isNaN(end) || start >= end) {
		return 0;
	}

	let totalExp = 0;
	// Loop from current level up to target-1
	// The EXP value at level L is the EXP needed to reach L+1
	for (let i = start; i < end; i++) {
		totalExp += expMap[i] || 0;
	}

	// Subtract the EXP already gained in the current level
	totalExp -= startExp;

	return Math.max(0, totalExp);
}

/**
 * Calculates the total credits needed to level up from a current level to a target level.
 * Cost is estimated as 7 credits per 1 EXP.
 * @param {number} currentLevel - The starting level.
 * @param {number} targetLevel - The desired level.
 * @param {number} [currentExp=0] - EXP already gained in the current level.
 * @returns {number} The total amount of credits required.
 */
export function calculateTotalCreditNeeded(currentLevel, targetLevel, currentExp = 0) {
	const totalExp = calculateTotalExpNeeded(currentLevel, targetLevel, currentExp);
	return totalExp * 7;
}

/**
 * Calculates the total EXP provided by a set of activity reports.
 * @param {object} reports - An object containing the count for each report type.
 */
export function calculateExpFromReports(reports) {
	const { superior, advanced, normal, novice } = reports;
	return (
		(superior || 0) * reportExp.superior +
		(advanced || 0) * reportExp.advanced +
		(normal || 0) * reportExp.normal +
		(novice || 0) * reportExp.novice
	);
}

/**
 * Calculates the optimal number of reports needed to reach a target EXP amount.
 * It prioritizes using the largest reports first (Superior > Advanced > Normal > Novice).
 *
 * @param {number} expNeeded - The total experience points required.
 * @param {string} [maxTier='superior'] - The highest tier report to consider.
 * @returns {object} An object containing the count for each report type.
 */
export function calculateOptimalReports(expNeeded, maxTier = 'superior') {
	let remainingExp = Math.max(0, expNeeded);
	const optimal = {
		superior: 0,
		advanced: 0,
		normal: 0,
		novice: 0
	};

	if (remainingExp <= 0) return optimal;

	// Calculate Superior reports
	if (maxTier === 'superior') {
		optimal.superior = Math.floor(remainingExp / reportExp.superior);
		remainingExp %= reportExp.superior;
	}

	// Calculate Advanced reports
	if (maxTier === 'superior' || maxTier === 'advanced') {
		optimal.advanced = Math.floor(remainingExp / reportExp.advanced);
		remainingExp %= reportExp.advanced;
	}

	// Calculate Normal reports
	if (maxTier === 'superior' || maxTier === 'advanced' || maxTier === 'normal') {
		optimal.normal = Math.floor(remainingExp / reportExp.normal);
		remainingExp %= reportExp.normal;
	}

	// Calculate Novice reports
	optimal.novice = Math.ceil(remainingExp / reportExp.novice);

	return optimal;
}

/**
 * Retrieves the experience points required to level up from the current level to the next.
 * @param {number} currentLevel - The current level.
 * @returns {number} The required EXP amount to reach the next level.
 */
export function getNextLevelExp(currentLevel) {
	const level = parseInt(currentLevel);
	if (isNaN(level) || level >= 90) return 0;
	return expMap[level] || 0;
}
