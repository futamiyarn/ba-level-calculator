<script>
	import { ChevronDown } from 'lucide-svelte';

	export let value;
	export let options = []; // Array of objects { value, label } or strings
	export let id = null;
	export let disabled = false;

	// Helper to normalize options
	$: normalizedOptions = options.map((opt) =>
		typeof opt === 'object' ? opt : { value: opt, label: opt }
	);
</script>

<div class="relative w-full">
	<select
		{id}
		bind:value
		{disabled}
		class="w-full appearance-none rounded-xl border border-slate-200 bg-white p-2.5 pr-10 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:bg-slate-100 disabled:opacity-50"
	>
		{#each normalizedOptions as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
		<ChevronDown size={16} />
	</div>
</div>
