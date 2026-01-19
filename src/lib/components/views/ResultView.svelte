<script>
	import { createEventDispatcher } from 'svelte';
	import { slide, fly } from 'svelte/transition';
	import {
		RotateCcw,
		Zap,
		Target,
		Coins,
		Calendar,
		ChevronDown,
		ShieldCheck,
		CheckCircle2,
		Lock,
		AlertCircle,
		Info
	} from 'lucide-svelte';

	import APConfigSection from '$lib/components/config/APConfigSection.svelte';

	export let userData;
	export let dailyAP;
	export let calculations;
	export let permitData;

	export let targetLv;
	export let config;

	const dispatch = createEventDispatcher();

	// --- STATE FOR COLLAPSIBLES ---
	// Default: AP & Exp tertutup (tampil ringkas), Target & Permit tertutup.
	let isApOpen = false;
	let isExpOpen = false;
	let isTargetOpen = false;
	let isPermitOpen = false;

	// --- HELPERS ---
	const getTargetDate = (days) => {
		const d = new Date();
		d.setDate(d.getDate() + days);
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	};

	// --- LOGIC DISPLAY ---

	// 1. Weekly AP Estimate
	$: weeklyAPEstimate = dailyAP * 7 + (config.weeklyTask ? 350 : 0);

	// 2. Logic Boost EXP (Hanya untuk Display di UI, kalkulasi asli ada di calculator.js)
	// Lv 1-20: 2x | Lv 21-40: 1.5x | Lv 41-50: 1.25x | Lv 51+: 1x
	$: boostMultiplier =
		userData.lv <= 20 ? 2 : userData.lv <= 40 ? 1.5 : userData.lv <= 50 ? 1.25 : 1;
	$: isBoostActive = boostMultiplier > 1.0;

	// Estimasi EXP Harian/Mingguan (Hanya untuk display saat ini)
	$: dailyExpEstimate = Math.floor(dailyAP * boostMultiplier);
	$: weeklyExpEstimate = Math.floor(weeklyAPEstimate * boostMultiplier);

	const targetPresets = [30, 50, 70, 80, 90];
</script>

<div in:fly={{ y: 20, duration: 600 }} class="mx-auto max-w-xl space-y-4 pb-24">
	<!-- TOP BAR -->
	<div class="flex items-center justify-between px-4 pt-4">
		<h2 class="text-2xl font-normal text-slate-800">Result</h2>
		<button
			on:click={() => dispatch('reset')}
			class="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold tracking-wider text-slate-600 uppercase transition-colors hover:bg-rose-100 hover:text-rose-600"
		>
			<RotateCcw size={14} /> <span>Reset</span>
		</button>
	</div>

	<!-- 1. HERO CARD (CURRENT LEVEL) -->
	<div
		class="group relative mx-1 overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-xl"
	>
		<!-- Decorative Blobs -->
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

	<!-- 2. INCOME AP (COLLAPSIBLE) -->
	<div class="mx-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
		<button
			class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
			on:click={() => (isApOpen = !isApOpen)}
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600"
				>
					<Zap size={20} class="fill-yellow-500 text-yellow-500" />
				</div>
				<div class="flex flex-col text-left">
					<h3 class="text-sm font-bold text-slate-700">Income AP</h3>
					<!-- Compact Description: Show Daily if closed -->
					{#if !isApOpen}
						<p transition:slide class="text-[10px] font-medium text-slate-500">
							Daily: <span class="font-bold text-slate-700">{dailyAP.toLocaleString()}</span>
						</p>
					{/if}
				</div>
			</div>
			<ChevronDown
				size={20}
				class={`text-slate-400 transition-transform duration-300 ${isApOpen ? 'rotate-180' : ''}`}
			/>
		</button>

		{#if isApOpen}
			<div transition:slide class="border-t border-slate-100 bg-slate-50/50 p-4">
				<!-- Detail Daily & Weekly -->
				<div class="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
					<p class="mb-2 text-[10px] font-bold text-slate-400 uppercase">Total Accumulated AP</p>
					<div class="flex justify-center gap-8">
						<div>
							<div class="text-[10px] text-slate-400">Daily</div>
							<div class="text-xl font-bold text-slate-800">{dailyAP.toLocaleString()}</div>
						</div>
						<div class="w-px bg-slate-100"></div>
						<div>
							<div class="text-[10px] text-slate-400">Weekly</div>
							<div class="text-xl font-bold text-slate-800">
								{weeklyAPEstimate.toLocaleString()}
							</div>
						</div>
					</div>

					<!-- NOTE: INCOME AP -->
					<div
						class="mt-3 flex items-center justify-center gap-1 rounded bg-slate-50 py-1 text-[9px] text-slate-400"
					>
						<Info size={10} />
						<span>Excludes maintenance/event gifts from developer</span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- 3. INCOME EXP (COLLAPSIBLE) -->
	{#if userData.lv < 90}
		<div class="mx-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
			<button
				class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
				on:click={() => (isExpOpen = !isExpOpen)}
			>
				<div class="flex items-center gap-3">
					<!-- Icon: Show 🔰 only if Boost is active (Lv < 51) -->
					<div
						class={`relative flex h-10 w-10 items-center justify-center rounded-full ${isBoostActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}
					>
						<Calendar size={20} />
						{#if isBoostActive}
							<div class="absolute -top-1 -right-1 scale-90 rounded-full bg-white p-0.5 shadow-sm">
								<span class="text-[10px]">🔰</span>
							</div>
						{/if}
					</div>
					<div class="flex flex-col text-left">
						<h3 class="text-sm font-bold text-slate-700">Income EXP</h3>
						<!-- Compact Description -->
						{#if !isExpOpen}
							<p transition:slide class="text-[10px] font-medium text-slate-500">
								Daily: <span class="font-bold text-blue-700"
									>{dailyExpEstimate.toLocaleString()}</span
								>
								{#if isBoostActive}
									<span class="ml-1 text-[9px] font-bold text-indigo-500"
										>({boostMultiplier}x Boost)</span
									>
								{/if}
							</p>
						{/if}
					</div>
				</div>
				<ChevronDown
					size={20}
					class={`text-slate-400 transition-transform duration-300 ${isExpOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{#if isExpOpen}
				<div transition:slide class="border-t border-slate-100 bg-slate-50/50 p-4">
					<!-- Detail Daily & Weekly -->
					<div class="mb-3 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
						<p class="mb-2 text-[10px] font-bold text-slate-400 uppercase">Total Accumulated EXP</p>
						<div class="flex justify-center gap-8">
							<div>
								<div class="text-[10px] text-slate-400">Daily</div>
								<div class="text-xl font-bold text-blue-600">
									{dailyExpEstimate.toLocaleString()}
								</div>
							</div>
							<div class="w-px bg-slate-100"></div>
							<div>
								<div class="text-[10px] text-slate-400">Weekly</div>
								<div class="text-xl font-bold text-blue-600">
									{weeklyExpEstimate.toLocaleString()}
								</div>
							</div>
						</div>

						<!-- Boost Status Badge -->
						{#if isBoostActive}
							<div
								class="mt-3 inline-block rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600"
							>
								Active Boost: {boostMultiplier}x EXP
							</div>
						{:else}
							<div
								class="mt-3 inline-block rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"
							>
								Standard Rate (1 AP = 1 EXP)
							</div>
						{/if}
					</div>

					<!-- Beginner Boost Table (Hanya muncul jika Boost Aktif / Lv < 51) -->
					{#if isBoostActive}
						<div class="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
							<div class="mb-3 flex items-center gap-2">
								<ShieldCheck size={14} class="text-indigo-500" />
								<span class="text-xs font-bold text-indigo-700">Beginner Boost Table</span>
							</div>
							<div class="grid grid-cols-3 gap-2">
								{#each [{ range: '1-20', x: '2x' }, { range: '21-40', x: '1.5x' }, { range: '41-50', x: '1.25x' }] as item}
									<div
										class={`rounded-lg border p-2 text-center ${
											userData.lv >= parseInt(item.range.split('-')[0]) &&
											userData.lv <= parseInt(item.range.split('-')[1].replace('50', '50'))
												? 'border-indigo-600 bg-indigo-500 text-white shadow-sm'
												: 'border-slate-100 bg-white text-slate-400'
										}`}
									>
										<div
											class={`mb-0.5 text-[9px] ${
												userData.lv >= parseInt(item.range.split('-')[0]) &&
												userData.lv <= parseInt(item.range.split('-')[1])
													? 'text-indigo-100'
													: 'text-slate-400'
											}`}
										>
											Lv {item.range}
										</div>
										<div class="text-sm font-black">{item.x}</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- 4. TARGET EXP (COMPACT COLLAPSIBLE) -->
	{#if userData.lv < 90}
		<div class="mx-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
			<button
				class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
				on:click={() => (isTargetOpen = !isTargetOpen)}
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700"
					>
						<Target size={20} />
					</div>
					<div class="flex flex-col text-left">
						<h3 class="text-sm font-bold text-slate-700">Target: Lv.{targetLv}</h3>
						<!-- Compact Description -->
						{#if !isTargetOpen}
							<p transition:slide class="text-[10px] font-medium text-slate-500">
								Est: <span class="font-bold text-cyan-700">{calculations.days} Days</span>
							</p>
						{/if}
					</div>
				</div>
				<ChevronDown
					size={20}
					class={`text-slate-400 transition-transform duration-300 ${isTargetOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{#if isTargetOpen}
				<div transition:slide class="border-t border-slate-100 bg-slate-50 p-5">
					<!-- Prediction Box -->
					<div class="mb-4 flex gap-3">
						<div
							class="flex-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm"
						>
							<div class="text-[10px] font-bold text-slate-400 uppercase">Days Needed</div>
							<div class="text-2xl font-black text-cyan-600">{calculations.days}</div>
						</div>
						<div
							class="flex-[1.5] rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm"
						>
							<div class="text-[10px] font-bold text-slate-400 uppercase">Finish Date</div>
							<div class="mt-1 text-lg font-bold text-slate-700">
								{getTargetDate(calculations.days)}
							</div>
						</div>
					</div>

					<!-- NOTE: TARGET -->
					<div class="mb-4 text-center">
						<p class="flex items-center justify-center gap-1 text-[10px] text-slate-400">
							<Info size={10} /> Calculations exclude Double EXP Campaigns
						</p>
					</div>

					<!-- Slider Control -->
					<div class="mb-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
						<div class="mb-2 flex justify-between px-1 text-[10px] font-bold text-slate-400">
							<span>Lv.{userData.lv}</span>
							<span>Max 90</span>
						</div>
						<input
							type="range"
							min={userData.lv + 1}
							max="90"
							bind:value={targetLv}
							class="h-4 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-cyan-600 hover:accent-cyan-500"
						/>
					</div>

					<div class="flex justify-between gap-2">
						{#each targetPresets as preset}
							{#if preset < 90}
								<button
									on:click={() => (targetLv = preset)}
									disabled={userData.lv >= preset}
									class={`
                      flex-1 rounded-xl py-2 text-xs font-bold transition-all
                      ${
												targetLv === preset
													? 'bg-cyan-600 text-white shadow-md'
													: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
											}
                      disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-300
                    `}
								>
									{preset}
								</button>
							{/if}
							{#if preset === 90}
								<button
									on:click={() => (targetLv = 90)}
									class={`
                       flex-1 rounded-xl py-2 text-xs font-bold transition-all
                       ${
													targetLv === 90
														? 'bg-cyan-600 text-white shadow-md'
														: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
												}
                     `}
								>
									90
								</button>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- 5. EXPERT PERMIT (COMPACT COLLAPSIBLE) -->
	<div class="mx-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
		<button
			class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
			on:click={() => (isPermitOpen = !isPermitOpen)}
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600"
				>
					<Coins size={20} />
				</div>
				<div class="flex flex-col text-left">
					<h3 class="text-sm font-bold text-slate-700">Expert Permit</h3>
					<!-- Jika tertutup, munculkan Total Weekly -->
					{#if !isPermitOpen}
						<p transition:slide class="text-[10px] font-medium text-slate-500">
							Total Weekly: <span class="font-bold text-purple-700"
								>{permitData.totalWeekly.toLocaleString()}</span
							>
						</p>
					{/if}
				</div>
			</div>
			<ChevronDown
				size={20}
				class={`text-slate-400 transition-transform duration-300 ${isPermitOpen ? 'rotate-180' : ''}`}
			/>
		</button>

		{#if isPermitOpen}
			<div transition:slide class="border-t border-slate-100 bg-slate-50 p-4">
				<div class="mb-5 text-center">
					<div class="text-[10px] font-bold text-slate-400 uppercase">Total Weekly Income</div>
					<div class="text-3xl font-bold text-slate-800">
						{permitData.totalWeekly.toLocaleString()}
					</div>
				</div>

				<div class="flex flex-col gap-3">
					<!-- 1. TASK INCOME -->
					<div
						class="flex items-center justify-between rounded-xl border border-purple-100 bg-white p-3 shadow-sm"
					>
						<div class="flex flex-col">
							<div class="flex items-center gap-2">
								<CheckCircle2 size={16} class="text-purple-500" />
								<span class="text-sm font-bold text-slate-700">Mission Tasks</span>
							</div>
							<span class="ml-6 text-[10px] text-slate-400">Daily & Weekly</span>
						</div>
						<span class="text-sm font-bold text-purple-700">+{permitData.taskOnly}</span>
					</div>

					<!-- 2. AP CONVERSION INCOME -->
					<div
						class={`flex items-start justify-between rounded-xl border p-3 transition-all ${
							permitData.isMaxed ? 'border-purple-100 bg-purple-50' : 'border-slate-200 bg-slate-50'
						}`}
					>
						<div class="flex flex-col">
							<div class="flex items-center gap-2">
								{#if permitData.isMaxed}
									<Zap size={16} class="text-purple-500" />
									<span class="text-sm font-bold text-purple-700">AP Conversion</span>
								{:else}
									<Lock size={16} class="text-slate-400" />
									<span class="text-sm font-bold text-slate-500">AP Conversion</span>
								{/if}
							</div>

							<!-- Info jika Locked (Potensi hilang) -->
							{#if !permitData.isMaxed}
								<span
									class="mt-0.5 ml-6 flex items-center gap-1 text-[10px] font-medium text-rose-500"
								>
									<AlertCircle size={10} /> Requires Max Level (90)
								</span>
							{:else}
								<span class="ml-6 text-[10px] text-purple-400">1 AP = 1 Permit</span>
							{/if}
						</div>

						<div class="text-right">
							<span
								class={`text-sm font-bold ${permitData.isMaxed ? 'text-purple-700' : 'text-slate-400'}`}
							>
								+{permitData.isMaxed
									? permitData.apOnly.toLocaleString()
									: permitData.apPotential.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- 6. CONFIGURATION COMPONENT -->
	<APConfigSection bind:config level={userData.lv} />
</div>
