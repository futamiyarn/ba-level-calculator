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
	<!-- Heart Eyes -->
	<path
		d="M8 12.5C6 11 5 9.5 5 8.5C5 7.5 6 6.5 7 6.5C7.5 6.5 8 6.8 8 7.2C8 6.8 8.5 6.5 9 6.5C10 6.5 11 7.5 11 8.5C11 9.5 10 11 8 12.5Z"
		fill="currentColor"
		stroke="none"
	/>
	<path
		d="M16 12.5C14 11 13 9.5 13 8.5C13 7.5 14 6.5 15 6.5C15.5 6.5 16 6.8 16 7.2C16 6.8 16.5 6.5 17 6.5C18 6.5 19 7.5 19 8.5C19 9.5 18 11 16 12.5Z"
		fill="currentColor"
		stroke="none"
	/>
	<!-- Open Mouth -->
	<path d="M8 14a4 4 0 0 0 8 0" />
	<line x1="8" y1="14" x2="16" y2="14" />
</svg>
