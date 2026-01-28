<script>
	import { createEventDispatcher } from 'svelte';
	import { X, Heart, Sparkles } from 'lucide-svelte';

	export let resetTime = null;

	const dispatch = createEventDispatcher();

	let imageError = false;

	function onClose() {
		dispatch('close');
	}

	const getWaitTimeText = (resetTime) => {
		if (!resetTime) return '';
		const now = Date.now();
		const diff = resetTime - now;
		if (diff <= 0) return '';
		const h = Math.floor(diff / (1000 * 60 * 60));
		const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${h}h ${m}m`;
	};
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
		on:click={onClose}
	></div>

	<!-- Modal Content -->
	<div
		class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl transition-all"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
			<div class="flex items-center gap-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
					<Sparkles size={18} />
				</div>
				<h3 class="font-bold text-slate-700">AI Scan Limit</h3>
			</div>
			<button
				on:click={onClose}
				class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
			>
				<X size={20} />
			</button>
		</div>

		<!-- Body -->
		<div class="flex flex-col items-center p-6 text-center">
			<!-- Image in middle -->
			<div
				class="relative mb-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-slate-50"
			>
				{#if !imageError}
					<img
						src="/images/arona_sorry.webp"
						alt="Limit Reached"
						class="h-full w-full object-cover"
						on:error={() => (imageError = true)}
					/>
				{:else}
					<div class="flex items-center justify-center text-slate-300">
						<Sparkles size={48} />
					</div>
				{/if}
			</div>

			<h4 class="mb-2 text-xl font-bold text-slate-800">Daily Limit Reached</h4>
			<p class="mb-6 text-sm leading-relaxed text-slate-500">
				You've used all your AI scans for today.<br />
				Please come back in
				<span class="font-bold text-cyan-600">{getWaitTimeText(resetTime)}</span>.
			</p>

			<div class="w-full space-y-3">
				<!-- Donate Button -->
				<a
					href="https://futami.my.id/donate/"
					target="_blank"
					rel="noopener noreferrer"
					class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF5E5B] py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition-all hover:bg-[#ff4f4c] active:scale-95"
				>
					<Heart size={18} class="fill-white" />
					<span>Donate to Support</span>
				</a>

				<button
					on:click={onClose}
					class="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
				>
					Close
				</button>
			</div>
		</div>
	</div>
</div>
