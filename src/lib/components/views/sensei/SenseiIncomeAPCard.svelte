<script>
	import { Zap, Info } from 'lucide-svelte';
	import Collapse from '$lib/components/ui/Collapse.svelte';
	import CurrencyBadge from '$lib/components/ui/CurrencyBadge.svelte';

	export let dailyAP = 0;
	export let weeklyAPEstimate = 0;
	export let isOpen = false;
</script>

<Collapse bind:isOpen title="Income AP">
	<!-- Icon Slot -->
	<div
		slot="icon"
		class="flex h-full w-full items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
	>
		<Zap size={20} class="fill-emerald-500 text-emerald-500" />
	</div>

	<!-- Subtitle Slot -->
	<span slot="subtitle">
		Daily: <span class="font-bold text-slate-700">{dailyAP.toLocaleString()}</span>
	</span>

	<!-- Content -->
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
		<div class="mt-3 flex justify-center">
			<CurrencyBadge
				icon={Info}
				value="Excludes maintenance/event gifts from developer"
				type="default"
			/>
		</div>
	</div>
</Collapse>
