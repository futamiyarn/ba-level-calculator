<script>
	export let value = 0;
	export let min = 0;
	export let max = 100;
	export let step = 1;
	export let disabled = false;
	export let color = 'cyan'; // cyan, orange, slate

	// Map generic color names to specific Tailwind classes for the accent
	const colors = {
		cyan: 'accent-cyan-500',
		orange: 'accent-orange-500',
		slate: 'accent-slate-600',
		blue: 'accent-blue-500',
		rose: 'accent-rose-500'
	};

	$: colorClass = colors[color] || colors.cyan;
</script>

<input
	type="range"
	{min}
	{max}
	{step}
	{disabled}
	bind:value
	on:input
	on:change
	class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-100 disabled:opacity-50 {colorClass}"
/>
