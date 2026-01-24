<script>
	export let size = 24;
	export let strokeWidth = 2;
	let customClass = '';
	export { customClass as class };

	$: effectiveStrokeWidth = size < 20 ? 1.5 : strokeWidth;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={effectiveStrokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	class="lucide-icon {customClass}"
	{...$$restProps}
>
	<circle cx="12" cy="12" r="10" />
	<!-- XD Eyes: > < -->
	<!-- Left Eye (>) -->
	<path d="M7.5 8.5l3 1.5-3 1.5" />
	<!-- Right Eye (<) -->
	<path d="M16.5 8.5l-3 1.5 3 1.5" />
	<!-- Open Mouth (Laughing) -->
	<path d="M16 14c-0.5 2-2 3-4 3s-3.5-1-4-3Z" />
</svg>
