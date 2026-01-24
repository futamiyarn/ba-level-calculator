<script>
	export let color = 'text-cyan-700'; // Default color class
</script>

<div
	class="flex items-center gap-2 px-5 py-3 text-[10px] font-bold tracking-widest uppercase {color}"
>
	<slot />
</div>
