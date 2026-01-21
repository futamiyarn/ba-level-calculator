<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Coffee } from 'lucide-svelte';

	import EditLevelModal from '$lib/components/views/sensei/SenseiEditLevelModal.svelte';
	import GeneralConfig from '$lib/components/views/sensei/SenseiGeneralConfig.svelte';
	import ShopConfig from '$lib/components/views/sensei/SenseiShopConfig.svelte';
	import PaidConfig from '$lib/components/views/sensei/SenseiPaidConfig.svelte';

	import IncomeAPCard from '$lib/components/views/sensei/SenseiIncomeAPCard.svelte';
	import IncomeEXPCard from '$lib/components/views/sensei/SenseiIncomeEXPCard.svelte';
	import TargetEXPCard from '$lib/components/views/sensei/SenseiTargetEXPCard.svelte';
	import ExpertPermitCard from '$lib/components/views/sensei/SenseiExpertPermitCard.svelte';

	import { storage } from '$lib/utils/storage';

	import {
		getRequiredExp,
		calculateDailyAP,
		calculateDaysToTarget,
		calculateExpertPermit,
		calculateHoardingExp
	} from '$lib/utils/SenseiCalculator';

	// State
	let isLoaded = false;
	let showEditModal = false;

	let userData = { lv: 1, exp_current: 0, exp_max: 8 };
	let targetLv = 90;

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
	let isApOpen = false;
	let isExpOpen = false;
	let isTargetOpen = false;
	let isPermitOpen = false;

	// Lifecycle
	onMount(() => {
		const savedData = storage.loadUserData();
		if (savedData) {
			userData = savedData;
		} else {
			showEditModal = true;
		}

		const savedConfig = storage.loadUserConfig();
		if (savedConfig) {
			userConfig = { ...userConfig, ...savedConfig };
		}

		isLoaded = true;
	});

	// Auto-save
	$: if (isLoaded && userConfig) {
		storage.saveUserConfig(userConfig);
	}

	// Handlers
	const onEdit = () => {
		showEditModal = true;
	};

	const closeEditModal = () => {
		showEditModal = false;
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

		showEditModal = false;
	};

	const onManualSubmit = (event) => {
		const { lv, cur } = event.detail;
		const curParsed = cur === '' || cur === null ? 0 : parseInt(cur);
		if (lv > 0) processFinalData(lv, curParsed);
	};

	// Calculations
	$: dailyAP = calculateDailyAP(userConfig, userData.lv);
	$: calculations = calculateDaysToTarget(userData.lv, userData.exp_current, targetLv, dailyAP);
	$: permitData = calculateExpertPermit(userData.lv, userConfig, dailyAP);

	$: weeklyAPEstimate = dailyAP * 7; // dailyAP already includes weeklyTask average (50/day)

	$: boostMultiplier =
		userData.lv <= 20 ? 2 : userData.lv <= 40 ? 1.5 : userData.lv <= 50 ? 1.25 : 1;
	$: isBoostActive = boostMultiplier > 1.0;

	$: dailyExpEstimate = Math.floor(dailyAP * boostMultiplier);
	$: weeklyExpEstimate = Math.floor(weeklyAPEstimate * boostMultiplier);
	$: hoardingExpEstimate = calculateHoardingExp(userConfig, dailyAP, boostMultiplier);
</script>

<svelte:head>
	<title>Sensei Leveler | BA Tools</title>
</svelte:head>

<div in:fly={{ y: 20, duration: 600 }} class="mx-auto max-w-xl space-y-4 pb-24">
	<!-- Top Bar -->
	<div class="flex items-center justify-between px-4 pt-4">
		<h2 class="text-2xl font-normal text-slate-800">Sensei Leveler</h2>
		<button
			on:click={onEdit}
			class="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold tracking-wider text-slate-600 uppercase transition-colors hover:bg-cyan-100 hover:text-cyan-600"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg
			> <span>Edit Level</span>
		</button>
	</div>

	<!-- Hero -->
	<div
		class="group relative mx-1 overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-xl"
	>
		<!-- Background Effects -->
		<div
			class="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl transition-colors duration-700 group-hover:bg-cyan-400/30"
		></div>
		<div
			class="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-blue-600/30 blur-2xl"
		></div>

		<div class="relative z-10 py-2 text-center">
			<div class="mb-2 text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
				Current Status
			</div>
			<div class="flex items-baseline justify-center gap-1">
				<span class="text-7xl font-bold tracking-tighter">{userData.lv}</span>
				<span class="text-xl font-light text-slate-500">/ 90</span>
			</div>

			<!-- EXP Bar -->
			{#if userData.exp_current !== 'MAX'}
				<div class="mx-auto mt-4 max-w-[200px] space-y-1">
					<div class="h-2 overflow-hidden rounded-full bg-slate-800 ring-1 ring-white/10">
						<div
							class="relative h-full bg-cyan-400 transition-all duration-1000"
							style={`width: ${(userData.exp_current / userData.exp_max) * 100}%`}
						></div>
					</div>
					<div class="flex justify-between px-1 font-mono text-[10px] text-slate-400">
						<span>{userData.exp_current.toLocaleString()}</span>
						<span>{userData.exp_max.toLocaleString()}</span>
					</div>
				</div>
			{:else}
				<div
					class="mt-4 inline-block rounded-full border border-cyan-500/50 bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300"
				>
					MAX LEVEL REACHED
				</div>
			{/if}
		</div>
	</div>

	<IncomeAPCard bind:isOpen={isApOpen} {dailyAP} {weeklyAPEstimate} />

	{#if userData.lv < 90}
		<IncomeEXPCard
			bind:isOpen={isExpOpen}
			{dailyExpEstimate}
			{weeklyExpEstimate}
			{hoardingExpEstimate}
			{boostMultiplier}
			{isBoostActive}
			currentLv={userData.lv}
		/>

		<TargetEXPCard bind:isOpen={isTargetOpen} bind:targetLv {userData} {calculations} />
	{/if}

	<ExpertPermitCard bind:isOpen={isPermitOpen} {permitData} />

	<!-- Config -->
	<div class="space-y-4 pb-4">
		<!-- Title -->
		<div class="px-2 pt-2 pb-2">
			<h2 class="flex items-center gap-3 text-xl font-normal text-slate-800">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-800"
				>
					<Coffee size={20} />
				</div>
				<span>AP Configuration</span>
			</h2>
		</div>

		<!-- Components -->
		<GeneralConfig bind:config={userConfig} level={userData.lv} />
		<ShopConfig bind:config={userConfig} />
		<PaidConfig bind:config={userConfig} />
	</div>
</div>

{#if showEditModal}
	<EditLevelModal
		currentLv={userData.lv}
		currentExp={userData.exp_current}
		on:close={closeEditModal}
		on:submit={onManualSubmit}
	/>
{/if}
