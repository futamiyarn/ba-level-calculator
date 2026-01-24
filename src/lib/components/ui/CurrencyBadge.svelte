<script>
	export let icon = null; // Component
	export let value = '';
	export let type = 'default'; // default, emerald, orange, purple, blue, rose

	const styles = {
		default: {
			border: 'border-slate-100',
			bg: 'bg-slate-50',
			icon: 'fill-slate-400 text-slate-400',
			text: 'text-slate-500'
		},
		emerald: {
			border: 'border-emerald-100',
			bg: 'bg-emerald-50',
			icon: 'fill-emerald-500 text-emerald-500',
			text: 'text-emerald-700'
		},
		orange: {
			border: 'border-orange-100',
			bg: 'bg-orange-50',
			icon: 'fill-orange-500 text-orange-500',
			text: 'text-orange-700'
		},
		purple: {
			border: 'border-purple-100',
			bg: 'bg-purple-50',
			icon: 'text-purple-500', // Tickets usually not filled
			text: 'text-purple-700'
		},
		blue: {
			border: 'border-blue-100',
			bg: 'bg-blue-50',
			icon: 'fill-blue-400 text-blue-400',
			text: 'text-blue-700'
		},
		rose: {
			border: 'border-rose-100',
			bg: 'bg-rose-50',
			icon: 'fill-rose-100 text-rose-400',
			text: 'text-rose-700'
		}
	};

	$: style = styles[type] || styles.default;
	// Auto-detect style based on value presence if type is default? No, keep explicit.
</script>

<div
	class={`flex items-center gap-1 rounded-md border px-2 py-0.5 transition-all ${style.border} ${style.bg}`}
>
	{#if icon}
		<svelte:component this={icon} size={10} class={style.icon} />
	{/if}
	<span class={`text-xs font-bold ${style.text}`}>{value}</span>
</div>
