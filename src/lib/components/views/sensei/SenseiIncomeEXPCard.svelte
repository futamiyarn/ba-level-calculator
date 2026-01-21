<script>
	import { slide } from 'svelte/transition';
	import { Calendar, ChevronDown, ShieldCheck } from 'lucide-svelte';

	export let dailyExpEstimate = 0;
	export let weeklyExpEstimate = 0;
	export let hoardingExpEstimate = 0;
	export let boostMultiplier = 1;
	export let isBoostActive = false;
	export let currentLv = 1;
	export let isOpen = false;
</script>

<div class="mx-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
	<button
		class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
		on:click={() => (isOpen = !isOpen)}
	>
		<div class="flex items-center gap-3">
			<!-- Icon -->
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
				{#if !isOpen}
					<p transition:slide class="text-[10px] font-medium text-slate-500">
						Daily: <span class="font-bold text-blue-700">{dailyExpEstimate.toLocaleString()}</span>
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
			class={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
		/>
	</button>

	{#if isOpen}
		<div transition:slide class="border-t border-slate-100 bg-slate-50/50 p-4">
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
						<span class="text-[11px] font-bold text-indigo-500 uppercase">Weekly (2x Strategy)</span>
						<span class="text-[9px] text-slate-400 leading-tight">Hoard for Weekend Event</span>
					</div>
					<div class="text-lg font-black text-indigo-600">
						{hoardingExpEstimate.toLocaleString()}
					</div>
				</div>
			</div>

			<!-- Boost Status -->
			<div class="mb-3 text-center">
				{#if isBoostActive}
					<div
						class="inline-block rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600"
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
				<div class="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
					<div class="mb-3 flex items-center gap-2">
						<ShieldCheck size={14} class="text-indigo-500" />
						<span class="text-xs font-bold text-indigo-700">Beginner Boost Table</span>
					</div>
					<div class="grid grid-cols-3 gap-2">
						{#each [{ range: '1-20', x: '2x' }, { range: '21-40', x: '1.5x' }, { range: '41-50', x: '1.25x' }] as item}
							<div
								class={`rounded-lg border p-2 text-center ${
									currentLv >= parseInt(item.range.split('-')[0]) &&
									currentLv <= parseInt(item.range.split('-')[1].replace('50', '50'))
										? 'border-indigo-600 bg-indigo-500 text-white shadow-sm'
										: 'border-slate-100 bg-white text-slate-400'
								}`}
							>
								<div
									class={`mb-0.5 text-[9px] ${
										currentLv >= parseInt(item.range.split('-')[0]) &&
										currentLv <= parseInt(item.range.split('-')[1])
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
