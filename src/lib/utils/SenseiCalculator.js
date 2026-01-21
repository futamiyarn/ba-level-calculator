import gameData from '$lib/data/game_data.json';

// Get Required EXP
export const getRequiredExp = (lv) => {
	if (lv >= 90) return 0;
	const exp = gameData.exp_table[lv.toString()];
	return exp || 0;
};

// Get Base AP
export const getBaseAP = (lv) => {
	const level = parseInt(lv) || 1;
	if (level <= 20) {
		return 20 + 4 * level;
	} else {
		return 100 + 2 * (level - 20);
	}
};

// Get Boost Multiplier
export const getBoostMultiplier = (lv) => {
	if (lv <= 20) return 2.0;
	if (lv <= 40) return 1.5;
	if (lv <= 50) return 1.25;
	return 1.0;
};

// Calculate Daily AP
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

// Calculate Days to Target
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

	return {
		expNeeded: totalExpNeeded,
		days: Math.ceil(totalDays)
	};
};

// Calculate Expert Permit
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

// Calculate Hoarding Strategy EXP (Weekly + 2x Weekend)
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
