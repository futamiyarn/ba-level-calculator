<script>
	import { Ticket, CheckCircle2, Lock, AlertCircle, Zap } from 'lucide-svelte';
	import Collapse from '$lib/components/ui/Collapse.svelte';

	export let permitData;
	export let isOpen = false;
</script>

<Collapse bind:isOpen title="Expert Permit">
	<!-- Icon Slot -->
	<div
		slot="icon"
		class="flex h-full w-full items-center justify-center rounded-full bg-purple-100 text-purple-600"
	>
		<Ticket size={20} />
	</div>

	<!-- Subtitle Slot -->
	<span slot="subtitle">
		Total Weekly: <span class="font-bold text-purple-700"
			>{permitData.totalWeekly?.toLocaleString()}</span
		>
	</span>

	<!-- Content -->
	<div>
		<div class="mb-5 text-center">
			<div class="text-[10px] font-bold text-slate-400 uppercase">Total Weekly Income</div>
			<div class="text-3xl font-bold text-slate-800">
				{permitData.totalWeekly?.toLocaleString()}
			</div>
		</div>

		<div class="flex flex-col gap-3">
			<!-- Mission Tasks -->
			<div
				class="flex items-center justify-between rounded-xl border border-purple-100 bg-white p-3 shadow-sm"
			>
				<div class="flex flex-col">
					<div class="flex items-center gap-2">
						<CheckCircle2 size={16} class="text-purple-500" />
						<span class="text-sm font-bold text-slate-700">Mission Tasks</span>
					</div>
					<span class="ml-6 text-[10px] text-slate-400">Daily & Weekly</span>
				</div>
				<span class="text-sm font-bold text-purple-700">+{permitData.taskOnly}</span>
			</div>

			<!-- AP Conversion -->
			<div
				class={`flex items-start justify-between rounded-xl border p-3 transition-all ${
					permitData.isMaxed ? 'border-purple-100 bg-purple-50' : 'border-slate-200 bg-slate-50'
				}`}
			>
				<div class="flex flex-col">
					<div class="flex items-center gap-2">
						{#if permitData.isMaxed}
							<Zap size={16} class="text-purple-500" />
							<span class="text-sm font-bold text-purple-700">AP Conversion</span>
						{:else}
							<Lock size={16} class="text-slate-400" />
							<span class="text-sm font-bold text-slate-500">AP Conversion</span>
						{/if}
					</div>

					<!-- Locked Info -->
					{#if !permitData.isMaxed}
						<span class="mt-0.5 ml-6 flex items-center gap-1 text-[10px] font-medium text-rose-500">
							<AlertCircle size={10} /> Requires Max Level (90)
						</span>
					{:else}
						<span class="ml-6 text-[10px] text-purple-400">1 AP = 1 Permit (Max 12,000)</span>
						<!-- Wasted AP Warning -->
						{#if permitData.wastedAP > 0}
							<div class="mt-1 ml-6 flex items-center gap-1 text-[10px] font-bold text-orange-600">
								<AlertCircle size={10} />
								<span>Max Limit Reached!</span>
							</div>
						{/if}
					{/if}
				</div>

				<div class="text-right">
					<span
						class={`text-sm font-bold ${permitData.isMaxed ? 'text-purple-700' : 'text-slate-400'}`}
					>
						+{permitData.isMaxed
							? permitData.apOnly.toLocaleString()
							: permitData.apPotential.toLocaleString()}
					</span>
					{#if permitData.isMaxed && permitData.wastedAP > 0}
						<div class="text-[9px] font-medium text-orange-500">(capped)</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</Collapse>
