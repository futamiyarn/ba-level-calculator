<script>
	export let text = '';
	export let position = 'top'; // top, bottom, left, right

	let visible = false;

	const positions = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};
</script>

<div
	class="relative flex items-center justify-center"
	on:mouseenter={() => (visible = true)}
	on:mouseleave={() => (visible = false)}
	role="tooltip"
>
	<slot />

	{#if visible && text}
		<div
			class="absolute z-50 w-max max-w-[120px] rounded-lg bg-slate-800 px-3 py-1.5 text-center text-xs font-bold whitespace-normal text-white shadow-lg {positions[
				position
			]}"
		>
			{text}
			<!-- Arrow -->
			<div
				class="absolute h-2 w-2 rotate-45 bg-slate-800 {position === 'top'
					? 'top-full left-1/2 -mt-1 -translate-x-1/2'
					: ''} {position === 'bottom'
					? 'bottom-full left-1/2 -mb-1 -translate-x-1/2'
					: ''} {position === 'left'
					? 'top-1/2 left-full -ml-1 -translate-y-1/2'
					: ''} {position === 'right' ? 'top-1/2 right-full -mr-1 -translate-y-1/2' : ''}"
			></div>
		</div>
	{/if}
</div>
