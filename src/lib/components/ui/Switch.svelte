<script>
	export let checked = false;
	// Label & Sublabel removed for cleaner "Material You" decoupling
	// but can be added back if needed. This focuses on the toggle visual.
</script>

<div class="relative inline-flex cursor-pointer items-center select-none">
	<input type="checkbox" bind:checked class="peer sr-only" />

	<!-- Track -->
	<div
		class="
    h-[32px] w-[52px]
    rounded-full
    border-2 border-slate-400 bg-transparent
    transition-colors duration-300
    ease-in-out peer-checked:border-cyan-600 peer-checked:bg-cyan-600
  "
	></div>

	<!-- Thumb -->
	<div
		class="
    cubic-bezier(0.3, 0.0, 0.2,
    1) absolute
    top-[6px]
    left-[6px]
    h-[20px]
    
    w-[20px] rounded-full bg-slate-400 shadow-sm transition-all duration-300
    
    peer-checked:top-[4px]
    peer-checked:left-[4px]
    peer-checked:h-[24px] peer-checked:w-[24px] peer-checked:translate-x-[20px] peer-checked:bg-white
  "
	>
		<!-- Optional: Check icon inside thumb when active -->
		<div
			class="flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-300 peer-checked:opacity-100"
		>
			<!-- You could add a tiny SVG checkmark here if desired -->
		</div>
	</div>
</div>
