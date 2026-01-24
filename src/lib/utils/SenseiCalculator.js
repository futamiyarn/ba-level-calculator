import gameData from '$lib/data/game_data.json';

/**
 * Retrieves the experience points required to level up from a specific level.
 * @param {number} lv - The current level.
 * @returns {number} The required EXP amount.
 */
export const getRequiredExp = (lv) => {
	if (lv >= 90) return 0;
	const exp = gameData.exp_table[lv.toString()];
	return exp || 0;
};

/**
 * Calculates the base AP (Stamina) capacity for a given level.
 * @param {number} lv - The current level.
 * @returns {number} The base AP capacity.
 */
export const getBaseAP = (lv) => {
	const level = parseInt(lv) || 1;
	if (level <= 20) {
		return 20 + 4 * level;
	} else {
		return 100 + 2 * (level - 20);
	}
};

/**
 * Returns the experience boost multiplier based on the current level.
 * Newer players get a boost to catch up.
 * @param {number} lv - The current level.
 * @returns {number} The boost multiplier (e.g., 2.0, 1.5).
 */
export const getBoostMultiplier = (lv) => {
	if (lv <= 20) return 2.0;
	if (lv <= 40) return 1.5;
	if (lv <= 50) return 1.25;
	return 1.0;
};

/**
 * Calculates the total daily AP generated based on user configuration and level.
 * Includes natural generation, tasks, bonuses, and refreshes.
 * @param {Object} config - User's AP configuration.
 * @param {number} currentLv - User's current level.
 * @returns {number} Total estimated daily AP.
 */
export const calculateDailyAP = (config, currentLv) => {
	let ap = getBaseAP(currentLv);

	if (config.diaryTask) ap += 150;
	if (config.clubLogin) ap += 10;
	if (config.weeklyTask) ap += 50;
	if (config.loginBonus) ap += 55;
	if (config.freeShop) ap += 10;
	if (config.twoWeekPack) ap += 150;

	// Custom AP Input
	if (config.customAP) ap += parseInt(config.customAP) || 0;

	const cafeAp = gameData.cafe_ap[config.cafeRank] || 0;
	ap += cafeAp;

	ap += config.pvpRefreshes * 90;
	ap += config.pyroRefreshes * 120;

	return Math.floor(ap);
};

/**
 * Estimates the number of days and total EXP needed to reach a target level.
 * Accounts for increasing AP capacity as level increases.
 * @param {number} currentLv - Starting level.
 * @param {number|string} currentExp - Current EXP points in current level.
 * @param {number} targetLv - Desired target level.
 * @param {number} startDailyAP - Initial daily AP at current level.
 * @returns {Object} Object containing estimated days and total EXP needed.
 */
export const calculateDaysToTarget = (currentLv, currentExp, targetLv, startDailyAP) => {
	if (currentLv >= targetLv || startDailyAP <= 0) return { days: 0, expNeeded: 0 };

	let totalDays = 0;
	let totalExpNeeded = 0;

	const initialBaseAP = getBaseAP(currentLv);

	for (let lv = currentLv; lv < targetLv; lv++) {
		let expForThisLevel = getRequiredExp(lv);

		if (lv === currentLv) {
			const cur = currentExp === 'MAX' ? expForThisLevel : parseInt(currentExp || 0);
			expForThisLevel -= cur;
			if (expForThisLevel < 0) expForThisLevel = 0;
		}

		totalExpNeeded += expForThisLevel;

		const currentBaseAP = getBaseAP(lv);
		const apIncrease = currentBaseAP - initialBaseAP;
		const actualDailyAP = startDailyAP + apIncrease;

		const multiplier = getBoostMultiplier(lv);
		const dailyExpGain = actualDailyAP * multiplier;
		const daysForLevel = expForThisLevel / dailyExpGain;

		totalDays += daysForLevel;
	}

	const totalDaysCeil = Math.ceil(totalDays);

	return {
		expNeeded: totalExpNeeded,
		days: totalDaysCeil
	};
};

/**
 * Calculates weekly Expert Permit income.
 * Expert Permits are earned after reaching max level via AP spending and tasks.
 * @param {number} lv - Current level.
 * @param {Object} config - User configuration.
 * @param {number} dailyAP - Daily AP amount.
 * @returns {Object} Detailed breakdown of Expert Permit income.
 */
export const calculateExpertPermit = (lv, config, dailyAP) => {
	const isMaxed = lv >= 90;

	const dailyTaskEP = config.diaryTask ? 120 : 0;
	const weeklyTaskEP = config.weeklyTask ? 300 : 0;
	const totalTaskIncome = dailyTaskEP * 7 + weeklyTaskEP;

	const weeklyAP = dailyAP * 7;
	const conversionCap = 12000;

	let apConversion = 0;
	let wasted = 0;

	if (isMaxed) {
		apConversion = Math.min(weeklyAP, conversionCap);
		if (weeklyAP > conversionCap) wasted = weeklyAP - conversionCap;
	}

	return {
		totalWeekly: totalTaskIncome + apConversion,
		taskOnly: totalTaskIncome,
		apOnly: apConversion,
		apPotential: Math.min(weeklyAP, conversionCap),
		isMaxed,
		wastedAP: wasted
	};
};

/**
 * Calculates total EXP gain per week when utilizing a "hoarding" strategy.
 * Hoarding involves saving certain AP bonuses for double drop/EXP events (usually weekends).
 * @param {Object} config - User configuration.
 * @param {number} dailyAP - Daily AP amount.
 * @param {number} boostMultiplier - Current EXP boost multiplier.
 * @returns {number} Total estimated weekly EXP with hoarding.
 */
export const calculateHoardingExp = (config, dailyAP, boostMultiplier) => {
	// Identify hoardable daily AP components (already included in dailyAP)
	// Club (10), Login (55), WeeklyTask (50 avg)
	const club = config.clubLogin ? 10 : 0;
	const login = config.loginBonus ? 55 : 0;
	const weekly = config.weeklyTask ? 50 : 0;

	const hoardableDaily = club + login + weekly;
	const nonHoardableDaily = dailyAP - hoardableDaily;

	// Weekdays (5 days): Standard Rate
	const weekdayExp = nonHoardableDaily * 5 * boostMultiplier;

	// Weekend (2 days): 2x Event Rate
	// Assumption: 2x applies to the AP spent
	const weekendExp = nonHoardableDaily * 2 * boostMultiplier * 2;

	// Hoarded (7 days accumulated): Dumped on Weekend (2x)
	const hoardedExp = hoardableDaily * 7 * boostMultiplier * 2;

	return Math.floor(weekdayExp + weekendExp + hoardedExp);
};
