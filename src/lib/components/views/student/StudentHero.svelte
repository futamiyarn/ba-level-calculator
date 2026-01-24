<script>
	import { CreditCard, GraduationCap, Clipboard, Star } from 'lucide-svelte';
	import { calculateOptimalReports } from '$lib/utils/StudentCalculator';
	import HeroCard from '$lib/components/ui/HeroCard.svelte';

	export let totalExpNeeded = 0;
	export let totalCreditsNeeded = 0;
	export let missingExp = 0;
	export let missingCredits = 0;

	$: missingReports = calculateOptimalReports(missingExp);
</script>

<div class="px-1">
	<HeroCard>
		<!-- Background Effects -->
		<div class="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>
		<div class="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

		<div class="relative z-10 space-y-6">
			<!-- Header -->
			<div class="flex items-center gap-3 border-b border-white/10 pb-4">
				<div class="rounded-full bg-slate-800 p-2">
					<GraduationCap size={20} class="text-cyan-400" />
				</div>
				<div>
					<h3 class="text-lg font-bold tracking-tight">Resource Summary</h3>
					<p class="text-xs text-slate-400">Total requirements and deficits</p>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<!-- EXP Section -->
				<div class="space-y-4">
					<div class="space-y-1">
						<div class="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
							<Star size={12} class="text-blue-400" />
							<span>Experience Points</span>
						</div>
						<div class="flex items-baseline justify-between">
							<span class="text-2xl font-bold tracking-tight"
								>{totalExpNeeded.toLocaleString()}</span
							>
							<span class="text-xs font-medium text-slate-500">Total Needed</span>
						</div>
					</div>

					{#if missingExp > 0}
						<div class="rounded-xl bg-rose-500/10 p-3 ring-1 ring-rose-500/20">
							<div class="mb-2 flex items-center justify-between">
								<span class="text-xs font-bold text-rose-300 uppercase">Missing EXP</span>
								<span class="font-mono text-sm font-bold text-rose-400"
									>-{missingExp.toLocaleString()}</span
								>
							</div>

							<!-- Reports Breakdown -->
							<div class="space-y-1.5 border-t border-rose-500/20 pt-2">
								<div class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
									<Clipboard size={10} />
									<span>Recommended Reports</span>
								</div>
								<div class="flex flex-wrap gap-2">
									{#if missingReports.superior > 0}
										<div
											class="flex items-center gap-1 rounded bg-pink-500/20 px-1.5 py-0.5 text-[10px] font-bold text-pink-300"
										>
											{missingReports.superior} Superior
										</div>
									{/if}
									{#if missingReports.advanced > 0}
										<div
											class="flex items-center gap-1 rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold text-orange-300"
										>
											{missingReports.advanced} Advanced
										</div>
									{/if}
									{#if missingReports.normal > 0}
										<div
											class="flex items-center gap-1 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300"
										>
											{missingReports.normal} Normal
										</div>
									{/if}
									{#if missingReports.novice > 0}
										<div
											class="flex items-center gap-1 rounded bg-slate-500/20 px-1.5 py-0.5 text-[10px] font-bold text-slate-300"
										>
											{missingReports.novice} Novice
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Credits Section -->
				<div class="space-y-4">
					<div class="space-y-1">
						<div class="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
							<CreditCard size={12} class="text-yellow-500" />
							<span>Credits</span>
						</div>
						<div class="flex items-baseline justify-between">
							<span class="text-2xl font-bold tracking-tight"
								>{totalCreditsNeeded.toLocaleString()}</span
							>
							<div class="flex items-center gap-1 text-xs font-medium text-slate-500">
								<span>Total Needed</span>
							</div>
						</div>
					</div>

					{#if missingCredits > 0}
						<div class="rounded-xl bg-rose-500/10 p-3 ring-1 ring-rose-500/20">
							<div class="flex items-center justify-between">
								<span class="text-xs font-bold text-rose-300 uppercase">Missing Credits</span>
								<span class="font-mono text-sm font-bold text-rose-400"
									>-{missingCredits.toLocaleString()}</span
								>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</HeroCard>
</div>
