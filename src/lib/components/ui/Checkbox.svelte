<script>
	import { Check } from 'lucide-svelte';

	export let checked = false;
	export let disabled = false;
	export let label = '';
</script>

<label
	class="flex cursor-pointer items-center gap-2 {disabled ? 'cursor-not-allowed opacity-50' : ''}"
>
	<div class="relative flex items-center">
		<input type="checkbox" class="peer sr-only" bind:checked {disabled} on:change />
		<div
			class="flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white transition-all peer-checked:border-cyan-500 peer-checked:bg-cyan-500 peer-focus:ring-2 peer-focus:ring-cyan-300"
		>
			<Check size={14} class="text-white opacity-0 transition-opacity peer-checked:opacity-100" />
		</div>
	</div>
	{#if label}
		<span class="text-sm text-slate-700">{label}</span>
	{/if}
</label>
