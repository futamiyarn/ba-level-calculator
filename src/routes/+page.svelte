<script>
	import Logo from '$lib/components/ui/Logo.svelte';

	const menuItems = [
		{
			category: 'Calculators',
			links: [
				{
					label: 'Sensei EXP & Expert Permit',
					href: '/sensei',
					icon: '📊',
					desc: 'Calculate daily AP, days to max level, and expert permits.'
				},
				{
					label: 'Student Leveling',
					href: '/student',
					icon: '🎓',
					desc: 'Calculate Activity Reports and Credits needed.',
					disabled: false
				},
				{
					label: 'Relationship Level',
					href: '#',
					icon: '💖',
					desc: 'Calculate gifts and AP for bond levels. (Coming Soon)',
					disabled: true
				}
			]
		}
	];
</script>

<svelte:head>
	<title>Blue Archive Tools</title>
</svelte:head>

<div
	class="animate-fade-in mx-auto flex min-h-[80vh] w-full max-w-md flex-col items-center justify-center space-y-8"
>
	<!-- Header -->
	<div class="flex flex-col items-center space-y-3 text-center">
		<div class="rounded-full border border-cyan-100 bg-white p-3 shadow-md">
			<Logo class="h-16 w-16 text-cyan-500" />
		</div>
		<div>
			<h1 class="text-2xl font-bold text-slate-800">Blue Archive Tools</h1>
			<p class="text-sm text-slate-500">Unofficial planning tools for Sensei</p>
		</div>
	</div>

	<!-- Menu Links -->
	<div class="w-full space-y-6">
		{#each menuItems as section}
			<div class="space-y-3">
				<h2 class="text-center text-xs font-bold tracking-wider text-slate-400 uppercase">
					{section.category}
				</h2>

				<div class="flex flex-col gap-3">
					{#each section.links as link}
						<a
							href={link.href}
							class="group relative flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all duration-200
								{link.disabled
								? 'cursor-not-allowed opacity-60 grayscale'
								: 'hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md active:scale-[0.98]'}"
							on:click={(e) => link.disabled && e.preventDefault()}
						>
							<span class="text-2xl transition-transform group-hover:scale-110">{link.icon}</span>
							<div class="flex-1 text-left">
								<h3 class="font-bold text-slate-700 group-hover:text-cyan-600">{link.label}</h3>
								<p class="text-xs leading-tight text-slate-500">{link.desc}</p>
							</div>
							{#if !link.disabled}
								<div
									class="-translate-x-2 text-cyan-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
									>
								</div>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Footer Links -->
	<div class="flex gap-4 pt-4">
		<a
			href="https://github.com"
			target="_blank"
			rel="noreferrer"
			class="p-2 text-slate-400 transition-colors hover:text-slate-700"
		>
			<span class="sr-only">GitHub</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 4-1 9 2.5 1 2.5 2.5 5 2.5 5-2.5 5-2.5 9 2.5 0 0-1 4-1 9-2.5 1-2.5 2.5 5 2.5 5-.27 1.02-.27 2.33 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
				/><path d="M9 18c-4.51 2-5-2-7-2" /></svg
			>
		</a>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f8fafc; /* Slate-50 */
	}
	.animate-fade-in {
		animation: fadeIn 0.5s ease-out forwards;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
