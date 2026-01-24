<script>
	export let checked = false;
	export let disabled = false;
	export let label = '';
</script>

<label
	class="flex cursor-pointer items-center justify-between gap-3 {disabled
		? 'cursor-not-allowed opacity-50'
		: ''}"
>
	{#if label}
		<span class="text-sm font-medium text-slate-700">{label}</span>
	{/if}
	<div class="relative">
		<input type="checkbox" class="peer sr-only" bind:checked {disabled} on:change />
		<div
			class="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-cyan-500 peer-focus:ring-4 peer-focus:ring-cyan-300 peer-focus:outline-none
            after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']
            peer-checked:after:translate-x-full peer-checked:after:border-white"
		></div>
	</div>
</label>
