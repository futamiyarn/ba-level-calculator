<script>
	import { slide } from 'svelte/transition';
	import { Zap, Clock, Star, Coins, Edit3, X, Info } from 'lucide-svelte';
	import gameData from '$lib/data/game_data.json';
	import { getBaseAP } from '$lib/utils/SenseiCalculator';

	export let config;
	export let level = 1;

	$: cafeApValue = gameData.cafe_ap[config.cafeRank] || 0;
	$: baseApValue = getBaseAP(level);

	// Info Toggle State
	let openInfo = {};

	const toggleInfo = (id, e) => {
		e.stopPropagation();
		openInfo[id] = !openInfo[id];
	};

	// Handlers
	const handleCustomApFocus = () => {
		if (config.customAP === 0) {
			config.customAP = null; // Kosongkan agar user bisa ketik
		}
	};

	const handleCustomApBlur = () => {
		if (config.customAP === null || config.customAP === '' || isNaN(config.customAP)) {
			config.customAP = 0; // Kembalikan ke 0 jika kosong
		}
	};

	const clearCustomAP = () => {
		config.customAP = 0;
	};
</script>

<section class="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-1 shadow-sm">
	<div
		class="flex items-center gap-2 px-5 py-3 text-[10px] font-bold tracking-widest text-cyan-700 uppercase"
	>
		<Zap size={12} /> General Sources
	</div>

	<div class="flex flex-col">
		<!-- Natural Regen -->
		<div
			class={`flex flex-col border-b border-slate-50 px-5 py-3 last:border-0 transition-opacity ${baseApValue > 0 ? 'opacity-100' : 'opacity-40 grayscale'}`}
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Clock size={20} class="text-slate-400" />
					<div class="flex items-center gap-1.5">
						<span
							class={`text-sm font-medium ${baseApValue > 0 ? 'text-slate-700' : 'text-slate-500'}`}
							>Natural Regen</span
						>
						<button
							on:click={(e) => toggleInfo('regen', e)}
							class="text-slate-300 transition-colors hover:text-cyan-500"
						>
							<Info size={12} />
						</button>
					</div>
				</div>
				<div
					class={`flex items-center gap-1 rounded-md border px-2 py-0.5 ${baseApValue > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}
				>
					<Zap
						size={10}
						class={baseApValue > 0
							? 'fill-emerald-500 text-emerald-500'
							: 'fill-slate-400 text-slate-400'}
					/>
					<span
						class={`text-xs font-bold ${baseApValue > 0 ? 'text-emerald-700' : 'text-slate-500'}`}
						>{baseApValue}</span
					>
				</div>
			</div>
			{#if openInfo['regen']}
				<div
					transition:slide
					class="mt-2 ml-8 rounded-lg border border-slate-100/50 bg-slate-50 p-2"
				>
					<p class="text-[10px] leading-tight text-slate-500">
						Regenerates 1 AP every 6 minutes up to the maximum cap.
					</p>
				</div>
			{/if}
		</div>

		<!-- Cafe Rank -->
		<div class="flex flex-col border-b border-slate-50 px-5 py-3">
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Star
						size={20}
						class={`transition-colors ${config.cafeRank > 0 ? 'text-orange-400' : 'text-slate-300 grayscale'}`}
					/>
					<div class="flex items-center gap-1.5">
						<span
							class={`text-sm font-medium transition-colors ${config.cafeRank > 0 ? 'text-slate-700' : 'text-slate-500'}`}
							>Cafe Production</span
						>
						<button
							on:click={(e) => toggleInfo('cafe', e)}
							class="text-slate-300 transition-colors hover:text-cyan-500"
						>
							<Info size={12} />
						</button>
					</div>
				</div>
				<div
					class={`flex items-center gap-1 rounded-md border px-2 py-0.5 transition-all ${cafeApValue > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50 opacity-40 grayscale'}`}
				>
					<Zap
						size={10}
						class={cafeApValue > 0
							? 'fill-emerald-500 text-emerald-500'
							: 'fill-slate-400 text-slate-400'}
					/>
					<span
						class={`text-xs font-bold ${cafeApValue > 0 ? 'text-emerald-700' : 'text-slate-500'}`}
						>{cafeApValue}</span
					>
				</div>
			</div>

			{#if openInfo['cafe']}
				<div
					transition:slide
					class="mb-3 ml-8 rounded-lg border border-slate-100/50 bg-slate-50 p-2"
				>
					<p class="text-[10px] leading-tight text-slate-500">
						Match this with your in-game rank Cafe. AP production speed and storage capacity
						increase as you clear specific Normal Missions and raise your Comfort points.
					</p>
				</div>
			{/if}

			<div class="flex items-center gap-3">
				<input
					type="range"
					min="0"
					max="10"
					bind:value={config.cafeRank}
					class="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-orange-500 hover:accent-orange-400"
				/>
				<span
					class={`w-8 text-center text-lg font-bold ${config.cafeRank > 0 ? 'text-slate-700' : 'text-slate-400'}`}
					>{config.cafeRank}</span
				>
			</div>
		</div>

		<!-- Radio Items -->
		{#each [{ key: 'diaryTask', label: 'Daily Missions', ap: 150, ep: 120, desc: 'Daily Login (100 AP), Clear 2 Lessons (50 AP), Clear one of 11 random tasks (50 EP), Clear 5 Tasks (100 EP).' }, { key: 'weeklyTask', label: 'Weekly Tasks', ap: 350, ep: 300, desc: '' }, { key: 'loginBonus', label: 'Login Bonus', ap: 55, ep: 0, desc: 'Get 50 and 100 AP on a 10-day login cycle.' }, { key: 'clubLogin', label: 'Club Check-in', ap: 10, ep: 0, desc: 'Visit your joined club and claim from the inbox.' }] as item}
			<div
				class="flex cursor-pointer flex-col justify-between gap-2 border-b border-slate-50 px-5 py-3 transition-colors last:border-0 hover:bg-slate-50 sm:flex-row sm:items-center"
				on:click={() => (config[item.key] = !config[item.key])}
			>
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-3">
						{#if config[item.key]}
							<div
								class="h-5 w-5 flex-shrink-0 rounded-full border-[6px] border-cyan-500 transition-all"
							></div>
						{:else}
							<div
								class="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-300 transition-all"
							></div>
						{/if}
						<div class="flex items-center gap-1.5">
							<span
								class={`text-sm font-medium ${config[item.key] ? 'text-slate-800' : 'text-slate-500'}`}
							>
								{item.label}
							</span>
							{#if item.desc}
								<button
									on:click={(e) => toggleInfo(item.key, e)}
									class="text-slate-300 transition-colors hover:text-cyan-500"
								>
									<Info size={12} />
								</button>
							{/if}
						</div>
					</div>
					{#if item.desc && openInfo[item.key]}
						<div
							transition:slide
							class="mt-2 ml-8 rounded-lg border border-slate-100/50 bg-slate-50 p-2"
						>
							<p class="max-w-[250px] text-[10px] leading-tight text-slate-500">
								{item.desc}
							</p>
						</div>
					{/if}
				</div>

				<div
					class={`ml-8 flex items-center gap-2 transition-opacity sm:ml-0 ${config[item.key] ? 'opacity-100' : 'opacity-40 grayscale'}`}
				>
					<div
						class={`flex items-center gap-1 rounded-md border px-2 py-0.5 ${config[item.key] && item.ap > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}
					>
						<Zap
							size={10}
							class={config[item.key] && item.ap > 0
								? 'fill-emerald-500 text-emerald-500'
								: 'fill-slate-400 text-slate-400'}
						/>
						<span
							class={`text-xs font-bold ${config[item.key] && item.ap > 0 ? 'text-emerald-700' : 'text-slate-500'}`}
							>{item.ap}</span
						>
					</div>
					{#if item.ep > 0}
						<div
							class={`flex items-center gap-1 rounded-md border px-2 py-0.5 ${config[item.key] ? 'border-purple-100 bg-purple-50' : 'border-slate-100 bg-slate-50'}`}
						>
							<Coins size={10} class={config[item.key] ? 'text-purple-500' : 'text-slate-400'} />
							<span
								class={`text-xs font-bold ${config[item.key] ? 'text-purple-700' : 'text-slate-500'}`}
								>{item.ep}</span
							>
						</div>
					{/if}
				</div>
			</div>
		{/each}

		<!-- Custom AP Input -->
		<div class="flex items-center justify-between px-5 py-3">
			<div
				class={`flex items-center gap-3 transition-opacity ${config.customAP > 0 ? 'opacity-100' : 'opacity-40 grayscale'}`}
			>
				<Edit3 size={20} class="text-slate-400" />
				<div class="flex flex-col">
					<span
						class={`text-sm font-medium ${config.customAP > 0 ? 'text-slate-700' : 'text-slate-500'}`}
						>Custom Daily AP</span
					>
					<span class="text-[10px] text-slate-400">One-time/Extra daily</span>
				</div>
			</div>
			<div class="relative flex items-center gap-2">
				<!-- Custom AP Field -->
				<div class="relative">
					<input
						type="number"
						placeholder="0"
						min="0"
						bind:value={config.customAP}
						on:focus={handleCustomApFocus}
						on:blur={handleCustomApBlur}
						class="w-24 rounded-lg border border-slate-200 bg-slate-100 py-1 pr-7 pl-2 text-right text-sm font-bold text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
					/>
					<!-- Clear Button -->
					{#if config.customAP > 0 || config.customAP === null}
						<button
							on:click={clearCustomAP}
							class="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-slate-200 p-0.5 text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-500"
						>
							<X size={12} />
						</button>
					{/if}
				</div>
				<span class="text-xs font-bold text-slate-400">AP</span>
			</div>
		</div>
	</div>
</section>
