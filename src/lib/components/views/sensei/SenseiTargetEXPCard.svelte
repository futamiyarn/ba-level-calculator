<script>
	import { slide } from 'svelte/transition';
	import { Target, ChevronDown, Info } from 'lucide-svelte';

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

<div class="mx-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
	<button
		class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
		on:click={() => (isOpen = !isOpen)}
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700"
			>
				<Target size={20} />
			</div>
			<div class="flex flex-col text-left">
				<h3 class="text-sm font-bold text-slate-700">Target: Lv.{targetLv}</h3>
				<!-- Compact Description -->
				{#if !isOpen}
					<p transition:slide class="text-[10px] font-medium text-slate-500">
						Est: <span class="font-bold text-cyan-700">{calculations.days} Days</span>
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
		<div transition:slide class="border-t border-slate-100 bg-slate-50 p-5">
			<!-- Prediction -->
			<div class="mb-4 flex gap-3">
				<div class="flex-1 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
					<div class="text-[10px] font-bold text-slate-400 uppercase">Days Needed</div>
					<div class="text-2xl font-black text-cyan-600">{calculations.days}</div>
				</div>
				<div
					class="flex-[1.5] rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm"
				>
					<div class="text-[10px] font-bold text-slate-400 uppercase">Finish Date</div>
					<div class="mt-1 text-lg font-bold text-slate-700">
						{getTargetDate(calculations.days)}
					</div>
				</div>
			</div>

			<!-- Note -->
			<div class="mb-4 text-center">
				<p class="flex items-center justify-center gap-1 text-[10px] text-slate-400">
					<Info size={10} /> Calculations exclude Double EXP Campaigns
				</p>
			</div>

			<!-- Slider -->
			<div class="mb-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
				<div class="mb-2 flex justify-between px-1 text-[10px] font-bold text-slate-400">
					<span>Lv.{userData.lv}</span>
					<span>Max 90</span>
				</div>
				<input
					type="range"
					min={userData.lv + 1}
					max="90"
					bind:value={targetLv}
					class="h-4 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-cyan-600 hover:accent-cyan-500"
				/>
			</div>

			<div class="flex justify-between gap-2">
				{#each targetPresets as preset}
					{#if preset < 90}
						<button
							on:click={() => (targetLv = preset)}
							disabled={userData.lv >= preset}
							class={`
                      flex-1 rounded-xl py-2 text-xs font-bold transition-all
                      ${
												targetLv === preset
													? 'bg-cyan-600 text-white shadow-md'
													: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
											}
                      disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-300
                    `}
						>
							{preset}
						</button>
					{/if}
					{#if preset === 90}
						<button
							on:click={() => (targetLv = 90)}
							class={`
                       flex-1 rounded-xl py-2 text-xs font-bold transition-all
                       ${
													targetLv === 90
														? 'bg-cyan-600 text-white shadow-md'
														: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
												}
                     `}
						>
							90
						</button>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
