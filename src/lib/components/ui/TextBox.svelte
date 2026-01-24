<script>
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let value;
	export let id = null;
	export let type = 'text';
	export let placeholder = '';
	export let disabled = false;
	export let min = null;
	export let max = null;
	export let suffix = null;
	export let clearable = false;

	let className = '';
	export { className as class };
	export let rootClass = 'w-full';
	export let textClass = 'text-lg font-bold';

	function handleClear() {
		value = type === 'number' ? 0 : '';
		dispatch('clear');
	}

	$: isClearVisible = clearable && value !== (type === 'number' ? 0 : '') && value !== null;
	$: isSuffixVisible = suffix && (!clearable || !isClearVisible);
</script>

<div class="relative {rootClass}">
	<input
		{id}
		{type}
		{min}
		{max}
		bind:value
		{placeholder}
		{disabled}
		on:input
		on:focus
		on:blur
		on:mouseenter
		on:mouseleave
		class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 placeholder-slate-300 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50 {isClearVisible
			? 'pr-9'
			: isSuffixVisible
				? 'pr-12'
				: 'pr-4'} {textClass} {className}"
	/>
	{#if isSuffixVisible}
		<span
			class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400/70 {textClass}"
		>
			{suffix}
		</span>
	{/if}

	{#if isClearVisible}
		<button
			type="button"
			on:click={handleClear}
			class="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-slate-200 p-1 text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-500"
		>
			<X size={14} />
		</button>
	{/if}
</div>
