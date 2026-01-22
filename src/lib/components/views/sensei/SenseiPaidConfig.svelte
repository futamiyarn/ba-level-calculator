<script>
	import { CreditCard, Zap } from 'lucide-svelte';
	export let config;
</script>

<section class="rounded-[24px] border border-slate-200 bg-white p-1 shadow-sm">
	<div
		class="flex items-center gap-2 px-5 py-3 text-[10px] font-bold tracking-widest text-slate-700 uppercase"
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
						class="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-400 transition-all"
					></div>
				{/if}
				<span class="text-sm font-medium text-slate-700">2-Week AP Pack</span>
			</div>

			<div
				class={`ml-8 flex items-center gap-1 transition-opacity sm:ml-0 ${config.twoWeekPack ? 'opacity-100' : 'opacity-40 grayscale'}`}
			>
				<div
					class={`flex items-center gap-1 rounded-md border px-2 py-0.5 ${config.twoWeekPack ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}
				>
					<Zap
						size={10}
						class={config.twoWeekPack
							? 'fill-emerald-500 text-emerald-500'
							: 'fill-slate-400 text-slate-400'}
					/>
					<span
						class={`text-xs font-bold ${config.twoWeekPack ? 'text-emerald-700' : 'text-slate-500'}`}
						>150</span
					>
				</div>
			</div>
		</div>

		<div class="px-5 pb-2">
			<p class="text-[10px] text-slate-400 italic">
				* Does not include special offers (limited packs, monthly dash, etc).
			</p>
		</div>
	</div>
</section>
