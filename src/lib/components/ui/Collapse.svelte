<script>
	import { slide } from 'svelte/transition';
	import { ChevronDown } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let isOpen = false;
	export let title = '';
	export let subtitle = '';

	const dispatch = createEventDispatcher();

	function toggle() {
		isOpen = !isOpen;
		dispatch('toggle', isOpen);
	}
</script>

<div class="mx-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
	<button
		class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50"
		on:click={toggle}
	>
		<div class="flex flex-1 items-center gap-3 text-left">
			<!-- Icon Slot -->
			{#if $$slots.icon}
				<div
					class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"
				>
					<slot name="icon" />
				</div>
			{/if}

			{#if $$slots.header}
				<slot name="header" />
			{:else}
				<div class="flex flex-col">
					<h3 class="text-sm font-bold text-slate-700">{title}</h3>
					<!-- Compact Description (visible when closed) -->
					{#if !isOpen && subtitle}
						<p transition:slide class="text-[10px] font-medium text-slate-500">
							{subtitle}
						</p>
					{/if}
					{#if !isOpen && $$slots.subtitle}
						<div transition:slide class="text-[10px] font-medium text-slate-500">
							<slot name="subtitle" />
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Actions Slot (e.g. Delete Button) - Visible when open or if no chevron? -->
		<!-- Usually actions are separate. For this style, the whole header is clickable. -->
		<!-- We will put actions to the right of content but left of chevron if needed, or just let user put them in header slot? -->
		<!-- Current implementation of SenseiIncomeAPCard has no actions slot, just chevron. -->
		<!-- But StudentList had actions. Let's keep actions slot but position it carefully. -->

		<div class="flex items-center gap-3">
			{#if $$slots.actions}
				<div on:click|stopPropagation>
					<slot name="actions" />
				</div>
			{/if}

			<ChevronDown
				size={20}
				class={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
			/>
		</div>
	</button>

	{#if isOpen}
		<div transition:slide class="border-t border-slate-100 bg-slate-50/50 p-4">
			<slot />
		</div>
	{/if}
</div>
