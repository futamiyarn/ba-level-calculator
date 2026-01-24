<script>
	export let onClick = null;
	export let disabled = false;
	export let className = '';
	export { className as class };

	function handleClick(e) {
		if (onClick && !disabled) {
			onClick(e);
		}
	}
</script>

<button
	on:click={handleClick}
	{disabled}
	class="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 {className}"
>
	<slot />
</button>
