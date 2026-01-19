<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { ScanSearch, Upload, Loader2, Keyboard, Crown, History, AlertCircle, Bug, Terminal } from 'lucide-svelte';
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
  let scanStatusText = "Processing..."; 
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
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
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
          'error-callback': () => { console.error("Turnstile Error"); }
        });
      } catch (e) {
        console.error("Gagal merender widget Turnstile", e);
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
    scanStatusText = "Uploading..."; 

    dispatch('requestScan'); 

    setTimeout(() => { if(isScanning) scanStatusText = "Analyzing UI..."; }, 1500);
    setTimeout(() => { if(isScanning) scanStatusText = "Extracting Data..."; }, 4500);
  };

  $: if (scanError || debugResult) {
      isScanning = false;
  }

  const triggerManual = () => {
    manualError = null;
    if (!manualInput.lv) { manualError = "Level is required!"; return; }
    const lvNum = parseInt(manualInput.lv);
    if (lvNum < 1 || lvNum > 90) { manualError = "Level must be between 1 and 90."; return; }

    if (!isMaxLevel) {
      if (manualInput.cur === '' || manualInput.cur === null) { manualError = "Current EXP is required."; return; }
      const curExp = parseInt(manualInput.cur);
      if (curExp < 0) { manualError = "EXP cannot be negative."; return; }
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
    if(fileInput) fileInput.value = '';
    dispatch('resetScanState');
  };
</script>

<div class="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
  
  <div class="text-center py-2">
    <h1 class="text-2xl font-black text-slate-800">Sensei's Planner</h1>
    <p class="text-xs text-slate-500 mt-1">Select an input method to begin</p>
  </div>

  <div class="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
    {#if !isVerified}
      <!-- UNVERIFIED STATE (Sama seperti sebelumnya) -->
      <div class="p-6 bg-slate-50 flex flex-col items-center justify-center gap-3 text-center border-b border-cyan-100 min-h-[120px]">
        {#if config.dev.isDev}
          <button 
            class="px-5 py-3 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 rounded-lg font-bold hover:bg-yellow-200 transition-colors flex items-center gap-2 shadow-sm"
            on:click={handleDevVerify}
          >
            <Bug size={20} class="text-yellow-600" />
            <span>Dev Mode: Bypass Captcha</span>
          </button>
        {:else if config.security.turnstileSiteKey}
          <div class="w-full flex justify-center">
            <div id="turnstile-widget" class="min-h-[65px]"></div>
          </div>
          <div class="text-[10px] text-slate-400 mt-2">Please complete the security check to continue.</div>
        {:else}
          <button 
            class="w-full p-4 flex items-center gap-4 bg-white border border-slate-200 rounded-lg hover:border-cyan-400 transition-all text-left shadow-sm"
            on:click={!isVerifying ? handleVerifyManual : null}
            disabled={isVerifying}
          >
            <div class="flex-1 font-bold text-slate-700 text-sm">Are you Kei?</div>
          </button>
        {/if}
      </div>

    {:else}
      <!-- VERIFIED STATE -->
      <button 
        class="w-full p-4 flex items-center gap-4 bg-gradient-to-r from-cyan-50 to-white hover:from-cyan-100 transition-all text-left animate-in fade-in zoom-in duration-300"
        on:click={() => inputMethod = inputMethod === 'scan' ? null : 'scan'}
      >
        <div class="w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-cyan-200 shrink-0">
          <ScanSearch size={20} />
        </div>
        <div class="flex-1">
          <div class="font-bold text-slate-800">Scan Screenshot (AI)</div>
          <div class="text-[10px] text-slate-500 flex items-center gap-1">
            <span class={scanQuota.allowed ? "text-green-600" : "text-red-500"}>
              Limit: {scanQuota.remaining}/8 this week
            </span>
          </div>
        </div>
        <div class="text-xs font-bold text-cyan-600 bg-white px-2 py-1 rounded border border-cyan-100">Recommended</div>
      </button>

      <!-- SCANNER UI -->
      {#if inputMethod === 'scan'}
        <div transition:slide class="p-4 border-t border-cyan-100 bg-slate-50/50">
          {#if !scanQuota.allowed}
            <div class="text-center p-4 text-red-500 text-xs font-bold bg-red-50 rounded border border-red-100 flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              <span>Weekly scan quota exceeded. Please use Manual Input.</span>
            </div>
          {:else}
            {#if !previewUrl}
              <button 
                class="w-full border-2 border-dashed border-cyan-300 rounded-lg p-6 text-center cursor-pointer hover:bg-cyan-50 transition-colors relative overflow-hidden group"
                on:click={() => fileInput.click()}
              >
                <input bind:this={fileInput} type="file" class="hidden" accept="image/*" on:change={handleFileSelect} />
                <Upload class="mx-auto text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <span class="text-xs font-bold text-slate-600 block">Upload Screenshot</span>
                <span class="text-[10px] text-slate-400 mt-1 block px-4">
                  Make sure <span class="font-bold text-cyan-600">Blue Level Box (Lv)</span> and <span class="font-bold text-cyan-600">EXP Bar</span> are clearly visible.
                </span>
              </button>
            {:else}
              <div class="space-y-3">
                <img src={previewUrl} alt="Preview" class="max-h-40 mx-auto rounded border shadow-sm" />
                
                {#if scanError}
                  <div class="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle size={16} class="shrink-0 mt-0.5" />
                    <div class="flex-1">
                        <span class="font-bold block mb-0.5">Scan Failed</span>
                        <span class="leading-tight">{scanError}</span>
                    </div>
                  </div>
                {/if}

                <!-- DEBUG RESULT SECTION -->
                {#if debugResult}
                  <div class="bg-slate-900 rounded-lg p-3 border border-slate-700 shadow-inner animate-in slide-in-from-bottom-2">
                    <div class="flex items-center gap-2 text-green-400 border-b border-slate-700 pb-2 mb-2">
                      <Terminal size={14} />
                      <span class="text-xs font-bold font-mono">AI Analysis Result</span>
                    </div>
                    <pre class="text-[10px] text-green-300 font-mono overflow-auto max-h-40 whitespace-pre-wrap">{JSON.stringify(debugResult, null, 2)}</pre>
                    <div class="mt-2 pt-2 border-t border-slate-700 text-[9px] text-slate-400">
                      *Check if Lv & Exp are correct.
                    </div>
                  </div>
                {/if}

                <div class="flex gap-2">
                  <button 
                    class="flex-1 py-2 bg-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-300"
                    on:click={resetScan}
                    disabled={isScanning}
                  >Retry</button>
                  
                  <button 
                    class="flex-[2] py-2 bg-cyan-500 text-white rounded text-xs font-bold shadow-lg shadow-cyan-200/50 hover:bg-cyan-600 disabled:opacity-70 flex justify-center items-center gap-2 transition-all"
                    on:click={triggerScan}
                    disabled={isScanning || debugResult}
                  >
                    {#if isScanning} 
                      <Loader2 class="animate-spin" size={14}/> 
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
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <!-- BAGIAN MANUAL INPUT (Tetap sama) -->
  <div class="flex items-center gap-2">
    <div class="h-px bg-slate-200 flex-1"></div>
    <span class="text-[10px] text-slate-400 font-medium uppercase">Or Manual</span>
    <div class="h-px bg-slate-200 flex-1"></div>
  </div>

  <div class="space-y-3">
    <button 
      class={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left ${inputMethod === 'manual' ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-300'}`}
      on:click={() => inputMethod = inputMethod === 'manual' ? null : 'manual'}
    >
      <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
        <Keyboard size={20} />
      </div>
      <div class="flex-1 font-bold text-slate-700">Manual Input</div>
    </button>

    {#if inputMethod === 'manual'}
      <div transition:slide class="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-4">
        <div class="flex justify-end">
          <button 
            on:click={loadSavedData}
            class="text-[10px] flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors font-medium px-2 py-1 rounded hover:bg-blue-50"
          >
            <History size={12} /> Load Last Save
          </button>
        </div>
        <div class="flex gap-3 items-end">
          <div class="w-1/3">
            <label class="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Level</label>
            <input type="number" class="w-full border p-2 rounded text-sm font-bold text-slate-800 text-center bg-slate-50 outline-none focus:border-blue-400" placeholder="85" bind:value={manualInput.lv} on:input={() => manualError = null} />
          </div>
          <div class="flex-1">
            <label class="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Current EXP</label>
            <input type="number" class="w-full border p-2 rounded text-sm text-slate-800 bg-slate-50 outline-none focus:border-blue-400 disabled:bg-slate-100" placeholder="e.g. 12000" bind:value={manualInput.cur} disabled={isMaxLevel} on:input={() => manualError = null} />
          </div>
        </div>
        {#if manualError}
          <div transition:slide class="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-center gap-2 font-medium">
            <AlertCircle size={14} /> {manualError}
          </div>
        {/if}
        <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-200/50" on:click={triggerManual}>Calculate Now</button>
      </div>
    {/if}

    <button class="w-full p-4 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-white hover:border-orange-400 transition-all flex items-center gap-4 text-left group" on:click={triggerPreset}>
      <div class="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"><Crown size={20} /></div>
      <div><div class="font-bold text-slate-800">I'm already Lv 90</div><div class="text-[10px] text-orange-600/70 font-medium">Jump to Expert Permit</div></div>
    </button>
  </div>
</div>
