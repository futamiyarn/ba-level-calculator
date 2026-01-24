<script>
	import '../app.css';
	import Logo from '$lib/components/ui/Logo.svelte';
	import { Globe, ExternalLink, Check } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	let showLangMenu = false;
	let currentLang = 'EN (US)';

	const languages = [
		{ code: 'EN (US)', label: 'English (US)', disabled: false },
		{ code: 'JP', label: 'Japanese', disabled: true },
		{ code: 'KR', label: 'Korean', disabled: true },
		{ code: 'TH', label: 'Thailand', disabled: true }
	];

	/**
	 * Toggles the visibility of the language selection menu.
	 */
	function toggleLangMenu(e) {
		e.stopPropagation(); // Prevent event from bubbling to window
		showLangMenu = !showLangMenu;
	}

	/**
	 * Selects a language and closes the menu.
	 */
	function selectLang(lang) {
		if (lang.disabled) return;
		currentLang = lang.code;
		showLangMenu = false;
	}

	function closeMenu() {
		showLangMenu = false;
	}
</script>

<svelte:window on:click={closeMenu} />

<div class="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50">
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
		<div class="flex items-center gap-2">
			<!-- Language Selector -->
			<div class="relative">
				<button
					on:click={toggleLangMenu}
					class="relative z-50 flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
				>
					<Globe size={14} />
					<span>{currentLang}</span>
				</button>

				{#if showLangMenu}
					<!-- Dropdown Menu -->
					<div
						transition:slide={{ duration: 200 }}
						on:click|stopPropagation
						class="absolute top-full right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5"
					>
						<div class="flex flex-col p-1">
							{#each languages as lang}
								<button
									on:click={() => selectLang(lang)}
									disabled={lang.disabled}
									class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors
									{lang.disabled
										? 'cursor-not-allowed text-slate-400 opacity-50'
										: 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'}
									{currentLang === lang.code && !lang.disabled ? 'bg-cyan-50 text-cyan-700' : ''}"
								>
									<span>{lang.label}</span>
									{#if currentLang === lang.code}
										<Check size={12} class="text-cyan-600" />
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- External Link -->
			<a
				href="https://futami.my.id"
				target="_blank"
				rel="noopener noreferrer"
				class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-cyan-500"
				title="Visit futami.my.id"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
					<polyline points="15 3 21 3 21 9" />
					<line x1="10" y1="14" x2="21" y2="3" />
				</svg>
			</a>
		</div>
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
