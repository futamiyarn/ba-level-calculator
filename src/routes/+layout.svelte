<script>
	import '../app.css';
	// Kita bisa import font Inter dari Google Fonts atau lokal di sini atau di app.html
</script>

<div class="relative flex min-h-screen flex-col">
	<!-- Header -->
	<nav
		class="sticky top-0 z-30 flex items-center justify-between border-b border-cyan-200 bg-white px-4 py-3 shadow-sm"
	>
		<div class="flex items-center gap-2">
			<div class="rounded bg-cyan-500 p-1 text-sm font-bold text-white italic select-none">BA</div>
			<span class="hidden text-sm font-bold text-slate-700 sm:block">Planner Sensei</span>
		</div>

		<!-- Slot untuk tombol action di header (seperti Reset) -->
		<div id="header-actions"></div>
	</nav>

	<!-- Main Content -->
	<main class="mx-auto w-full max-w-xl flex-1 p-4 md:py-8">
		<slot />
	</main>

	<!-- Simple Footer -->
	<footer class="py-6 text-center text-[10px] text-slate-400">
		<p>Blue Archive Planner &copy; {new Date().getFullYear()}</p>
		<p>Fan-made tool. Not affiliated with Nexon/Yostar.</p>
	</footer>
</div>
