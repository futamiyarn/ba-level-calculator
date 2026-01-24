<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { Filter, ArrowUp, ArrowDown, ChevronDown } from 'lucide-svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';

	export let showBouquets = true;
	export let showLimited = false;
	export let showAll = false;
	export let sortBy = 'default'; // 'default', 'exp', 'rarity'
	export let sortOrder = 'desc'; // 'desc', 'asc'

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function applyFilters() {
		dispatch('apply', { showBouquets, showLimited, showAll, sortBy, sortOrder });
		close();
	}
</script>

<Modal title="Gift Options" on:close>
	<div class="flex flex-col gap-6 p-4">
		<!-- Sorting Section -->
		<div class="space-y-3">
			<h3 class="text-xs font-bold tracking-wider text-slate-400 uppercase">Sorting</h3>
			<div class="grid grid-cols-2 gap-3">
				<div class="col-span-2">
					<div class="relative">
						<select
							bind:value={sortBy}
							class="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 p-3 pr-10 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
						>
							<option value="default">Default Order</option>
							<option value="exp">By Points (EXP)</option>
							<option value="rarity">By Rarity</option>
						</select>
						<div
							class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500"
						>
							<ChevronDown size={20} />
						</div>
					</div>
				</div>
				<button
					class="flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all {sortOrder ===
					'desc'
						? 'border-cyan-500 bg-cyan-50 text-cyan-700'
						: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
					on:click={() => (sortOrder = 'desc')}
				>
					<ArrowDown size={16} />
					<span>High to Low</span>
				</button>
				<button
					class="flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all {sortOrder ===
					'asc'
						? 'border-cyan-500 bg-cyan-50 text-cyan-700'
						: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
					on:click={() => (sortOrder = 'asc')}
				>
					<ArrowUp size={16} />
					<span>Low to High</span>
				</button>
			</div>
		</div>

		<div class="h-px w-full bg-slate-100"></div>

		<!-- Filters Section -->
		<div class="space-y-4">
			<h3 class="text-xs font-bold tracking-wider text-slate-400 uppercase">Filters</h3>

			<Switch label="Show Bouquets" bind:checked={showBouquets} />
			<Switch label="Show Limited Gifts" bind:checked={showLimited} />
			<Switch label="Show All Gifts" bind:checked={showAll} />
		</div>
	</div>

	<div slot="footer">
		<button
			on:click={applyFilters}
			class="w-full rounded-xl bg-cyan-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-200 transition-transform hover:scale-[1.02] hover:bg-cyan-500 active:scale-[0.98]"
		>
			Apply Filters
		</button>
	</div>
</Modal>
