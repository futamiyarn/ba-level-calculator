<script>
	import { slide } from 'svelte/transition';
	import { Zap, Clock, Coffee, Ticket, Edit3, Info } from 'lucide-svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import Collapse from '$lib/components/ui/Collapse.svelte';
	import TextBox from '$lib/components/ui/TextBox.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import CurrencyBadge from '$lib/components/ui/CurrencyBadge.svelte';
	import gameData from '$lib/data/game_data.json';
	import { getBaseAP } from '$lib/utils/SenseiCalculator';

	export let config;
	export let level = 1;

	$: cafeApValue = gameData.cafe_ap[config.cafeRank] || 0;
	$: baseApValue = getBaseAP(level);

	let openInfo = {};

	const toggleInfo = (id, e) => {
		e.stopPropagation();
		openInfo[id] = !openInfo[id];
	};

	const handleCustomApFocus = () => {
		if (config.customAP === 0) {
			config.customAP = null;
		}
	};

	const handleCustomApBlur = () => {
		if (config.customAP === null || config.customAP === '' || isNaN(config.customAP)) {
			config.customAP = 0;
		}
	};

	const clearCustomAP = () => {
		config.customAP = 0;
	};
</script>

<Card>
	<CardHeader>
		<Zap size={12} /> General Sources
	</CardHeader>

	<div class="flex flex-col">
		<div class="flex flex-col border-b border-slate-50 px-5 py-3 last:border-0">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Clock size={20} class="text-slate-400" />
					<div class="flex items-center gap-1.5">
						<span class="text-sm font-medium text-slate-700">Natural Regen</span>
						<button
							on:click={(e) => toggleInfo('regen', e)}
							class="text-slate-300 transition-colors hover:text-cyan-500"
						>
							<Info size={12} />
						</button>
					</div>
				</div>
				<CurrencyBadge
					icon={Zap}
					value={baseApValue}
					type={baseApValue > 0 ? 'emerald' : 'default'}
				/>
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
					<Coffee
						size={20}
						class={`transition-colors ${config.cafeRank > 0 ? 'text-orange-400' : 'text-slate-300 grayscale'}`}
					/>

					<div class="flex items-center gap-1.5">
						<span class="text-sm font-medium text-slate-700 transition-colors">Cafe Production</span
						>
						<button
							on:click={(e) => toggleInfo('cafe', e)}
							class="text-slate-300 transition-colors hover:text-cyan-500"
						>
							<Info size={12} />
						</button>
					</div>
				</div>
				<CurrencyBadge
					icon={Zap}
					value={cafeApValue}
					type={cafeApValue > 0 ? 'emerald' : 'default'}
				/>
			</div>

			{#if openInfo['cafe']}
				<div
					transition:slide
					class="mb-3 ml-8 rounded-lg border border-slate-100/50 bg-slate-50 p-2"
				>
					<p class="text-[10px] leading-tight text-slate-500">
						Match this with your in-game rank Cafe.
					</p>
				</div>
			{/if}

			<div class="flex items-center gap-3">
				<Slider min={0} max={10} bind:value={config.cafeRank} color="orange" />
				<span
					class={`w-8 text-center text-lg font-bold ${config.cafeRank > 0 ? 'text-slate-700' : 'text-slate-400'}`}
					>{config.cafeRank}</span
				>
			</div>
		</div>

		{#each [{ key: 'diaryTask', label: 'Daily Missions', ap: 150, ep: 120, desc: 'Login Daily (100 AP), etc.' }, { key: 'weeklyTask', label: 'Weekly Tasks', ap: 350, ep: 300, desc: 'Login 5 Days, etc.' }, { key: 'loginBonus', label: 'Login Bonus', ap: 55, ep: 0, desc: '10-day login cycle.' }, { key: 'clubLogin', label: 'Club Check-in', ap: 10, ep: 0, desc: 'Visit your joined club.' }] as item}
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
								class="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-400 transition-all"
							></div>
						{/if}
						<div class="flex items-center gap-1.5">
							<span class="text-sm font-medium text-slate-700">{item.label}</span>
							<button
								on:click={(e) => toggleInfo(item.key, e)}
								class="text-slate-300 transition-colors hover:text-cyan-500"
							>
								<Info size={12} />
							</button>
						</div>
					</div>
					{#if openInfo[item.key]}
						<div
							transition:slide
							class="mt-2 ml-8 rounded-lg border border-slate-100/50 bg-slate-50 p-2"
						>
							<p class="max-w-[250px] text-[10px] leading-tight text-slate-500">{item.desc}</p>
						</div>
					{/if}
				</div>
				<div
					class={`ml-8 flex items-center gap-2 transition-opacity sm:ml-0 ${config[item.key] ? 'opacity-100' : 'opacity-40 grayscale'}`}
				>
					<CurrencyBadge
						icon={Zap}
						value={item.ap}
						type={config[item.key] && item.ap > 0 ? 'emerald' : 'default'}
					/>
					{#if item.ep > 0}
						<CurrencyBadge
							icon={Ticket}
							value={item.ep}
							type={config[item.key] ? 'purple' : 'default'}
						/>
					{/if}
				</div>
			</div>
		{/each}

		<div class="flex items-center justify-between px-5 py-3">
			<div class="flex items-center gap-3">
				<Edit3 size={20} class="text-slate-400" />
				<div class="flex flex-col">
					<span class="text-sm font-medium text-slate-700">Custom Daily AP</span>
					<span class="text-[10px] text-slate-400">One-time/Extra daily</span>
				</div>
			</div>
			<div class="relative flex items-center gap-2">
				<TextBox
					type="number"
					placeholder="0"
					min="0"
					bind:value={config.customAP}
					on:focus={handleCustomApFocus}
					on:blur={handleCustomApBlur}
					on:clear={clearCustomAP}
					clearable={true}
					class="!w-24 !bg-slate-100 !py-1 !text-right !text-sm !font-bold"
				/>
				<span class="text-xs font-bold text-slate-400">AP</span>
			</div>
		</div>
	</div>
</Card>
