<script>
	export let title;
</script>

<div class="flex items-center justify-between px-4 pt-4">
	<h2 class="text-2xl font-normal text-slate-800">{title}</h2>
	<div class="flex items-center gap-2">
		<slot />
	</div>
</div>
