<script>
	import { slide } from 'svelte/transition';
	import { Zap, ChevronDown, Info } from 'lucide-svelte';

	export let dailyAP = 0;
	export let weeklyAPEstimate = 0;
	export let isOpen = false;
</script>

<div class="mx-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
	<button
		class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
		on:click={() => (isOpen = !isOpen)}
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
			>
				<Zap size={20} class="fill-emerald-500 text-emerald-500" />
			</div>
			<div class="flex flex-col text-left">
				<h3 class="text-sm font-bold text-slate-700">Income AP</h3>
				<!-- Compact Description -->
				{#if !isOpen}
					<p transition:slide class="text-[10px] font-medium text-slate-500">
						Daily: <span class="font-bold text-slate-700">{dailyAP.toLocaleString()}</span>
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
			<!-- Details -->
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

				<!-- Note -->
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
