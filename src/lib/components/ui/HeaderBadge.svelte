<script>
	export let onClick = null;
	export let className = '';
	export { className as class };

	function handleClick(e) {
		if (onClick) {
			onClick(e);
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	on:click={handleClick}
	class="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition-colors {onClick
		? 'cursor-pointer hover:bg-slate-200'
		: ''} {className}"
>
	<slot />
</div>
