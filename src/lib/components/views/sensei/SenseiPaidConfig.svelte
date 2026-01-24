<script>
	import { CreditCard, Zap } from 'lucide-svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CurrencyBadge from '$lib/components/ui/CurrencyBadge.svelte';

	export let config;
</script>

<Card>
	<CardHeader color="text-slate-700">
		<CreditCard size={12} /> Paid Services
	</CardHeader>

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
				<CurrencyBadge icon={Zap} value={150} type={config.twoWeekPack ? 'emerald' : 'default'} />
			</div>
		</div>

		<div class="px-5 pb-2">
			<p class="text-[10px] text-slate-400 italic">
				* Does not include special offers (limited packs, monthly dash, etc).
			</p>
		</div>
	</div>
</Card>
