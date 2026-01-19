<script>
	import { ChevronsLeft, ChevronsRight, Minus, Plus } from 'lucide-svelte';

	export let value = 0;
	export let min = 0;
	export let max = 20;
	export let presets = []; // Contoh: [0, 3, 6, 9...]
	export let color = 'blue'; // 'blue' atau 'rose'

	// Helper untuk warna hover berdasarkan prop 'color'
	const hoverColor =
		color === 'rose'
			? 'hover:bg-rose-50 hover:text-rose-600 border-rose-100'
			: 'hover:bg-blue-50 hover:text-blue-600 border-blue-100';

	const activeColor = color === 'rose' ? 'text-rose-700' : 'text-slate-800';

	// Logika Step (+/- 1)
	const step = (amount) => {
		const newVal = value + amount;
		if (newVal >= min && newVal <= max) {
			value = newVal;
		}
	};

	// Logika Jump (Preset)
	const jump = (direction) => {
		if (!presets || presets.length === 0) return;

		if (direction === 'up') {
			const next = presets.find((p) => p > value);
			if (next !== undefined) value = next;
		} else {
			const prev = [...presets].reverse().find((p) => p < value);
			if (prev !== undefined) value = prev;
		}
	};
</script>

<div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
	<!-- Jump Down (<<) -->
	<button
		on:click={() => jump('down')}
		disabled={value <= min}
		class={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors disabled:opacity-40 disabled:hover:bg-white ${hoverColor}`}
	>
		<ChevronsLeft size={16} />
	</button>

	<!-- Step Down (-) -->
	<button
		on:click={() => step(-1)}
		disabled={value <= min}
		class={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors disabled:opacity-40 disabled:hover:bg-white ${hoverColor}`}
	>
		<Minus size={16} />
	</button>

	<!-- Value Display -->
	<div class={`flex-1 text-center text-lg font-bold tabular-nums ${activeColor}`}>
		{value}x
	</div>

	<!-- Step Up (+) -->
	<button
		on:click={() => step(1)}
		disabled={value >= max}
		class={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors disabled:opacity-40 disabled:hover:bg-white ${hoverColor}`}
	>
		<Plus size={16} />
	</button>

	<!-- Jump Up (>>) -->
	<button
		on:click={() => jump('up')}
		disabled={value >= max}
		class={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors disabled:opacity-40 disabled:hover:bg-white ${hoverColor}`}
	>
		<ChevronsRight size={16} />
	</button>
</div>
