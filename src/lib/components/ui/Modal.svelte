<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { X, Filter } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';

	export let title = 'Modal';
	export let subtitle = '';
	export let onScroll = null; // Optional scroll handler for infinite scrolling

	const dispatch = createEventDispatcher();

	onMount(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	});

	function close() {
		dispatch('close');
	}

	function handleScroll(e) {
		if (onScroll) {
			const { scrollTop, scrollHeight, clientHeight } = e.target;
			if (scrollHeight - scrollTop <= clientHeight + 100) {
				onScroll();
			}
		}
	}
</script>

<div
	class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
	transition:fade={{ duration: 200 }}
	on:click={close}
	role="dialog"
	aria-modal="true"
>
	<div
		class="relative flex h-auto max-h-[75vh] w-full max-w-lg flex-col overflow-hidden overscroll-contain rounded-2xl bg-white shadow-2xl sm:max-h-[85vh]"
		transition:fly={{ y: 20, duration: 300 }}
		on:click|stopPropagation
		role="document"
	>
		<!-- Header -->
		<div
			class="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2"
		>
			<div>
				<h2 class="text-base font-bold text-slate-700">{title}</h2>
				{#if subtitle}
					<p class="text-[10px] text-slate-400">{subtitle}</p>
				{/if}
			</div>
			<div class="flex items-center gap-1">
				<button
					on:click={close}
					class="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
					aria-label="Close modal"
				>
					<X size={20} />
				</button>
			</div>
		</div>

		<!-- Fixed Header Slot (e.g. Search, Filters) -->
		{#if $$slots.header}
			<div class="flex-shrink-0 border-b border-slate-100 bg-white">
				<slot name="header" />
			</div>
		{/if}

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto p-3" on:scroll={handleScroll}>
			<slot />
		</div>

		<!-- Footer -->
		{#if $$slots.footer}
			<div class="border-t border-slate-100 bg-slate-50 p-3">
				<slot name="footer" />
			</div>
		{/if}
	</div>
</div>
