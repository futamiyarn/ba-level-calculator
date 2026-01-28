<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { X, Filter, Pin } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { storage } from '$lib/utils/storage';

	export let students = [];

	const dispatch = createEventDispatcher();
	let limit = 30;

	// Filter State
	let showFilters = false;
	let showPinnedOnly = false;
	let searchTerm = '';
	let selectedSchool = 'All';
	let selectedRarity = 'All';
	let isLoaded = false;
	let pinnedIds = [];

	onMount(() => {
		const saved = storage.loadStudentFilters();
		if (saved) {
			selectedSchool = saved.selectedSchool ?? 'All';
			selectedRarity = saved.selectedRarity ?? 'All';
		}
		pinnedIds = storage.loadPinnedStudents();
		isLoaded = true;
	});

	// Save filters whenever they change, but only after loading
	$: {
		if (typeof window !== 'undefined' && isLoaded) {
			storage.saveStudentFilters({ selectedSchool, selectedRarity });
		}
	}

	function togglePin(e, studentId) {
		e.stopPropagation();
		if (pinnedIds.includes(studentId)) {
			pinnedIds = pinnedIds.filter((id) => id !== studentId);
		} else {
			pinnedIds = [...pinnedIds, studentId];
		}
		storage.savePinnedStudents(pinnedIds);
	}

	// Extract unique schools for the dropdown, sorted alphabetically
	$: uniqueSchools = ['All', ...[...new Set(students.map((s) => s.school).filter(Boolean))].sort()];

	// Reactive filtering logic
	$: filteredStudents = students
		.filter((s) => {
			const matchSchool = selectedSchool === 'All' || s.school === selectedSchool;
			const matchRarity =
				selectedRarity === 'All' || (s.rarity && s.rarity.toString() === selectedRarity.toString());
			const matchName =
				searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase());
			const matchPinned = !showPinnedOnly || pinnedIds.includes(s.id);
			return matchSchool && matchRarity && matchName && matchPinned;
		})
		.sort((a, b) => a.id - b.id);

	// Reset limit when filters change
	$: if (selectedSchool || selectedRarity || searchTerm || showPinnedOnly) {
		limit = 30;
	}

	// Apply pagination to the filtered list
	$: visibleStudents = filteredStudents.slice(0, limit);

	function loadMore() {
		if (limit < filteredStudents.length) {
			limit += 20;
		}
	}

	function getRarityColor(rarity) {
		switch (rarity) {
			case 3:
				return 'bg-purple-500'; // 3 Star
			case 2:
				return 'bg-yellow-500'; // 2 Star
			case 1:
				return 'bg-blue-400'; // 1 Star (Light Blue/Cyan)
			default:
				return 'bg-slate-500';
		}
	}
</script>

<Modal title="Student List" subtitle="({filteredStudents.length})" on:close onScroll={loadMore}>
	<div slot="header">
		<!-- Search Bar & Filter Toggle -->
		<div class="flex items-center gap-2 p-3">
			<div class="relative flex-1">
				<input
					id="search-input"
					type="text"
					bind:value={searchTerm}
					placeholder="Search student name..."
					class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pr-10 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
				/>
				{#if searchTerm}
					<button
						on:click={() => (searchTerm = '')}
						class="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
						aria-label="Clear search"
					>
						<X size={18} />
					</button>
				{/if}
			</div>

			<button
				on:click={() => (showPinnedOnly = !showPinnedOnly)}
				class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition-all {showPinnedOnly
					? 'border-pink-200 bg-pink-50 text-pink-500'
					: 'bg-slate-50 text-slate-400 hover:bg-slate-100'}"
				title="Show Pinned Only"
			>
				<Pin size={20} class={showPinnedOnly ? 'fill-current' : ''} />
			</button>

			<button
				on:click={() => (showFilters = !showFilters)}
				class="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition-all {showFilters
					? 'border-cyan-200 bg-cyan-50 text-cyan-600'
					: 'bg-slate-50 text-slate-400 hover:bg-slate-100'}"
				aria-label="Toggle filters"
			>
				<Filter size={20} />
			</button>
		</div>

		<!-- Filters -->
		{#if showFilters}
			<div transition:slide class="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-3">
				<div class="space-y-1">
					<label for="school-select" class="text-xs font-bold text-slate-400 uppercase"
						>School</label
					>
					<Select id="school-select" bind:value={selectedSchool} options={uniqueSchools} />
				</div>

				<div class="space-y-1">
					<label for="rarity-select" class="text-xs font-bold text-slate-400 uppercase"
						>Rarity</label
					>
					<Select
						id="rarity-select"
						bind:value={selectedRarity}
						options={[
							{ value: 'All', label: 'All Rarity' },
							{ value: '3', label: '3★' },
							{ value: '2', label: '2★' },
							{ value: '1', label: '1★' }
						]}
					/>
				</div>
			</div>
		{/if}
	</div>

	<!-- List -->
	<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
		{#if visibleStudents.length > 0}
			{#each visibleStudents as student (student.id)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="group relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-center transition-all hover:bg-slate-100 hover:shadow-md"
					on:click={() => dispatch('select', student)}
				>
					<Tooltip text={student.name}>
						<div class="relative">
							<div
								class="h-14 w-14 overflow-hidden rounded-full border-2 border-white/10 p-0.5 {getRarityColor(
									student.rarity
								)} shadow-sm"
							>
								<img
									src="https://schaledb.com/images/student/icon/{student.id}.webp"
									alt={student.name}
									class="h-full w-full rounded-full object-cover"
									loading="lazy"
								/>
							</div>

							<button
								class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm transition-all hover:scale-110 active:scale-95 {pinnedIds.includes(
									student.id
								)
									? 'border-pink-100 text-pink-500'
									: 'text-slate-300 hover:text-slate-400'}"
								on:click={(e) => togglePin(e, student.id)}
								title={pinnedIds.includes(student.id) ? 'Unpin' : 'Pin'}
							>
								<Pin size={12} class={pinnedIds.includes(student.id) ? 'fill-current' : ''} />
							</button>
						</div>
					</Tooltip>
					<div class="w-full">
						<div class="line-clamp-2 text-xs font-bold text-slate-800">
							{student.name}
						</div>

						<div class="truncate text-[9px] font-medium text-slate-400 uppercase">
							{student.school}
						</div>
					</div>
				</div>
			{/each}
		{:else}
			<div class="col-span-full flex h-40 flex-col items-center justify-center text-slate-400">
				<p>No students found.</p>

				<button
					class="mt-2 text-sm text-cyan-600 underline"
					on:click={() => {
						selectedSchool = 'All';
						selectedRarity = 'All';
					}}
				>
					Reset Filters
				</button>
			</div>
		{/if}
	</div>

	{#if limit < filteredStudents.length && visibleStudents.length > 0}
		<div class="py-4 text-center text-sm text-slate-400">Loading more...</div>
	{/if}

	<div slot="footer" class="text-center text-xs text-slate-400">
		Showing {Math.min(limit, filteredStudents.length)} of {filteredStudents.length} results
	</div>
</Modal>
