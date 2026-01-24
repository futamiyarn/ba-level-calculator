import relationshipData from '$lib/data/relationship_data.json';

/**
 * Calculates the total Relationship EXP needed to go from currentLevel to targetLevel.
 * @param {number} currentLevel - The current relationship rank (1-100).
 * @param {number} targetLevel - The target relationship rank (1-100).
 * @param {number} currentExpProgress - EXP already gained towards the next level (optional, default 0).
 * @returns {number} Total EXP needed.
 */
export const calculateRelationshipExpNeeded = (
	currentLevel,
	targetLevel,
	currentExpProgress = 0
) => {
	if (currentLevel >= targetLevel) return 0;

	let totalExp = 0;

	// Sum up EXP needed for each level from current to target - 1
	for (let i = currentLevel; i < targetLevel; i++) {
		const levelData = relationshipData.find((d) => d.level === i);
		if (levelData) {
			totalExp += levelData.exp_next;
		}
	}

	// Subtract progress already made
	return Math.max(0, totalExp - currentExpProgress);
};

/**
 * Calculates the resulting rank and remaining/wasted EXP given a starting level and added EXP.
 * @param {number} startLevel - The current relationship rank (1-99).
 * @param {number} addedExp - The amount of EXP being added.
 * @returns {{ finalRank: number, leftoverExp: number }} The resulting rank and remaining EXP.
 */
export const calculateRankAfterExp = (startLevel, addedExp) => {
	let currentLevel = startLevel;
	let remaining = addedExp;

	// Max level is typically 100 in Blue Archive
	const MAX_LEVEL = 100;

	while (currentLevel < MAX_LEVEL) {
		const levelData = relationshipData.find((d) => d.level === currentLevel);
		if (!levelData) break;

		if (remaining >= levelData.exp_next) {
			remaining -= levelData.exp_next;
			currentLevel++;
		} else {
			break;
		}
	}

	return { finalRank: currentLevel, leftoverExp: remaining };
};

/**
 * Constants for Gift EXP values.
 */
export const GiftExp = {
	RARE_STANDARD: 20,
	RARE_LIKED: 40,
	RARE_LOVED: 60,
	EPIC_STANDARD: 120,
	EPIC_LIKED: 180,
	EPIC_LOVED: 240
};
