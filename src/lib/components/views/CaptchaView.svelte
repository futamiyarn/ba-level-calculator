<script>
	import { createEventDispatcher } from 'svelte';
	import { Loader2 } from 'lucide-svelte';

	const dispatch = createEventDispatcher();
	let isVerifying = false;

	const handleVerify = () => {
		isVerifying = true;
		// Simulasi delay 1.5 detik sebelum emit event 'success'
		setTimeout(() => {
			isVerifying = false;
			dispatch('success');
		}, 1500);
	};
</script>

<div
	class="animate-in fade-in zoom-in flex min-h-[60vh] flex-col items-center justify-center duration-300"
>
	<div class="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
		<button
			class="group flex w-full cursor-pointer items-center gap-4 rounded border border-slate-300 bg-slate-50 p-4 text-left transition-colors select-none hover:bg-slate-100"
			on:click={!isVerifying ? handleVerify : null}
			disabled={isVerifying}
		>
			{#if isVerifying}
				<Loader2 class="h-8 w-8 shrink-0 animate-spin text-cyan-600" />
			{:else}
				<div
					class="h-8 w-8 shrink-0 rounded border-2 border-slate-300 bg-white group-hover:border-cyan-400"
				></div>
			{/if}
			<span class="text-sm font-medium text-slate-700">Verify you are human</span>
			<img
				src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg"
				class="ml-auto h-5 opacity-30"
				alt="Cloudflare"
			/>
		</button>
		<div class="mt-4 text-center text-[10px] text-slate-400">Security Check by Arona & Plana</div>
	</div>
</div>
