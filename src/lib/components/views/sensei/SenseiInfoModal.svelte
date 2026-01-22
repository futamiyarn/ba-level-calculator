<script>
	import { createEventDispatcher } from 'svelte';
	import { X, AlertCircle } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	function onClose() {
		dispatch('close');
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4"
	transition:fade={{ duration: 200 }}
>
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
		on:click={onClose}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Escape' && onClose()}
	></div>

	<!-- Modal Content -->
	<div
		class="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
		in:fly={{ y: 20, duration: 300 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
			<h3 class="flex items-center gap-2 font-bold text-slate-700">
				<AlertCircle size={18} class="text-amber-500" />
				Limitation Info
			</h3>
			<button
				on:click={onClose}
				class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
			>
				<X size={20} />
			</button>
		</div>

		<!-- Body -->
		<div class="space-y-4 p-5">
			<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">
				Not currently calculated:
			</p>
			<ul class="space-y-2">
				<li
					class="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600"
				>
					<span class="font-bold text-amber-500">•</span>
					<span>Day prediction with 2x EXP campaign events.</span>
				</li>
				<li
					class="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600"
				>
					<span class="font-bold text-amber-500">•</span>
					<span>Items collected from specific events.</span>
				</li>
				<li
					class="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600"
				>
					<span class="font-bold text-amber-500">•</span>
					<span>Temporary events or bundles with AP rewards (entered manually).</span>
				</li>
			</ul>
		</div>

		<!-- Footer Actions -->
		<div class="border-t border-slate-100 bg-slate-50 p-4">
			<button
				on:click={onClose}
				class="w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-700 active:scale-95"
			>
				Understood
			</button>
		</div>
	</div>
</div>
