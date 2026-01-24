<script>
	import { Settings, Heart, Target } from 'lucide-svelte';
	import TextBox from '$lib/components/ui/TextBox.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

	export let student;
	export let currentRank = 1;
	export let targetRank = 9;

	const setTarget = (val) => {
		targetRank = val;
	};

	$: if (currentRank >= targetRank) {
		targetRank = currentRank + 1;
	}
</script>

<div class="space-y-4 pt-2">
	<SectionHeader title="Configuration">
		<Settings slot="icon" size={20} />
	</SectionHeader>

	<div class="px-1">
		<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<!-- Current Relationship -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<label class="text-xs font-bold text-slate-400 uppercase" for="current-rank"
							>Current Rank</label
						>
					</div>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-500"
						>
							<Heart size={16} />
						</div>
						<TextBox
							type="number"
							id="current-rank"
							min="1"
							max="100"
							textClass="text-sm font-bold"
							class="!py-2"
							bind:value={currentRank}
							suffix="/ 100"
						/>
					</div>
				</div>

				<!-- Target Relationship -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<label class="text-xs font-bold text-slate-400 uppercase" for="target-rank"
							>Target Rank</label
						>
					</div>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600"
						>
							<Target size={16} />
						</div>
						<TextBox
							type="number"
							id="target-rank"
							min={currentRank + 1}
							max="100"
							textClass="text-sm font-bold"
							class="!py-2"
							bind:value={targetRank}
							suffix="/ 100"
						/>
					</div>

					<!-- Quick Select Buttons -->
					<div class="flex flex-wrap justify-center gap-1.5 pt-1">
						{#if student.live2d_lvl}
							<button
								on:click={() => setTarget(student.live2d_lvl)}
								disabled={student.live2d_lvl <= currentRank}
								class="rounded-md px-2 py-1 text-[10px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 {targetRank ===
								student.live2d_lvl
									? 'bg-cyan-600 text-white'
									: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'}"
							>
								L2D: {student.live2d_lvl}
							</button>
						{/if}
						{#each [15, 20, 50, 75, 100] as lv}
							<button
								on:click={() => setTarget(lv)}
								disabled={lv <= currentRank}
								class="rounded-md px-2 py-1 text-[10px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 {targetRank ===
								lv
									? 'bg-slate-600 text-white'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
							>
								{lv}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
