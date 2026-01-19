<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import {
		ScanSearch,
		Upload,
		Loader2,
		Keyboard,
		Crown,
		History,
		AlertCircle,
		Bug,
		Terminal
	} from 'lucide-svelte';
	import { storage } from '$lib/utils/storage';
	import { getRequiredExp } from '$lib/utils/calculator';
	import { config } from '$lib/config';

	export let scanQuota = { allowed: true, remaining: 0 };
	export let isVerified = false;
	export let scanError = null;

	// Prop baru untuk menerima data debug
	export let debugResult = null;

	const dispatch = createEventDispatcher();

	let inputMethod = null;
	let manualInput = { lv: '', cur: '' };
	let fileInput;

	let previewUrl = null;
	let currentBase64 = null;
	let isScanning = false;
	let scanStatusText = 'Processing...';
	let manualError = null;
	let isVerifying = false;

	onMount(() => {
		loadSavedData();
		if (!isVerified) {
			initTurnstile();
		}
	});

	$: if (!isVerified) {
		setTimeout(initTurnstile, 100);
	}

	// --- TURNSTILE LOGIC ---
	const initTurnstile = () => {
		if (typeof window === 'undefined') return;
		if (config.dev.isDev) return;
		if (!config.security.turnstileSiteKey) return;

		if (!document.getElementById('turnstile-script')) {
			const script = document.createElement('script');
			script.id = 'turnstile-script';
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.defer = true;
			script.onload = renderTurnstileWidget;
			document.head.appendChild(script);
		} else if (window.turnstile) {
			renderTurnstileWidget();
		} else {
			setTimeout(renderTurnstileWidget, 500);
		}
	};

	const renderTurnstileWidget = () => {
		if (config.dev.isDev) return;
		const container = document.getElementById('turnstile-widget');
		if (!container) return;

		if (window.turnstile) {
			try {
				container.innerHTML = '';
				window.turnstile.render('#turnstile-widget', {
					sitekey: config.security.turnstileSiteKey,
					theme: 'light',
					callback: (token) => {
						dispatch('verified', { token });
					},
					'expired-callback': () => {},
					'error-callback': () => {
						console.error('Turnstile Error');
					}
				});
			} catch (e) {
				console.error('Gagal merender widget Turnstile', e);
			}
		}
	};

	const loadSavedData = () => {
		const saved = storage.loadUserData();
		if (saved) {
			manualInput.lv = saved.lv;
			manualInput.cur = saved.exp_current === 'MAX' ? '' : saved.exp_current;
			manualError = null;
		}
	};

	$: isMaxLevel = parseInt(manualInput.lv) >= 90;

	$: if (isMaxLevel) {
		manualInput.cur = '';
	}

	// --- HANDLERS ---
	const handleVerifyManual = () => {
		isVerifying = true;
		setTimeout(() => {
			isVerifying = false;
			dispatch('verified');
		}, 1500);
	};

	const handleDevVerify = () => {
		dispatch('verified', { token: 'DEV_TOKEN_BYPASS' });
	};

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		scanError = null;
		if (file) {
			const reader = new FileReader();
			reader.onload = (ev) => {
				previewUrl = ev.target.result;
				currentBase64 = ev.target.result.split(',')[1];
			};
			reader.readAsDataURL(file);
		}
	};

	const triggerScan = async () => {
		if (!currentBase64) return;
		isScanning = true;
		scanError = null;
		scanStatusText = 'Uploading...';

		dispatch('requestScan');

		setTimeout(() => {
			if (isScanning) scanStatusText = 'Analyzing UI...';
		}, 1500);
		setTimeout(() => {
			if (isScanning) scanStatusText = 'Extracting Data...';
		}, 4500);
	};

	$: if (scanError || debugResult) {
		isScanning = false;
	}

	const triggerManual = () => {
		manualError = null;
		if (!manualInput.lv) {
			manualError = 'Level is required!';
			return;
		}
		const lvNum = parseInt(manualInput.lv);
		if (lvNum < 1 || lvNum > 90) {
			manualError = 'Level must be between 1 and 90.';
			return;
		}

		if (!isMaxLevel) {
			if (manualInput.cur === '' || manualInput.cur === null) {
				manualError = 'Current EXP is required.';
				return;
			}
			const curExp = parseInt(manualInput.cur);
			if (curExp < 0) {
				manualError = 'EXP cannot be negative.';
				return;
			}
			const maxExpForLevel = getRequiredExp(lvNum);
			if (curExp >= maxExpForLevel) {
				manualError = `Current EXP (${curExp}) exceeds limit (${maxExpForLevel}).`;
				return;
			}
		}
		const expPayload = isMaxLevel ? 'MAX' : manualInput.cur;
		dispatch('submitManual', { lv: manualInput.lv, cur: expPayload });
	};

	const triggerPreset = () => dispatch('submitPreset');

	const resetScan = () => {
		previewUrl = null;
		currentBase64 = null;
		scanError = null;
		if (fileInput) fileInput.value = '';
		dispatch('resetScanState');
	};
</script>

<div class="animate-in slide-in-from-bottom-4 space-y-6 duration-500">
	<div class="py-2 text-center">
		<h1 class="text-2xl font-black text-slate-800">Sensei's Planner</h1>
		<p class="mt-1 text-xs text-slate-500">Select an input method to begin</p>
	</div>

	<div class="overflow-hidden rounded-xl border border-cyan-100 bg-white shadow-sm">
		{#if !isVerified}
			<!-- UNVERIFIED STATE (Sama seperti sebelumnya) -->
			<div
				class="flex min-h-[120px] flex-col items-center justify-center gap-3 border-b border-cyan-100 bg-slate-50 p-6 text-center"
			>
				{#if config.dev.isDev}
					<button
						class="flex items-center gap-2 rounded-lg border-2 border-yellow-300 bg-yellow-100 px-5 py-3 font-bold text-yellow-800 shadow-sm transition-colors hover:bg-yellow-200"
						on:click={handleDevVerify}
					>
						<Bug size={20} class="text-yellow-600" />
						<span>Dev Mode: Bypass Captcha</span>
					</button>
				{:else if config.security.turnstileSiteKey}
					<div class="flex w-full justify-center">
						<div id="turnstile-widget" class="min-h-[65px]"></div>
					</div>
					<div class="mt-2 text-[10px] text-slate-400">
						Please complete the security check to continue.
					</div>
				{:else}
					<button
						class="flex w-full items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-cyan-400"
						on:click={!isVerifying ? handleVerifyManual : null}
						disabled={isVerifying}
					>
						<div class="flex-1 text-sm font-bold text-slate-700">Are you Kei?</div>
					</button>
				{/if}
			</div>
		{:else}
			<!-- VERIFIED STATE -->
			<button
				class="animate-in fade-in zoom-in flex w-full items-center gap-4 bg-gradient-to-r from-cyan-50 to-white p-4 text-left transition-all duration-300 hover:from-cyan-100"
				on:click={() => (inputMethod = inputMethod === 'scan' ? null : 'scan')}
			>
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-200"
				>
					<ScanSearch size={20} />
				</div>
				<div class="flex-1">
					<div class="font-bold text-slate-800">Scan Screenshot (AI)</div>
					<div class="flex items-center gap-1 text-[10px] text-slate-500">
						<span class={scanQuota.allowed ? 'text-green-600' : 'text-red-500'}>
							Limit: {scanQuota.remaining}/8 this week
						</span>
					</div>
				</div>
				<div
					class="rounded border border-cyan-100 bg-white px-2 py-1 text-xs font-bold text-cyan-600"
				>
					Recommended
				</div>
			</button>

			<!-- SCANNER UI -->
			{#if inputMethod === 'scan'}
				<div transition:slide class="border-t border-cyan-100 bg-slate-50/50 p-4">
					{#if !scanQuota.allowed}
						<div
							class="flex items-center justify-center gap-2 rounded border border-red-100 bg-red-50 p-4 text-center text-xs font-bold text-red-500"
						>
							<AlertCircle size={16} />
							<span>Weekly scan quota exceeded. Please use Manual Input.</span>
						</div>
					{:else if !previewUrl}
						<button
							class="group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-cyan-300 p-6 text-center transition-colors hover:bg-cyan-50"
							on:click={() => fileInput.click()}
						>
							<input
								bind:this={fileInput}
								type="file"
								class="hidden"
								accept="image/*"
								on:change={handleFileSelect}
							/>
							<Upload
								class="mx-auto mb-2 text-cyan-400 transition-transform group-hover:scale-110"
							/>
							<span class="block text-xs font-bold text-slate-600">Upload Screenshot</span>
							<span class="mt-1 block px-4 text-[10px] text-slate-400">
								Make sure <span class="font-bold text-cyan-600">Blue Level Box (Lv)</span> and
								<span class="font-bold text-cyan-600">EXP Bar</span> are clearly visible.
							</span>
						</button>
					{:else}
						<div class="space-y-3">
							<img
								src={previewUrl}
								alt="Preview"
								class="mx-auto max-h-40 rounded border shadow-sm"
							/>

							{#if scanError}
								<div
									class="animate-in slide-in-from-top-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600"
								>
									<AlertCircle size={16} class="mt-0.5 shrink-0" />
									<div class="flex-1">
										<span class="mb-0.5 block font-bold">Scan Failed</span>
										<span class="leading-tight">{scanError}</span>
									</div>
								</div>
							{/if}

							<!-- DEBUG RESULT SECTION -->
							{#if debugResult}
								<div
									class="animate-in slide-in-from-bottom-2 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-inner"
								>
									<div
										class="mb-2 flex items-center gap-2 border-b border-slate-700 pb-2 text-green-400"
									>
										<Terminal size={14} />
										<span class="font-mono text-xs font-bold">AI Analysis Result</span>
									</div>
									<pre
										class="max-h-40 overflow-auto font-mono text-[10px] whitespace-pre-wrap text-green-300">{JSON.stringify(
											debugResult,
											null,
											2
										)}</pre>
									<div class="mt-2 border-t border-slate-700 pt-2 text-[9px] text-slate-400">
										*Check if Lv & Exp are correct.
									</div>
								</div>
							{/if}

							<div class="flex gap-2">
								<button
									class="flex-1 rounded bg-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-300"
									on:click={resetScan}
									disabled={isScanning}>Retry</button
								>

								<button
									class="flex flex-[2] items-center justify-center gap-2 rounded bg-cyan-500 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-200/50 transition-all hover:bg-cyan-600 disabled:opacity-70"
									on:click={triggerScan}
									disabled={isScanning || debugResult}
								>
									{#if isScanning}
										<Loader2 class="animate-spin" size={14} />
										<span>{scanStatusText}</span>
									{:else if debugResult}
										<span>Done (Debug)</span>
									{:else}
										Analyze Image
									{/if}
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</div>

	<!-- BAGIAN MANUAL INPUT (Tetap sama) -->
	<div class="flex items-center gap-2">
		<div class="h-px flex-1 bg-slate-200"></div>
		<span class="text-[10px] font-medium text-slate-400 uppercase">Or Manual</span>
		<div class="h-px flex-1 bg-slate-200"></div>
	</div>

	<div class="space-y-3">
		<button
			class={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${inputMethod === 'manual' ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-300'}`}
			on:click={() => (inputMethod = inputMethod === 'manual' ? null : 'manual')}
		>
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
			>
				<Keyboard size={20} />
			</div>
			<div class="flex-1 font-bold text-slate-700">Manual Input</div>
		</button>

		{#if inputMethod === 'manual'}
			<div
				transition:slide
				class="space-y-4 rounded-xl border border-blue-200 bg-white p-4 shadow-sm"
			>
				<div class="flex justify-end">
					<button
						on:click={loadSavedData}
						class="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
					>
						<History size={12} /> Load Last Save
					</button>
				</div>
				<div class="flex items-end gap-3">
					<div class="w-1/3">
						<label class="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Level</label>
						<input
							type="number"
							class="w-full rounded border bg-slate-50 p-2 text-center text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
							placeholder="85"
							bind:value={manualInput.lv}
							on:input={() => (manualError = null)}
						/>
					</div>
					<div class="flex-1">
						<label class="mb-1 block text-[10px] font-bold text-slate-500 uppercase"
							>Current EXP</label
						>
						<input
							type="number"
							class="w-full rounded border bg-slate-50 p-2 text-sm text-slate-800 outline-none focus:border-blue-400 disabled:bg-slate-100"
							placeholder="e.g. 12000"
							bind:value={manualInput.cur}
							disabled={isMaxLevel}
							on:input={() => (manualError = null)}
						/>
					</div>
				</div>
				{#if manualError}
					<div
						transition:slide
						class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600"
					>
						<AlertCircle size={14} />
						{manualError}
					</div>
				{/if}
				<button
					class="w-full rounded-lg bg-blue-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200/50 hover:bg-blue-600"
					on:click={triggerManual}>Calculate Now</button
				>
			</div>
		{/if}

		<button
			class="group flex w-full items-center gap-4 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-white p-4 text-left transition-all hover:border-orange-400"
			on:click={triggerPreset}
		>
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-hover:scale-110"
			>
				<Crown size={20} />
			</div>
			<div>
				<div class="font-bold text-slate-800">I'm already Lv 90</div>
				<div class="text-[10px] font-medium text-orange-600/70">Jump to Expert Permit</div>
			</div>
		</button>
	</div>
</div>
