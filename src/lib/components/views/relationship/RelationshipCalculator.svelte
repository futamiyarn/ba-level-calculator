<script>
	/**
	 * RelationshipCalculator Component
	 * Logic for calculating gift requirements and rendering the gift planning grid.
	 */
	import { Filter, Package } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import FaceXD from '$lib/components/ui/icons/FaceXD.svelte';
	import FaceHeartEyes from '$lib/components/ui/icons/FaceHeartEyes.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import GiftItem from './GiftItem.svelte';
	import {
		calculateRelationshipExpNeeded,
		calculateRankAfterExp,
		GiftExp
	} from '$lib/utils/RelationshipCalculator';

	export let student;
	export let allGifts = [];
	export let currentRank = 1;
	export let targetRank = 9;

	// Filter Props
	export let showBouquets = true;
	export let showLimited = false;
	export let showAll = false;
	export let sortBy = 'default';
	export let sortOrder = 'desc';

	const dispatch = createEventDispatcher();

	function openFilters() {
		dispatch('openFilter');
	}

	// State for manual input overrides
	let userCounts = {}; // Tracks manual overrides: { [id]: number }

	// Reactive calculation for total EXP needed between ranks
	$: totalExpNeeded = calculateRelationshipExpNeeded(currentRank, targetRank);

	/**
	 * Generates the appropriate image URL for a given gift item
	 */
	function getGiftImageUrl(gift) {
		if (!gift) return '';
		const id = gift.id;

		// Special overrides for certain legacy or event items
		if (id === 5996)
			return 'https://schaledb.com/images/item/full/item_icon_favor_lv2_special.webp';
		if (id === 5997)
			return 'https://schaledb.com/images/item/full/item_icon_favor_lv2_package.webp';
		if (id === 5998) return 'https://schaledb.com/images/item/full/item_icon_favor_ssr_2.webp';
		if (id === 5999) return 'https://schaledb.com/images/item/full/item_icon_favor_ssr_1.webp';
		if (id === 'nexon30') return '/images/gifts/nexon_30_anniversary.webp';

		const numId = parseInt(id);

		if (!isNaN(numId)) {
			if (gift.rarity === 'rare') {
				return `https://schaledb.com/images/item/full/item_icon_favor_${numId - 5000}.webp`;
			}
			if (gift.rarity === 'epic' && numId < 5990) {
				return `https://schaledb.com/images/item/full/item_icon_favor_lv2_${numId - 5100}.webp`;
			}
		}
		return `https://schaledb.com/images/student/icon/${id}.webp`;
	}

	// Filter gifts by student preference and rarity
	$: giftsLovedEpic =
		student?.processedGifts?.filter((g) => g.type === 'love' && g.rarity === 'epic') || [];
	$: giftsLikedEpic =
		student?.processedGifts?.filter((g) => g.type === 'liked' && g.rarity === 'epic') || [];
	$: giftsLovedRare =
		student?.processedGifts?.filter((g) => g.type === 'love' && g.rarity === 'rare') || [];
	$: giftsLikedRare =
		student?.processedGifts?.filter((g) => g.type === 'liked' && g.rarity === 'rare') || [];

	// Filter standard gifts if 'showAll' is enabled
	$: giftsStandardEpic = showAll
		? allGifts.filter(
				(g) =>
					g.rarity === 'epic' &&
					!student?.processedGifts?.some((pg) => pg.id === g.id) &&
					typeof g.id === 'number' &&
					g.id < 5990
			)
		: [];
	$: giftsStandardRare = showAll
		? allGifts.filter(
				(g) =>
					g.rarity === 'rare' &&
					!student?.processedGifts?.some((pg) => pg.id === g.id) &&
					typeof g.id === 'number' &&
					g.id < 5990
			)
		: [];

	// Special items like bouquets and event tickets
	$: specialGiftsOptions = [
		{ id: 5996, name: 'Refreshing Bucket', exp: 240, type: 'bouquet' },
		{ id: 5997, name: 'Beautiful Bucket', exp: 240, type: 'bouquet' },
		{ id: 5999, name: 'Shiny Bucket', exp: 60, type: 'bouquet' },
		{ id: 5998, name: 'Hatsune Miku Photo Card', exp: 60, type: 'limited' },
		{ id: 'nexon30', name: 'Nexon 30th Anniversary Ticket', exp: 60, type: 'limited' }
	].filter((g) => (g.type === 'bouquet' && showBouquets) || (g.type === 'limited' && showLimited));

	// -------------------------------------------------------------------------
	// Unified Data Preparation for Display & Logic
	// -------------------------------------------------------------------------

	// Helper to prepare an item for display
	const mapItem = (item, category, baseExp, rarityRank) => ({
		...item,
		category, // 'special', 'loved-epic', 'liked-epic', 'loved-rare', 'liked-rare', 'standard-epic', 'standard-rare'
		baseExp,
		rarityRank, // 3=Special, 2=Epic, 1=Rare
		imgUrl: getGiftImageUrl(item),
		isVirtual: false
	});

	// Helper to create virtual aggregated items
	const createVirtualItem = (id, name, exp, rarityRank, category) => ({
		id,
		name,
		baseExp: exp,
		rarityRank,
		category,
		isVirtual: true
	});

	$: allDisplayItems = [
		...specialGiftsOptions.map((g) => mapItem(g, 'special', g.exp, 3)),
		...giftsLovedEpic.map((g) => mapItem(g, 'loved-epic', GiftExp.EPIC_LOVED, 2)),
		...giftsLikedEpic.map((g) => mapItem(g, 'liked-epic', GiftExp.EPIC_LIKED, 2)),
		...(showAll
			? giftsStandardEpic.map((g) => mapItem(g, 'standard-epic', GiftExp.EPIC_STANDARD, 2))
			: [
					createVirtualItem(
						'EPIC_STANDARD',
						'Standard Epic',
						GiftExp.EPIC_STANDARD,
						2,
						'standard-epic'
					)
				]),
		...giftsLovedRare.map((g) => mapItem(g, 'loved-rare', GiftExp.RARE_LOVED, 1)),
		...giftsLikedRare.map((g) => mapItem(g, 'liked-rare', GiftExp.RARE_LIKED, 1)),
		...(showAll
			? giftsStandardRare.map((g) => mapItem(g, 'standard-rare', GiftExp.RARE_STANDARD, 1))
			: [
					createVirtualItem(
						'RARE_STANDARD',
						'Standard Rare',
						GiftExp.RARE_STANDARD,
						1,
						'standard-rare'
					)
				])
	];

	// Sorting Logic
	$: sortedDisplayItems = [...allDisplayItems].sort((a, b) => {
		let result = 0;

		if (sortBy === 'exp') {
			result = b.baseExp - a.baseExp;
		} else if (sortBy === 'rarity') {
			result = b.rarityRank - a.rarityRank;
			if (result === 0) result = b.baseExp - a.baseExp; // Tie-break with EXP
		} else {
			// Default Order: Special -> Loved Epic -> Liked Epic -> Loved Rare -> Liked Rare -> Standard Epic -> Standard Rare
			// We can use a priority map
			const priority = {
				special: 100,
				'loved-epic': 90,
				'liked-epic': 80,
				'loved-rare': 70,
				'liked-rare': 60,
				'standard-epic': 50,
				'standard-rare': 40
			};
			result = (priority[b.category] || 0) - (priority[a.category] || 0);
		}

		return sortOrder === 'asc' ? -result : result;
	});

	// Waterfall Calculation (Logic remains on categorized lists for efficiency priority, but applied to display items)
	// We must ensure the `plan` variable is still computed correctly for placeholders.
	// The original `plan` logic iterates in a specific optimal order (Loved -> Liked -> Standard).
	// We KEEP that logic intact to generate the `p` map, which is then used by the display items.
	$: plan = (() => {
		let remaining = totalExpNeeded;
		const p = {};

		// Deduct manual inputs first (iterate over ALL items that might have inputs)
		allDisplayItems.forEach((g) => {
			if (userCounts[g.id] !== undefined && userCounts[g.id] !== '') {
				remaining -= (parseInt(userCounts[g.id]) || 0) * g.baseExp;
			}
		});

		// Helper for waterfall
		const processGroup = (items, expValue, strategy = 'floor') => {
			let lastValidIndex = -1;
			if (strategy === 'ceil_last_item') {
				// Find last item in this group not manually filled
				for (let i = items.length - 1; i >= 0; i--) {
					if (userCounts[items[i].id] === undefined || userCounts[items[i].id] === '') {
						lastValidIndex = i;
						break;
					}
				}
			}

			items.forEach((g, index) => {
				if (userCounts[g.id] !== undefined && userCounts[g.id] !== '') {
					p[g.id] = 0; // Manual overrides placeholder
					return;
				}
				if (remaining <= 0) {
					p[g.id] = 0;
					return;
				}

				let count = 0;
				if (strategy === 'ceil_greedy') {
					count = Math.ceil(remaining / expValue);
				} else if (strategy === 'ceil_last_item' && index === lastValidIndex) {
					count = Math.ceil(remaining / expValue);
				} else {
					count = Math.floor(remaining / expValue);
				}

				p[g.id] = count;
				remaining -= count * expValue;
			});
		};

		// Run waterfall in OPTIMAL EFFICIENCY ORDER (independent of display sort)
		// 1. Loved Epic (240)
		processGroup(
			allDisplayItems.filter((i) => i.category === 'loved-epic'),
			GiftExp.EPIC_LOVED
		);
		// 2. Liked Epic (180)
		processGroup(
			allDisplayItems.filter((i) => i.category === 'liked-epic'),
			GiftExp.EPIC_LIKED
		);
		// 3. Standard Epic (120)
		processGroup(
			allDisplayItems.filter((i) => i.category === 'standard-epic'),
			GiftExp.EPIC_STANDARD
		);
		// 4. Loved Rare (60)
		processGroup(
			allDisplayItems.filter((i) => i.category === 'loved-rare'),
			GiftExp.RARE_LOVED
		);
		// 5. Liked Rare (40)
		processGroup(
			allDisplayItems.filter((i) => i.category === 'liked-rare'),
			GiftExp.RARE_LIKED
		);
		// 6. Standard Rare (20) - fill remainder
		processGroup(
			allDisplayItems.filter((i) => i.category === 'standard-rare'),
			GiftExp.RARE_STANDARD,
			'ceil_greedy'
		);

		return p;
	})();

	const handleInput = (id, e) => {
		const val = e.target.value;
		userCounts = { ...userCounts, [id]: val === '' ? '' : parseInt(val) };
	};

	// Calculate total EXP from manual inputs for status display
	$: currentExp = allDisplayItems.reduce((sum, item) => {
		const count = parseInt(userCounts[item.id]) || 0;
		return sum + count * item.baseExp;
	}, 0);

	$: isComplete = currentExp >= totalExpNeeded;
	$: isOverkill = currentExp > totalExpNeeded;
	$: excessExp = Math.max(0, currentExp - totalExpNeeded);
	$: progressPercent = Math.min(100, (currentExp / totalExpNeeded) * 100);

	// Calculate what rank the user would actually reach with the current EXP
	$: potentialResult = calculateRankAfterExp(currentRank, currentExp);

	// Styling Helpers
	function getCardStyles(item) {
		const cat = item.category;
		if (cat === 'special' && item.baseExp === 240) {
			return {
				border: 'border-purple-400',
				badge: 'border-white bg-purple-500 text-white',
				textBg: 'bg-pink-50/80',
				text: 'text-pink-700'
			};
		}
		if (cat === 'special') {
			// e.g. 60 exp special
			return {
				border: 'border-purple-400',
				badge: 'border-white bg-purple-500 text-white',
				textBg: 'bg-slate-100/80',
				text: 'text-slate-600'
			};
		}
		if (cat === 'loved-epic') {
			return {
				border: 'border-purple-400',
				badge: 'border-white bg-purple-500 text-white',
				textBg: 'bg-pink-50',
				text: 'text-pink-700'
			};
		}
		if (cat === 'liked-epic') {
			return {
				border: 'border-purple-400',
				badge: 'border-white bg-purple-500 text-white',
				textBg: 'bg-cyan-50',
				text: 'text-cyan-800'
			};
		}
		if (cat === 'standard-epic') {
			return {
				border: 'border-purple-400',
				badge: 'border-white bg-purple-500 text-white',
				textBg: 'bg-slate-50',
				text: 'text-slate-600'
			};
		}
		if (cat === 'loved-rare') {
			return {
				border: 'border-orange-400',
				badge: 'border-white bg-orange-500 text-white',
				textBg: 'bg-pink-50',
				text: 'text-pink-600'
			};
		}
		if (cat === 'liked-rare') {
			return {
				border: 'border-orange-400',
				badge: 'border-white bg-orange-500 text-white',
				textBg: 'bg-cyan-50',
				text: 'text-cyan-700'
			};
		}
		if (cat === 'standard-rare') {
			return {
				border: 'border-orange-400',
				badge: 'border-white bg-orange-500 text-white',
				textBg: 'bg-slate-50',
				text: 'text-slate-600'
			};
		}
		return {
			border: 'border-slate-200',
			badge: 'bg-slate-500',
			textBg: 'bg-slate-50',
			text: 'text-slate-600'
		};
	}

	function getIcon(item) {
		const cat = item.category;
		if (cat === 'special' && item.baseExp === 240) return 'heart_eyes';
		if (cat === 'special') return 'xd';
		if (cat === 'loved-epic') return 'heart_eyes';
		if (cat === 'liked-epic') return 'xd';
		if (cat === 'loved-rare') return 'xd';
		if (cat === 'liked-rare') return 'laugh';
		if (cat === 'standard-epic') return 'laugh';
		if (cat === 'standard-rare') return 'smile';
		return 'smile';
	}
</script>

<!-- Gift Calculator Section -->
<div class="space-y-4 pt-2">
	<div class="flex items-center justify-between px-2 pt-2">
		<h2 class="flex items-center gap-3 text-xl font-normal text-slate-800">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
			>
				<Package size={20} />
			</div>
			<span>Gift Items</span>
		</h2>
		<button
			class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600 active:scale-95"
			on:click={openFilters}
		>
			<Filter size={14} />
			<span>Options</span>
		</button>
	</div>

	<!-- Calculation Status -->
	<div class="px-1">
		<div class="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-xs font-bold tracking-wider text-slate-400 uppercase"
						>Manual Progress</span
					>
				</div>
				<div class="text-xs font-bold">
					<span
						class={isOverkill
							? 'text-orange-500'
							: isComplete
								? 'text-emerald-600'
								: 'text-slate-600'}
					>
						{currentExp}
					</span>
					<span class="text-slate-400">/</span>
					<span class="text-slate-600">{totalExpNeeded} EXP</span>
				</div>
			</div>

			<!-- Progress Bar -->
			<div class="h-2 w-full overflow-hidden rounded-full bg-slate-200">
				<div
					class="h-full transition-all duration-500 ease-out {isOverkill
						? 'bg-orange-500'
						: isComplete
							? 'bg-emerald-500'
							: 'bg-cyan-500'}"
					style="width: {progressPercent}%"
				></div>
			</div>

			<!-- Status Message -->
			<div class="mt-2 flex items-center justify-between">
				{#if isOverkill}
					<div class="flex flex-col gap-1">
						<div class="flex items-center gap-2 text-orange-500">
							<div class="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-3 w-3"
								>
									<line x1="12" y1="5" x2="12" y2="19"></line>
									<line x1="5" y1="12" x2="19" y2="12"></line>
								</svg>
							</div>
							<span class="text-xs font-bold"
								>Overkill! (Reached Rank {potentialResult.finalRank})</span
							>
						</div>
						{#if potentialResult.finalRank >= 100}
							<span class="text-[10px] font-medium text-orange-400/80">
								Max Rank! {potentialResult.leftoverExp} EXP Wasted
							</span>
						{:else}
							<span class="text-[10px] font-medium text-orange-400/80">
								+{potentialResult.leftoverExp} EXP into Rank {potentialResult.finalRank}
							</span>
						{/if}
					</div>
				{:else if isComplete}
					<div class="flex items-center gap-2 text-emerald-600">
						<div class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-3 w-3"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>
						<span class="text-xs font-bold">Goal Reached!</span>
					</div>
				{:else}
					<div class="flex items-center gap-2 text-slate-400">
						<span class="text-xs font-medium italic"
							>Auto-filling remaining {totalExpNeeded - currentExp} EXP...</span
						>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Unified Grid for Sorted Items -->
	<div class="grid grid-cols-2 gap-4 px-1 sm:grid-cols-3 md:grid-cols-6">
		{#each sortedDisplayItems as item (item.id)}
			<GiftItem
				{item}
				styles={getCardStyles(item)}
				icon={getIcon(item)}
				count={userCounts[item.id]}
				placeholder={plan[item.id] || '0'}
				onInput={handleInput}
			/>
		{/each}
	</div>
</div>
