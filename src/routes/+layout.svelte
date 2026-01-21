<script>
	import '../app.css';
	import Logo from '$lib/components/ui/Logo.svelte';
</script>

<div class="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
	<!-- Dynamic Background Elements -->
	<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
		<!-- Large Soft Gradient -->
		<div
			class="absolute -top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-cyan-100/30 blur-[120px]"
		></div>
		<div
			class="absolute top-[40%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-100/20 blur-[100px]"
		></div>
		<div
			class="absolute right-[20%] -bottom-[10%] h-[500px] w-[500px] rounded-full bg-indigo-100/20 blur-[80px]"
		></div>

		<!-- Subtle Grid Pattern -->
		<div
			class="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:40px_40px] opacity-20"
		></div>
	</div>

	<!-- Header -->
	<nav
		class="sticky top-0 z-30 flex items-center justify-between border-b border-cyan-100/50 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md"
	>
		<a href="/" class="flex items-center gap-3 transition-opacity hover:opacity-80">
			<Logo class="h-8 w-8 text-cyan-500" />
			<span class="text-lg font-bold tracking-tight text-slate-800">Blue Archive Tools</span>
		</a>

		<!-- Header Actions -->
		<div id="header-actions"></div>
	</nav>

	<!-- Main Content -->
	<main class="relative z-10 mx-auto w-full max-w-xl flex-1 p-4 md:py-8">
		<slot />
	</main>

	<!-- Simple Footer -->
	<footer class="relative z-10 py-6 text-center text-[10px] text-slate-400">
		<p>Blue Archive Planner &copy; {new Date().getFullYear()}</p>
		<p>Fan-made tool. Not affiliated with Nexon/Yostar.</p>
	</footer>
</div>
