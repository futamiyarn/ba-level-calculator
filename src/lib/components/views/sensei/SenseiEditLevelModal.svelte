<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { getRequiredExp } from '$lib/utils/SenseiCalculator';
	import { storage } from '$lib/utils/storage';
	import { config } from '$lib/config';
	import { Scan, ChevronsUp, Check } from 'lucide-svelte';
	import TextBox from '$lib/components/ui/TextBox.svelte';
	import ScanModal from '$lib/components/ui/ScanModal.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	export let currentLv;
	export let currentExp;

	const dispatch = createEventDispatcher();

	// Component internal state
	let editLv = currentLv;
	let editExp = currentExp === 'MAX' ? 0 : currentExp;

	// Scan State
	let showScanModal = false;
	let scanQuota = { allowed: true, remaining: 3, count: 0, resetTime: null };

	onMount(() => {
		scanQuota = storage.checkScanQuota();
	});

	const getWaitTimeText = (resetTime) => {
		if (!resetTime) return '';
		const now = Date.now();
		const diff = resetTime - now;
		if (diff <= 0) return '';
		const h = Math.floor(diff / (1000 * 60 * 60));
		const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `Wait ${h}h ${m}m`;
	};

	// Reactive calculation for max EXP required for the current level
	$: maxExpForLevel = getRequiredExp(editLv);

	// Level validation logic: ensure EXP is 0 if level is 90 or above
	$: if (editLv >= 90) {
		editExp = 0;
	} else if (editExp === 'MAX') {
		editExp = 0;
	}

	/**
	 * Sets the level to maximum (90).
	 */
	function onMax() {
		editLv = 90;
		editExp = 0;
	}

	/**
	 * Submits the edited level and EXP data.
	 */
	function onOk() {
		const val = editExp === '' || editExp === null ? 0 : editExp;
		const finalExp = editLv >= 90 ? 'MAX' : val === 0 ? 1 : val;
		dispatch('submit', { lv: editLv, cur: finalExp });
	}

	/**
	 * Dispatches a close event to the parent component.
	 */
	function onClose() {
		dispatch('close');
	}

	/**
	 * Triggers the scan modal.
	 */
	function onScan() {
		// Update quota check
		scanQuota = storage.checkScanQuota();
		if (!scanQuota.allowed && !config.dev.isDev) {
			alert('Daily scan limit reached (3/3). Please try again tomorrow or enter manually.');
			return;
		}
		showScanModal = true;
	}

	/**
	 * Handles successful scan results.
	 */
	function handleScanSubmit(e) {
		const { level, exp_current } = e.detail;
		if (level) editLv = parseInt(level);
		if (exp_current !== undefined) editExp = exp_current;
		showScanModal = false;
		// Auto submit after scan? Optional. Let's keep it open for review.
		// onOk();
	}

	/**
	 * Handles input changes for the EXP field with validation.
	 */
	function handleExpInput(e) {
		if (editLv >= 90) return;

		if (e.target.value === '') {
			editExp = '';
			return;
		}
		const val = parseInt(e.target.value);
		editExp = isNaN(val) ? 0 : val;
	}

	// UX Helpers for better input interaction
	function onExpFocus() {
		if (editLv < 90 && editExp === 0) editExp = '';
	}

	function onExpBlur() {
		if (editExp === '') editExp = 0;
	}
</script>

<!-- Removed Hidden File Input -->

<!-- Modal Content -->
<Modal title="Edit Level" on:close>
	<!-- Body -->
	<div class="space-y-4 p-4">
		<!-- Level Input -->
		<div class="space-y-1">
			<label class="text-xs font-bold text-slate-500 uppercase">Sensei Level</label>
			<TextBox type="number" min="1" max="90" bind:value={editLv} suffix="/ 90" />
		</div>

		<!-- EXP Input -->
		<div class="space-y-1">
			<label class="text-xs font-bold text-slate-500 uppercase">Current EXP</label>

			<TextBox
				type="number"
				value={editExp}
				disabled={editLv >= 90}
				on:input={handleExpInput}
				on:focus={onExpFocus}
				on:blur={onExpBlur}
				on:mouseenter={onExpFocus}
				on:mouseleave={onExpBlur}
				suffix="/ {maxExpForLevel === 'MAX' || editLv >= 90
					? 'MAX'
					: maxExpForLevel.toLocaleString()}"
			/>
		</div>
	</div>

	<!-- Footer Actions -->
	<div slot="footer" class="grid grid-cols-3 gap-2">
		<!-- SCAN (AI) -->
		<button
			on:click={onScan}
			disabled={!scanQuota.allowed && !config.dev.isDev}
			class="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 py-3 text-cyan-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-cyan-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
		>
			<Scan size={20} />
			<div class="flex flex-col items-center leading-none">
				<span class="text-xs font-bold">AI Scan</span>
				{#if !config.dev.isDev}
					{#if !scanQuota.allowed}
						<span class="text-[9px] font-bold text-rose-500"
							>{getWaitTimeText(scanQuota.resetTime)}</span
						>
					{:else}
						<span class="text-[9px] text-cyan-600/70">({scanQuota.remaining}/3 left)</span>
					{/if}
				{/if}
			</div>
		</button>

		<!-- MAX -->
		<button
			on:click={onMax}
			class="flex flex-col items-center justify-center gap-1 rounded-xl bg-white py-3 text-purple-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-purple-50 active:scale-95"
		>
			<ChevronsUp size={20} />
			<span class="text-xs font-bold">Max</span>
		</button>

		<!-- OK -->
		<button
			on:click={onOk}
			class="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-800 py-3 text-white shadow-md transition-all hover:bg-slate-700 active:scale-95"
		>
			<Check size={20} />
			<span class="text-xs font-bold">OK</span>
		</button>
	</div>
</Modal>

<!-- Scan Modal Overlay -->
{#if showScanModal}
	<ScanModal
		title="Scan Level & EXP"
		description="Scan your LOBBY or PROFILE screen."
		action="?/scan"
		on:close={() => (showScanModal = false)}
		on:submit={handleScanSubmit}
	/>
{/if}
