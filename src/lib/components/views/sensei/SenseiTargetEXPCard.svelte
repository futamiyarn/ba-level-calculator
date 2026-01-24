<script>
	import { Target, Info } from 'lucide-svelte';
	import Collapse from '$lib/components/ui/Collapse.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';

	export let userData = { lv: 1 };
	export let targetLv = 90;
	export let calculations = { days: 0 };
	export let isOpen = false;

	const targetPresets = [30, 50, 70, 80, 90];

	const getTargetDate = (days) => {
		const d = new Date();
		d.setDate(d.getDate() + days);
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
	};
</script>

<Collapse bind:isOpen title="Target: Lv.{targetLv}">
	<!-- Icon Slot -->
	<div
		slot="icon"
		class="flex h-full w-full items-center justify-center rounded-full bg-cyan-100 text-cyan-700"
	>
		<Target size={20} />
	</div>

	<!-- Subtitle Slot -->
	<span slot="subtitle">
		{#if targetLv > userData.lv}
			Est: <span class="font-bold text-cyan-700">{calculations.days} Days</span>
		{:else}
			Reached
		{/if}
	</span>

	<!-- Content -->
	<div class="space-y-4">
		<!-- Prediction -->
		<div class="flex gap-3">
			<div class="flex-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
				<div class="text-[10px] font-bold text-slate-400 uppercase">Days Needed</div>
				<div class="text-2xl font-black text-cyan-600">{calculations.days}</div>
			</div>
			<div class="flex-[1.5] rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
				<div class="text-[10px] font-bold text-slate-400 uppercase">Finish Date</div>
				<div class="mt-1 text-lg font-bold text-slate-700">
					{getTargetDate(calculations.days)}
				</div>
			</div>
		</div>

		<!-- Note -->
		<div class="text-center">
			<p class="flex items-center justify-center gap-1 text-[10px] text-slate-400">
				<Info size={10} /> Calculations exclude Double EXP Campaigns
			</p>
		</div>

		<!-- Slider -->
		<div class="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<label for="target-lv" class="text-[10px] font-bold text-slate-400 uppercase"
					>Target Level</label
				>
				<span class="text-xs font-bold text-cyan-600">Lv. {targetLv}</span>
			</div>
			<Slider
				id="target-lv"
				min={userData.lv + 1}
				max="90"
				bind:value={targetLv}
				disabled={userData.lv >= 90}
				color="cyan"
			/>
			<div class="mt-2 flex justify-between text-[10px] text-slate-400">
				<span>Current: {userData.lv}</span>
				<span>Max: 90</span>
			</div>
		</div>

		<!-- Presets -->
		<div class="flex justify-between gap-2">
			{#each targetPresets as preset}
				<button
					on:click={() => (targetLv = preset)}
					disabled={userData.lv >= preset}
					class={`
					            flex-1 rounded-xl border py-2 text-sm font-bold transition-all
					            ${
												targetLv === preset
													? 'border-cyan-600 bg-cyan-600 text-white shadow-md'
													: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
											}
					            disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-300 disabled:opacity-50
					          `}
				>
					{preset}
				</button>
			{/each}
		</div>
	</div>
</Collapse>
