<script>
	import { onMount } from 'svelte';

	import InputView from '$lib/components/views/InputView.svelte';
	import ResultView from '$lib/components/views/ResultView.svelte';

	import { config as appConfig } from '$lib/config';
	import { storage } from '$lib/utils/storage';

	// PERBAIKAN IMPORT: Mengarah ke folder utils
	import { analyzeScreenshot } from '$lib/utils/scan_service';

	import {
		getRequiredExp,
		calculateDailyAP,
		calculateDaysToTarget,
		calculateExpertPermit
	} from '$lib/utils/calculator';

	// --- STATE ---
	let viewState = 'input';
	let isLoaded = false;

	// User Data Default
	let userData = { lv: 1, exp_current: 0, exp_max: 8 };
	let targetLv = 90;

	// Default Config
	let userConfig = {
		loginBonus: true,
		cafeRank: 8,
		clubLogin: true,
		diaryTask: true,
		weeklyTask: true,
		freeShop: true,
		pvpRefreshes: 0,
		pyroRefreshes: 0,
		twoWeekPack: false,
		customAP: 0
	};

	// UI State
	let scanQuota = { allowed: true, remaining: 8 };
	let isScanning = false;
	let scanError = null;
	let currentScanImage = null;
	let isVerified = false;

	// --- LIFECYCLE ---
	onMount(() => {
		const savedData = storage.loadUserData();
		if (savedData) userData = savedData;

		const savedConfig = storage.loadUserConfig();
		if (savedConfig) {
			userConfig = { ...userConfig, ...savedConfig };
		}

		// Cek kuota saat load
		scanQuota = storage.checkScanQuota();
		isLoaded = true;
	});

	// Auto-save saat config berubah
	$: if (isLoaded && userConfig) {
		storage.saveUserConfig(userConfig);
	}

	// --- HANDLERS ---
	const onVerified = () => (isVerified = true);

	const onReset = () => {
		viewState = 'input';
		currentScanImage = null;
		scanError = null;
		scanQuota = storage.checkScanQuota();
	};

	const processFinalData = (lv, curExp) => {
		let finalLv = parseInt(lv);
		let finalCur = curExp;
		let finalMax = 0;

		// Logic for Lv 90
		if (finalLv >= 90 || curExp === 'MAX') {
			finalLv = 90;
			finalCur = 'MAX';
			finalMax = 'MAX';
		} else {
			finalMax = getRequiredExp(finalLv);
			if (typeof finalCur === 'number' && finalCur > finalMax) {
				finalCur = finalMax - 1;
			}
		}

		userData = { lv: finalLv, exp_current: finalCur, exp_max: finalMax };

		if (isLoaded) storage.saveUserData(userData);

		viewState = 'result';
	};

	const onManualSubmit = (event) => {
		const { lv, cur } = event.detail;
		const curParsed = cur === '' || cur === null ? 0 : parseInt(cur);
		if (lv > 0) processFinalData(lv, curParsed);
	};

	const onPresetSubmit = () => processFinalData(90, 'MAX');

	const onFileSelected = (event) => {
		currentScanImage = event.detail.base64;
		scanError = null;
	};

	const onResetScanState = () => {
		currentScanImage = null;
		scanError = null;
	};

	// --- IMAGE COMPRESSION HELPER ---
	const compressImage = (base64Str, maxWidth = 1024) => {
		return new Promise((resolve) => {
			const img = new Image();
			img.src = 'data:image/png;base64,' + base64Str;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				let width = img.width;
				let height = img.height;

				if (width > maxWidth) {
					height *= maxWidth / width;
					width = maxWidth;
				}

				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, width, height);
				resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
			};
			img.onerror = () => resolve(base64Str);
		});
	};

	// --- LOGIC UTAMA: REQUEST SCAN ---
	const onRequestScan = async () => {
		if (!currentScanImage) return;

		// 1. Cek Limit via Storage
		const quota = storage.checkScanQuota();
		if (!quota.allowed) {
			scanError = 'Kuota scan mingguan habis (8/8). Gunakan input manual.';
			scanQuota = quota;
			return;
		}

		isScanning = true;
		scanError = null;

		try {
			// 2. Kompresi gambar
			const compressedImage = await compressImage(currentScanImage);

			// 3. Panggil Service Baru
			const result = await analyzeScreenshot(compressedImage);

			// 4. Validasi Hasil
			if (!result.valid) {
				throw new Error(result.message || 'Gambar tidak valid/level tidak terbaca.');
			}

			// 5. Sukses: Increment Quota
			storage.incrementScan();
			scanQuota = storage.checkScanQuota();

			// 6. Proses Data
			processFinalData(result.lv, result.exp_current);
		} catch (err) {
			console.error(err);
			scanError = err.message || 'Gagal memproses gambar. Coba input manual.';
		} finally {
			isScanning = false;
		}
	};

	// --- REACTIVE CALCULATIONS ---
	$: dailyAP = calculateDailyAP(userConfig, userData.lv);
	$: calculations = calculateDaysToTarget(userData.lv, userData.exp_current, targetLv, dailyAP);
	$: permitData = calculateExpertPermit(userData.lv, userConfig, dailyAP);
</script>

{#if viewState === 'input'}
	<InputView
		{scanQuota}
		{isScanning}
		{scanError}
		{isVerified}
		on:verified={onVerified}
		on:fileSelected={onFileSelected}
		on:requestScan={onRequestScan}
		on:submitManual={onManualSubmit}
		on:submitPreset={onPresetSubmit}
		on:resetScanState={onResetScanState}
	/>
{:else if viewState === 'result'}
	<ResultView
		{userData}
		{dailyAP}
		{calculations}
		{permitData}
		bind:targetLv
		bind:config={userConfig}
		on:reset={onReset}
	/>
{/if}
