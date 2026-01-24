<script>
	export let title = '';
	export let iconColorClass = 'bg-slate-100 text-slate-600';
</script>

<div class="flex items-center justify-between px-2 pt-2 pb-2">
	<h2 class="flex items-center gap-3 text-xl font-normal text-slate-800">
		{#if $$slots.icon}
			<div class="flex h-10 w-10 items-center justify-center rounded-full {iconColorClass}">
				<slot name="icon" />
			</div>
		{/if}
		<span>{title}</span>
	</h2>
	<div class="flex items-center gap-2">
		<slot name="actions" />
	</div>
</div>
