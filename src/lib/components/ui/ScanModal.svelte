<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { X, Scan, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { storage } from '$lib/utils/storage';
	import { config } from '$lib/config';
	import AIScanLimitModal from './AIScanLimitModal.svelte';

	export let action = '?/scan';
	export let title = 'AI Scan';
	export let description = 'Scan your screenshot to automatically fill data.';
	export let imageParamName = 'image';

	const dispatch = createEventDispatcher();

	let fileInput;
	let previewUrl = '';
	let selectedFile = null;
	let isScanning = false;
	let errorMessage = '';
	let scanQuota = { allowed: true, remaining: 3, resetTime: null };
	let isCaptchaVerified = config.dev.isDev; // Bypass captcha in dev mode
	let forceLimitView = false;

	onMount(() => {
		scanQuota = storage.checkScanQuota();
		// Auto-trigger file selection when modal opens
		if (fileInput) fileInput.click();
	});

	/**
	 * Renders the Cloudflare Turnstile widget for security.
	 */
	function turnstileWidget(node) {
		if (config.dev.isDev) return;

		let widgetId;
		const render = () => {
			if (window.turnstile) {
				widgetId = window.turnstile.render(node, {
					sitekey: config.security.turnstileSiteKey,
					callback: () => {
						isCaptchaVerified = true;
					}
				});
			}
		};

		if (window.turnstile) {
			render();
		} else {
			// Poll for it if not ready yet
			const interval = setInterval(() => {
				if (window.turnstile) {
					clearInterval(interval);
					render();
				}
			}, 100);

			return {
				destroy() {
					clearInterval(interval);
					if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
				}
			};
		}

		return {
			destroy() {
				if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
			}
		};
	}

	function onFileSelect(e) {
		const file = e.target.files[0];
		errorMessage = '';
		if (!file) {
			if (!previewUrl) onClose(); // Close if no file and no existing preview
			return;
		}

		selectedFile = file;
		previewUrl = URL.createObjectURL(file);
	}

	function onClose() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		dispatch('close');
	}

	const handleEnhance = ({ formData }) => {
		isScanning = true;
		errorMessage = '';

		// If no file selected but we have a preview (e.g. from prop or previous selection), ensure it's sent?
		// Actually, the input[type=file] handles it. If user cancels file dialog, onFileSelect handles it.
		// But if we're re-submitting... formData grabs the file input.

		return async ({ result }) => {
			isScanning = false;

			if (result.type === 'success') {
				const scanData = result.data.data;

				if (scanData.error) {
					errorMessage = scanData.error;
					return;
				}

				if (!config.dev.isDev) {
					storage.incrementScan();
					scanQuota = storage.checkScanQuota();
				}

				dispatch('submit', scanData);
			} else if (result.type === 'failure') {
				errorMessage = result.data?.error || 'Failed to analyze image. Please try again.';
			} else if (result.type === 'error') {
				errorMessage = 'A server error occurred. Please check your connection.';
			}
		};
	};

	const getWaitTimeText = (resetTime) => {
		if (!resetTime) return '';
		const now = Date.now();
		const diff = resetTime - now;
		if (diff <= 0) return '';
		const h = Math.floor(diff / (1000 * 60 * 60));
		const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `Wait ${h}h ${m}m`;
	};
</script>

<svelte:head>
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

{#if (!scanQuota.allowed && !config.dev.isDev) || forceLimitView}
	<AIScanLimitModal
		resetTime={scanQuota.resetTime || Date.now() + 1000 * 60 * 60 * 4}
		on:close={onClose}
	/>
{:else}
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
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600"
					>
						<Scan size={18} />
					</div>
					<h3 class="font-bold text-slate-700">{title}</h3>
				</div>
				<button
					on:click={onClose}
					class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Body -->
			<form
				method="POST"
				{action}
				enctype="multipart/form-data"
				use:enhance={handleEnhance}
				class="p-6"
			>
				<!-- Hidden File Input -->
				<input
					type="file"
					name={imageParamName}
					accept="image/*"
					class="hidden"
					bind:this={fileInput}
					on:change={onFileSelect}
				/>

				<!-- Image Preview Area -->
				<div
					class="relative mb-6 flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100"
					on:click={() => !isScanning && fileInput.click()}
				>
					{#if previewUrl}
						<img src={previewUrl} alt="Preview" class="h-full w-full object-contain" />
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100"
						>
							<span class="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700"
								>Change Image</span
							>
						</div>
					{:else}
						<div class="flex flex-col items-center gap-2 text-slate-400">
							<ImageIcon size={40} strokeWidth={1.5} />
							<span class="text-xs font-medium">Click to select screenshot</span>
						</div>
					{/if}
				</div>

				{#if errorMessage}
					<div
						class="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600"
					>
						<AlertCircle size={16} class="mt-0.5 flex-shrink-0" />
						<p>{errorMessage}</p>
					</div>
				{/if}

				<!-- Turnstile -->
				{#if !config.dev.isDev}
					<div class="mb-4 flex justify-center">
						<div use:turnstileWidget></div>
					</div>
				{:else}
					<div class="mb-4 flex flex-col items-center justify-center gap-2">
						<div class="rounded bg-yellow-100 px-2 py-1 text-[10px] text-yellow-700">
							Dev Mode: Captcha Bypassed
						</div>
						<button
							type="button"
							class="text-[10px] text-slate-400 underline hover:text-slate-600"
							on:click={() => (forceLimitView = !forceLimitView)}
						>
							Test Limit Modal
						</button>
					</div>
				{/if}

				<!-- Info / Quota -->
				<div class="mb-6 rounded-2xl bg-slate-50 p-4 text-center">
					<p class="text-xs font-medium text-slate-500">
						{description}
					</p>
					<div class="mt-3 flex items-center justify-center gap-2">
						<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500"></div>
						<span class="text-[10px] font-bold tracking-widest text-cyan-600 uppercase">
							{#if !config.dev.isDev}
								{#if !scanQuota.allowed}
									Limit Reached: {getWaitTimeText(scanQuota.resetTime)}
								{:else}
									Quota: {scanQuota.remaining} / 3 Scans Left
								{/if}
							{:else}
								Quota: Unlimited (Dev)
							{/if}
						</span>
					</div>
				</div>

				<!-- Actions -->
				<div class="grid grid-cols-2 gap-3">
					<button
						type="button"
						on:click={onClose}
						class="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!previewUrl ||
							isScanning ||
							(!scanQuota.allowed && !config.dev.isDev) ||
							!isCaptchaVerified}
						class="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-200 transition-all hover:bg-cyan-500 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
					>
						{#if isScanning}
							<Loader2 size={18} class="animate-spin" />
							<span>Analyzing...</span>
						{:else}
							<Scan size={18} />
							<span>Start Scan</span>
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
