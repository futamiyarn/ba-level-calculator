import gameData from '$lib/data/game_data.json';

// Helper: Get Required EXP to reach the next level
export const getRequiredExp = (lv) => {
	if (lv >= 90) return 0;
	const exp = gameData.exp_table[lv.toString()];
	return exp || 0;
};

// Helper: Calculate Base AP (Regen/Cap) based on Level
export const getBaseAP = (lv) => {
	const level = parseInt(lv) || 1;
	if (level <= 20) {
		return 20 + 4 * level;
	} else {
		return 100 + 2 * (level - 20);
	}
};

// Helper: Get EXP Boost Multiplier based on Level
export const getBoostMultiplier = (lv) => {
	if (lv <= 20) return 2.0;
	if (lv <= 40) return 1.5;
	if (lv <= 50) return 1.25;
	return 1.0;
};

// Calculate Total Daily AP based on Config
export const calculateDailyAP = (config, currentLv) => {
	let ap = getBaseAP(currentLv);

	if (config.diaryTask) ap += 150;
	if (config.clubLogin) ap += 10;
	if (config.weeklyTask) ap += 50;
	if (config.loginBonus) ap += 55;
	if (config.freeShop) ap += 10;
	if (config.twoWeekPack) ap += 150;

	// Custom AP Input (Input manual user)
	if (config.customAP) ap += parseInt(config.customAP) || 0;

	const cafeAp = gameData.cafe_ap[config.cafeRank] || 0;
	ap += cafeAp;

	ap += config.pvpRefreshes * 90;
	ap += config.pyroRefreshes * 120;

	return Math.floor(ap);
};

// Calculate Estimated Days to Target (ACCURATE SIMULATION)
export const calculateDaysToTarget = (currentLv, currentExp, targetLv, startDailyAP) => {
	if (currentLv >= targetLv || startDailyAP <= 0) return { days: 0, expNeeded: 0 };

	let totalDays = 0;
	let totalExpNeeded = 0;

	// Simpan Base AP awal untuk menghitung selisih kenaikan AP saat level naik
	const initialBaseAP = getBaseAP(currentLv);

	// Loop level-by-level dari level sekarang sampai target
	for (let lv = currentLv; lv < targetLv; lv++) {
		// 1. Tentukan EXP yang dibutuhkan untuk level ini
		let expForThisLevel = getRequiredExp(lv);

		// Jika ini level pertama, kurangi dengan EXP yang sudah dimiliki saat ini
		if (lv === currentLv) {
			const cur = currentExp === 'MAX' ? expForThisLevel : parseInt(currentExp || 0);
			expForThisLevel -= cur;
			// Pastikan tidak negatif (jika user input exp > max)
			if (expForThisLevel < 0) expForThisLevel = 0;
		}

		totalExpNeeded += expForThisLevel;

		// 2. Hitung Daily AP yang AKTUAL untuk level ini
		// (AP Konfig Awal + Kenaikan Natural Regen karena level naik)
		const currentBaseAP = getBaseAP(lv);
		const apIncrease = currentBaseAP - initialBaseAP;
		const actualDailyAP = startDailyAP + apIncrease;

		// 3. Tentukan Multiplier EXP untuk level ini (Berhenti di Lv 51)
		const multiplier = getBoostMultiplier(lv);

		// 4. Hitung EXP harian efektif (AP * Multiplier)
		const dailyExpGain = actualDailyAP * multiplier;

		// 5. Hitung berapa hari yang dibutuhkan untuk menyelesaikan level INI SAJA
		// Kita biarkan desimal agar presisi, nanti dibulatkan di akhir total
		const daysForLevel = expForThisLevel / dailyExpGain;

		totalDays += daysForLevel;
	}

	return {
		expNeeded: totalExpNeeded,
		days: Math.ceil(totalDays) // Bulatkan ke atas total hari
	};
};

// Calculate Expert Permit Income
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
