<script>
	import {
		Coffee,
		Zap,
		ShoppingBag,
		Gem,
		CreditCard,
		Clock,
		Star,
		Users,
		Calendar,
		ChevronsLeft,
		ChevronsRight,
		Minus,
		Plus,
		Coins,
		Edit3,
		X
	} from 'lucide-svelte';

	import Counter from '$lib/components/ui/Counter.svelte';
	import gameData from '$lib/data/game_data.json';
	import { getBaseAP } from '$lib/utils/calculator';

	export let config;
	export let level = 1;

	$: cafeApValue = gameData.cafe_ap[config.cafeRank] || 0;
	$: baseApValue = getBaseAP(level);

	// Definisi Preset
	const pyroPresets = [0, 3, 6, 9, 12, 15, 20];
	const pvpPresets = [0, 1, 4];

	// --- HANDLER CUSTOM AP ---
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

<div class="space-y-4 pb-4">
	<!-- JUDUL SECTION -->
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

	<!-- KARTU 1: GENERAL -->
	<section class="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-1 shadow-sm">
		<div
			class="flex items-center gap-2 px-5 py-3 text-[10px] font-bold tracking-widest text-cyan-700 uppercase"
		>
			<Zap size={12} /> General Sources
		</div>

		<div class="flex flex-col">
			<!-- 1. Natural Regen -->
			<div
				class="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-0"
			>
				<div class="flex items-center gap-3">
					<Clock size={20} class="text-slate-400" />
					<span class="text-sm font-medium text-slate-700">Natural Regen</span>
				</div>
				<div
					class="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
				>
					<Zap size={10} class="fill-slate-500" />
					{baseApValue}
				</div>
			</div>

			<!-- 2. Cafe Rank -->
			<div class="border-b border-slate-50 px-5 py-3">
				<div class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<Star size={20} class="text-orange-400" />
						<span class="text-sm font-medium text-slate-700">Cafe Rank</span>
					</div>
					<div
						class="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600"
					>
						<Zap size={10} class="fill-orange-500" />
						{cafeApValue}
					</div>
				</div>
				<div class="flex items-center gap-3">
					<input
						type="range"
						min="1"
						max="10"
						bind:value={config.cafeRank}
						class="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-orange-500 hover:accent-orange-400"
					/>
					<span class="w-8 text-center text-lg font-bold text-slate-700">{config.cafeRank}</span>
				</div>
			</div>

			<!-- Radio Items -->
			{#each [{ key: 'diaryTask', label: 'Daily Missions', ap: 150, ep: 120 }, { key: 'weeklyTask', label: 'Weekly Tasks', ap: 350, ep: 300 }, { key: 'loginBonus', label: 'Login Bonus', ap: 55, ep: 0 }, { key: 'clubLogin', label: 'Club Check-in', ap: 10, ep: 0 }] as item}
				<div
					class="flex cursor-pointer flex-col justify-between gap-2 border-b border-slate-50 px-5 py-3 transition-colors last:border-0 hover:bg-slate-50 sm:flex-row sm:items-center"
					on:click={() => (config[item.key] = !config[item.key])}
				>
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
						<span
							class={`text-sm font-medium ${config[item.key] ? 'text-slate-800' : 'text-slate-500'}`}
						>
							{item.label}
						</span>
					</div>

					<div
						class={`ml-8 flex items-center gap-2 transition-opacity sm:ml-0 ${config[item.key] ? 'opacity-100' : 'opacity-40 grayscale'}`}
					>
						<div
							class="flex items-center gap-1 rounded-md border border-yellow-100 bg-yellow-50 px-2 py-0.5"
						>
							<Zap size={10} class="fill-yellow-500 text-yellow-500" />
							<span class="text-xs font-bold text-yellow-700">{item.ap}</span>
						</div>
						{#if item.ep > 0}
							<div
								class="flex items-center gap-1 rounded-md border border-purple-100 bg-purple-50 px-2 py-0.5"
							>
								<Coins size={10} class="text-purple-500" />
								<span class="text-xs font-bold text-purple-700">{item.ep}</span>
							</div>
						{/if}
					</div>
				</div>
			{/each}

			<!-- Custom AP Input -->
			<div class="flex items-center justify-between px-5 py-3">
				<div class="flex items-center gap-3">
					<Edit3 size={20} class="text-slate-400" />
					<div class="flex flex-col">
						<span class="text-sm font-medium text-slate-700">Custom Daily AP</span>
						<span class="text-[10px] text-slate-400">One-time/Extra daily</span>
					</div>
				</div>
				<div class="relative flex items-center gap-2">
					<!-- Wrapper input agar icon clear bisa diletakkan absolute -->
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
						<!-- Clear Button (Only show if not 0) -->
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

	<!-- KARTU 2: SHOP & REFRESH -->
	<section class="rounded-[24px] border border-slate-200 bg-white p-1 shadow-sm">
		<div
			class="flex items-center gap-2 px-5 py-3 text-[10px] font-bold tracking-widest text-rose-500 uppercase"
		>
			<ShoppingBag size={12} /> Shop & Refresh
		</div>

		<div class="flex flex-col">
			<!-- Free Shop Pack -->
			<div
				class="flex cursor-pointer flex-col justify-between border-b border-slate-50 px-5 py-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
				on:click={() => (config.freeShop = !config.freeShop)}
			>
				<div class="mb-2 flex items-center gap-3 sm:mb-0">
					{#if config.freeShop}
						<div
							class="h-5 w-5 flex-shrink-0 rounded-full border-[6px] border-rose-500 transition-all"
						></div>
					{:else}
						<div
							class="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-300 transition-all"
						></div>
					{/if}
					<span class="text-sm font-medium text-slate-700">Free Shop Pack</span>
				</div>

				<div
					class={`ml-8 flex items-center gap-1 transition-opacity sm:ml-0 ${config.freeShop ? 'opacity-100' : 'opacity-40 grayscale'}`}
				>
					<div
						class="flex items-center gap-1 rounded-md border border-yellow-100 bg-yellow-50 px-2 py-0.5"
					>
						<Zap size={10} class="fill-yellow-500 text-yellow-500" />
						<span class="text-xs font-bold text-yellow-700">10</span>
					</div>
				</div>
			</div>

			<!-- PVP Refresh -->
			<div class="flex flex-col gap-3 border-b border-slate-50 px-5 py-3">
				<div class="flex items-center justify-between">
					<div class="flex flex-col">
						<span class="flex items-center gap-1 text-sm font-medium text-slate-700">
							<Coins size={14} class="fill-rose-100 text-rose-400" /> Tactical Challenge
						</span>
						<span class="text-[10px] text-slate-400">90 AP/buy (Max 4)</span>
					</div>

					<div
						class="flex items-center gap-1 rounded-md border border-yellow-100 bg-yellow-50 px-2 py-0.5"
					>
						<Zap size={10} class="fill-yellow-500 text-yellow-500" />
						<span class="text-xs font-bold text-yellow-700">+{config.pvpRefreshes * 90}</span>
					</div>
				</div>

				<Counter bind:value={config.pvpRefreshes} max={4} presets={pvpPresets} color="rose" />

				<div class="flex justify-center gap-2">
					{#each pvpPresets as count}
						<button
							on:click={() => (config.pvpRefreshes = count)}
							class={`rounded-lg border px-4 py-1.5 text-[10px] font-bold transition-all ${
								config.pvpRefreshes === count
									? 'border-rose-500 bg-rose-500 text-white shadow-sm'
									: 'border-rose-100 bg-white text-rose-600 hover:bg-rose-50'
							}`}
						>
							{count}x
						</button>
					{/each}
				</div>
			</div>

			<!-- Pyro Refresh -->
			<div class="flex flex-col gap-3 px-5 py-3">
				<div class="flex items-center justify-between">
					<div class="flex flex-col">
						<span class="flex items-center gap-1 text-sm font-medium text-slate-700">
							<Gem size={12} class="fill-blue-400 text-blue-400" /> Pyro Refresh
						</span>
						<span class="text-[10px] text-slate-400">120 AP/step</span>
					</div>

					<div
						class="flex items-center gap-1 rounded-md border border-yellow-100 bg-yellow-50 px-2 py-0.5"
					>
						<Zap size={10} class="fill-yellow-500 text-yellow-500" />
						<span class="text-xs font-bold text-yellow-700">+{config.pyroRefreshes * 120}</span>
					</div>
				</div>

				<Counter bind:value={config.pyroRefreshes} max={20} presets={pyroPresets} color="blue" />

				<div class="flex flex-wrap justify-center gap-1.5">
					<button
						on:click={() => (config.pyroRefreshes = 0)}
						class={`rounded border px-2 py-1 text-[10px] font-bold transition-all ${
							config.pyroRefreshes === 0
								? 'border-slate-600 bg-slate-600 text-white'
								: 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
						}`}
					>
						0
					</button>
					{#each [3, 6, 9, 12, 15, 20] as count}
						<button
							on:click={() => (config.pyroRefreshes = count)}
							class={`rounded border px-2 py-1 text-[10px] font-bold transition-all ${
								config.pyroRefreshes === count
									? 'border-blue-500 bg-blue-500 text-white'
									: 'border-blue-100 bg-white text-blue-600 hover:bg-blue-50'
							}`}
						>
							{count}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- KARTU 3: PAID -->
	<section class="rounded-[24px] border border-slate-200 bg-white p-1 shadow-sm">
		<div
			class="flex items-center gap-2 px-5 py-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
		>
			<CreditCard size={12} /> Paid Services
		</div>

		<div class="flex flex-col pb-2">
			<div
				class="flex cursor-pointer flex-col justify-between rounded-[20px] px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
				on:click={() => (config.twoWeekPack = !config.twoWeekPack)}
			>
				<div class="mb-2 flex items-center gap-3 sm:mb-0">
					{#if config.twoWeekPack}
						<div
							class="h-5 w-5 flex-shrink-0 rounded-full border-[6px] border-slate-600 transition-all"
						></div>
					{:else}
						<div
							class="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-300 transition-all"
						></div>
					{/if}
					<span class="text-sm font-medium text-slate-700">2-Week AP Pack</span>
				</div>

				<div
					class={`ml-8 flex items-center gap-1 transition-opacity sm:ml-0 ${config.twoWeekPack ? 'opacity-100' : 'opacity-40 grayscale'}`}
				>
					<div
						class="flex items-center gap-1 rounded-md border border-yellow-100 bg-yellow-50 px-2 py-0.5"
					>
						<Zap size={10} class="fill-yellow-500 text-yellow-500" />
						<span class="text-xs font-bold text-yellow-700">150</span>
					</div>
				</div>
			</div>

			<!-- NOTE UNDER PAID -->
			<div class="px-5 pb-2">
				<p class="text-[10px] text-slate-400 italic">
					* Does not include special offers (limited packs, monthly dash, etc).
				</p>
			</div>
		</div>
	</section>
</div>
