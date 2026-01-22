<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { getRequiredExp } from '$lib/utils/SenseiCalculator';
	import { config } from '$lib/config';
	import { X, Scan, ChevronsUp, Check, Loader2 } from 'lucide-svelte';

	export let currentLv;
	export let currentExp;

	const dispatch = createEventDispatcher();

	// Component internal state
	let editLv = currentLv;
	let editExp = currentExp === 'MAX' ? 0 : currentExp;

	// OCR/Scan State
	let fileInput;
	let showPreview = false;
	let previewUrl = '';
	let selectedFile = null;
	let isCaptchaVerified = config.dev.isDev; // Bypass captcha in dev mode
	let isScanning = false;
	let scanError = '';

	// Reactive calculation for max EXP required for the current level
	$: maxExpForLevel = getRequiredExp(editLv);

	// Level validation logic: ensure EXP is 0 if level is 90 or above
	$: if (editLv >= 90) {
		editExp = 0;
	} else if (editExp === 'MAX') {
		editExp = 0;
	}

	/**
	 * Renders the Cloudflare Turnstile widget for security.
	 */
	function turnstileWidget(node) {
		if (window.turnstile) {
			window.turnstile.render(node, {
				sitekey: config.security.turnstileSiteKey,
				callback: () => {
					isCaptchaVerified = true;
				}
			});
		}
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
	 * Triggers the hidden file input for scanning.
	 */
	function onScan() {
		fileInput.click();
	}

	/**
	 * Handles file selection for OCR scan.
	 */
	function onFileSelect(e) {
		const file = e.target.files[0];
		if (!file) return;

		selectedFile = file;
		previewUrl = URL.createObjectURL(file);
		showPreview = true;
		isCaptchaVerified = config.dev.isDev; // Bypass captcha in dev mode
		scanError = '';

		// Reset input value to allow selecting the same file again
		e.target.value = '';
	}

	/**
	 * Closes the scan preview modal and cleans up resources.
	 */
	function closePreview() {
		showPreview = false;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = '';
		selectedFile = null;
		scanError = '';
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

<svelte:head>
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<!-- Hidden File Input -->
<input type="file" accept="image/*" class="hidden" bind:this={fileInput} on:change={onFileSelect} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<!-- Backdrop -->
	<div
		class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
		on:click={onClose}
	></div>

	<!-- Modal Content -->
	<div
		class="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
			<h3 class="font-bold text-slate-700">Edit Level</h3>
			<button
				on:click={onClose}
				class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
			>
				<X size={20} />
			</button>
		</div>

		<!-- Body -->
		<div class="space-y-4 p-5">
			<!-- Level Input -->
			<div class="space-y-1">
				<label class="text-xs font-bold text-slate-500 uppercase">Sensei Level</label>
				<input
					type="number"
					min="1"
					max="90"
					bind:value={editLv}
					class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-700 focus:border-cyan-500 focus:ring-cyan-500"
				/>
			</div>

			<!-- EXP Input -->
			<div class="space-y-1">
				<div class="flex justify-between">
					<label class="text-xs font-bold text-slate-500 uppercase">Current EXP</label>
					<span class="text-xs font-medium text-cyan-600">
						Max Req: {maxExpForLevel === 'MAX' || editLv >= 90
							? 'MAX'
							: maxExpForLevel.toLocaleString()}
					</span>
				</div>

				<input
					type="number"
					value={editExp}
					disabled={editLv >= 90}
					on:input={handleExpInput}
					on:focus={onExpFocus}
					on:blur={onExpBlur}
					on:mouseenter={onExpFocus}
					on:mouseleave={onExpBlur}
					class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-700 focus:border-cyan-500 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50"
				/>
			</div>
		</div>

		<!-- Footer Actions -->
		<div class="grid grid-cols-3 gap-2 border-t border-slate-100 bg-slate-50 p-4">
			<!-- SCAN (AI) -->
			<button
				on:click={onScan}
				class="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 py-3 text-cyan-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-cyan-50 active:scale-95"
			>
				<Scan size={20} />
				<span class="text-xs font-bold">AI Scan</span>
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
	</div>

	<!-- Preview Modal Overlay -->
	{#if showPreview}
		<div class="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
			<div class="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl">
				<h3 class="mb-3 font-bold text-slate-700">Confirm Scan</h3>

				<!-- Image Preview -->
				<div class="mb-4 overflow-hidden rounded-lg bg-slate-100">
					<img src={previewUrl} alt="Preview" class="h-48 w-full object-contain" />
				</div>

				<!-- Error Message -->
				{#if scanError}
					<div class="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">
						{scanError}
					</div>
				{/if}

				<!-- Turnstile -->
				{#if !config.dev.isDev}
					<div class="mb-4 flex justify-center">
						<div use:turnstileWidget></div>
					</div>
				{:else}
					<div class="mb-4 flex justify-center">
						<div class="rounded bg-yellow-100 px-2 py-1 text-[10px] text-yellow-700">
							Dev Mode: Captcha Bypassed
						</div>
					</div>
				{/if}

				<!-- Actions -->
				<form
					method="POST"
					action="?/scan"
					enctype="multipart/form-data"
					use:enhance={({ formData }) => {
						isScanning = true;
						scanError = '';
						formData.append('image', selectedFile);

						return async ({ result }) => {
							isScanning = false;
							if (result.type === 'success' && result.data?.data) {
								const { level, exp_current, error } = result.data.data;

								if (error) {
									scanError = error;
									return;
								}

								// Update state
								if (level) editLv = parseInt(level);
								// If 0, check if we should show MAX or 0. Logic handles it.
								if (exp_current !== undefined) editExp = exp_current;

								// Close preview and auto submit
								closePreview();
								onOk();
							} else if (result.type === 'failure') {
								scanError = result.data?.error || 'Scan failed. Please try again.';
							} else {
								scanError = 'Unexpected error occurred.';
							}
						};
					}}
					class="grid grid-cols-2 gap-2"
				>
					<button
						type="button"
						on:click={closePreview}
						class="rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
					>
						Cancel
					</button>

					<button
						type="submit"
						disabled={!isCaptchaVerified || isScanning}
						class="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-300"
					>
						{#if isScanning}
							<Loader2 size={16} class="animate-spin" />
							<span>Scanning...</span>
						{:else}
							<Scan size={16} />
							<span>Start Scan</span>
						{/if}
					</button>
				</form>
			</div>
		</div>
	{/if}
</div>
