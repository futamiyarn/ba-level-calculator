<script>
	import { createEventDispatcher } from 'svelte';
	import { AlertCircle } from 'lucide-svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	const dispatch = createEventDispatcher();

	function onClose() {
		dispatch('close');
	}
</script>

<Modal title="Limitation Info" on:close>
	<div class="space-y-4 p-4">
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

	<div slot="footer">
		<button
			on:click={onClose}
			class="w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-700 active:scale-95"
		>
			Understood
		</button>
	</div>
</Modal>
