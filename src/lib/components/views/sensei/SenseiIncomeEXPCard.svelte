<script>
	import { Info, Zap, Star, ShieldCheck } from 'lucide-svelte';
	import Collapse from '$lib/components/ui/Collapse.svelte';

	export let dailyExpEstimate = 0;
	export let weeklyExpEstimate = 0;
	export let hoardingExpEstimate = 0;
	export let boostMultiplier = 1;
	export let isBoostActive = false;
	export let currentLv = 1;
	export let isOpen = false;
</script>

<Collapse bind:isOpen title="Income EXP">
	<!-- Icon Slot -->
	<div
		slot="icon"
		class={`relative flex h-full w-full items-center justify-center rounded-full ${isBoostActive ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}
	>
		<Star size={20} class={isBoostActive ? 'fill-orange-500' : ''} />
		{#if isBoostActive}
			<div
				class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-orange-100"
			>
				<span class="text-[10px]">🔰</span>
			</div>
		{/if}
	</div>

	<!-- Subtitle Slot -->
	<span slot="subtitle">
		Daily: <span class="font-bold text-orange-600">{dailyExpEstimate.toLocaleString()}</span>
		{#if isBoostActive}
			<span class="ml-1 text-[9px] font-bold text-orange-500">({boostMultiplier}x Boost)</span>
		{/if}
	</span>

	<!-- Content -->
	<div>
		<!-- Details List -->
		<div class="mb-3 space-y-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
			<!-- Daily -->
			<div class="flex items-center justify-between">
				<div class="text-[11px] font-bold text-slate-400 uppercase">Daily Average</div>
				<div class="text-base font-bold text-slate-700">
					{dailyExpEstimate.toLocaleString()}
				</div>
			</div>

			<div class="h-px bg-slate-50"></div>

			<!-- Weekly Standard -->
			<div class="flex items-center justify-between">
				<div class="text-[11px] font-bold text-slate-400 uppercase">Weekly (Standard)</div>
				<div class="text-base font-bold text-slate-700">
					{weeklyExpEstimate.toLocaleString()}
				</div>
			</div>

			<div class="h-px bg-slate-50"></div>

			<!-- Weekly Strategy -->
			<div class="flex items-center justify-between">
				<div class="flex flex-col">
					<span class="text-[11px] font-bold text-orange-500 uppercase">Weekly (2x Strategy)</span>
					<span class="text-[9px] leading-tight text-slate-400">Hoard for Weekend Event</span>
				</div>
				<div class="text-lg font-black text-orange-600">
					{hoardingExpEstimate.toLocaleString()}
				</div>
			</div>
		</div>

		<!-- Boost Status -->
		<div class="mb-3 text-center">
			{#if isBoostActive}
				<div
					class="inline-block rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-600"
				>
					Active Boost: {boostMultiplier}x EXP
				</div>
			{:else}
				<div
					class="inline-block rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-medium text-slate-500"
				>
					Standard Rate (1 AP = 1 EXP)
				</div>
			{/if}
		</div>

		<!-- Beginner Boost Table -->
		{#if isBoostActive}
			<div class="rounded-xl border border-orange-100 bg-orange-50 p-3">
				<div class="mb-3 flex items-center gap-2">
					<ShieldCheck size={14} class="text-orange-500" />
					<span class="text-xs font-bold text-orange-700">Beginner Boost Table</span>
				</div>
				<div class="grid grid-cols-3 gap-2">
					{#each [{ range: '1-20', x: '2x' }, { range: '21-40', x: '1.5x' }, { range: '41-50', x: '1.25x' }] as item}
						<div
							class={`rounded-lg border p-2 text-center ${
								currentLv >= parseInt(item.range.split('-')[0]) &&
								currentLv <= parseInt(item.range.split('-')[1].replace('50', '50'))
									? 'border-orange-600 bg-orange-500 text-white shadow-sm'
									: 'border-slate-100 bg-white text-slate-400'
							}`}
						>
							<div
								class={`mb-0.5 text-[9px] ${
									currentLv >= parseInt(item.range.split('-')[0]) &&
									currentLv <= parseInt(item.range.split('-')[1])
										? 'text-orange-100'
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
</Collapse>
