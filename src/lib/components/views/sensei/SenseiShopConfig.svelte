<script>
	import { slide } from 'svelte/transition';
	import { ShoppingBag, Gem, Coins, Zap, Minus, Plus, Info } from 'lucide-svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import CurrencyBadge from '$lib/components/ui/CurrencyBadge.svelte';

	export let config;

	let openInfo = {};

	const toggleInfo = (id, e) => {
		e.stopPropagation();
		openInfo[id] = !openInfo[id];
	};
</script>

<Card>
	<CardHeader color="text-rose-500">
		<ShoppingBag size={12} /> Shop & Refresh
	</CardHeader>

	<div class="flex flex-col">
		<div
			class="flex cursor-pointer flex-col justify-between gap-2 border-b border-slate-50 px-5 py-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
			on:click={() => (config.freeShop = !config.freeShop)}
		>
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-3">
					{#if config.freeShop}
						<div
							class="h-5 w-5 flex-shrink-0 rounded-full border-[6px] border-rose-500 transition-all"
						></div>
					{:else}
						<div
							class="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-400 transition-all"
						></div>
					{/if}
					<div class="flex items-center gap-1.5">
						<span class="text-sm font-medium text-slate-700">Free Shop Pack</span>
						<button
							on:click={(e) => toggleInfo('freeShop', e)}
							class="text-slate-300 transition-colors hover:text-rose-500"
						>
							<Info size={12} />
						</button>
					</div>
				</div>
				{#if openInfo['freeShop']}
					<div
						transition:slide
						class="mt-2 ml-8 max-w-[250px] rounded-lg border border-slate-100/50 bg-slate-50 p-2"
					>
						<p class="text-[10px] leading-tight text-slate-500">
							Claim in Buy Pyroxene &gt; Packs.
						</p>
					</div>
				{/if}
			</div>
			<div
				class={`ml-8 flex items-center gap-1 transition-opacity sm:ml-0 ${config.freeShop ? 'opacity-100' : 'opacity-40 grayscale'}`}
			>
				<CurrencyBadge icon={Zap} value={10} type={config.freeShop ? 'emerald' : 'default'} />
			</div>
		</div>

		<div class="flex flex-col gap-3 border-b border-slate-50 px-5 py-3">
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<div class="flex flex-col">
						<div class="flex items-center gap-1.5">
							<span
								class="flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors"
							>
								<Coins
									size={14}
									class={`transition-colors ${config.pvpRefreshes > 0 ? 'fill-rose-100 text-rose-400' : 'fill-slate-100 text-slate-300 grayscale'}`}
								/> Tactical Challenge Shop
							</span>
							<button
								on:click={(e) => toggleInfo('pvp', e)}
								class="text-slate-300 transition-colors hover:text-rose-500"
							>
								<Info size={12} />
							</button>
						</div>
						<span class="text-[10px] text-slate-400">90 AP/buy</span>
					</div>

					<CurrencyBadge
						icon={Zap}
						value={`+${config.pvpRefreshes * 90}`}
						type={config.pvpRefreshes > 0 ? 'emerald' : 'default'}
					/>
				</div>

				{#if openInfo['pvp']}
					<div
						transition:slide
						class="ml-8 max-w-[250px] rounded-lg border border-slate-100/50 bg-slate-50 p-2"
					>
						<p class="text-[10px] leading-tight text-slate-500">
							Buy AP packs using TC Coins (PvP).
						</p>
					</div>
				{/if}
			</div>
			<!-- PVP Slider -->
			<div class="flex items-center gap-3">
				<Slider min={0} max={4} bind:value={config.pvpRefreshes} color="rose" />
				<span
					class={`w-8 text-center text-lg font-bold transition-colors ${config.pvpRefreshes > 0 ? 'text-slate-700' : 'text-slate-400'}`}
				>
					{config.pvpRefreshes}
				</span>
			</div>
		</div>

		<div class="flex flex-col gap-3 px-5 py-3">
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<div class="flex flex-col">
						<div class="flex items-center gap-1.5">
							<span
								class="flex items-center gap-1 text-sm font-medium text-slate-700 transition-colors"
							>
								<Gem
									size={12}
									class={`transition-colors ${config.pyroRefreshes > 0 ? 'fill-blue-400 text-blue-400' : 'fill-slate-300 text-slate-300 grayscale'}`}
								/> Pyroxene Refresh
							</span>
							<button
								on:click={(e) => toggleInfo('pyro', e)}
								class="text-slate-300 transition-colors hover:text-blue-500"
							>
								<Info size={12} />
							</button>
						</div>
						<span class="text-[10px] text-slate-400">120 AP/buy</span>
					</div>

					<CurrencyBadge
						icon={Zap}
						value={`+${config.pyroRefreshes * 120}`}
						type={config.pyroRefreshes > 0 ? 'emerald' : 'default'}
					/>
				</div>

				{#if openInfo['pyro']}
					<div
						transition:slide
						class="ml-8 max-w-[250px] rounded-lg border border-slate-100/50 bg-slate-50 p-2"
					>
						<p class="text-[10px] leading-tight text-slate-500">Buy 120 AP using Pyroxene.</p>
					</div>
				{/if}
			</div>
			<!-- Pyro Slider -->
			<div class="flex items-center gap-3 pb-3">
				<Slider min={0} max={20} bind:value={config.pyroRefreshes} color="blue" />
				<span
					class={`w-8 text-center text-lg font-bold transition-colors ${config.pyroRefreshes > 0 ? 'text-slate-700' : 'text-slate-400'}`}
				>
					{config.pyroRefreshes}
				</span>
			</div>
			<div class="flex flex-wrap justify-center gap-1.5">
				<button
					on:click={() => (config.pyroRefreshes = 0)}
					class={`
            rounded-md px-2 py-1 text-[10px] font-bold transition-colors
            ${
							config.pyroRefreshes === 0
								? 'bg-blue-500 text-white'
								: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
						}
          `}
				>
					0
				</button>
				{#each [3, 6, 9, 12, 15, 20] as count}
					<button
						on:click={() => (config.pyroRefreshes = count)}
						class={`
              rounded-md px-2 py-1 text-[10px] font-bold transition-colors
              ${
								config.pyroRefreshes === count
									? 'bg-blue-500 text-white'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
							}
            `}
					>
						{count}
					</button>
				{/each}
			</div>
		</div>
	</div>
</Card>
