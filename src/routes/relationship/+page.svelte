<script>
	/**
	 * Main page component for the Relationship Planner.
	 * Orchestrates student selection, target rank configuration, and gift requirements calculation.
	 */
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Heart } from 'lucide-svelte';
	import StudentListModal from '$lib/components/views/relationship/StudentListModal.svelte';
	import RelationshipHero from '$lib/components/views/relationship/RelationshipHero.svelte';
	import RelationshipConfig from '$lib/components/views/relationship/RelationshipConfig.svelte';
	import RelationshipCalculator from '$lib/components/views/relationship/RelationshipCalculator.svelte';
	import RelationshipFilterModal from '$lib/components/views/relationship/RelationshipFilterModal.svelte';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { storage } from '$lib/utils/storage';

	export let data;

	// Reactive data from the server load function
	$: localStudents = data?.localStudents || [];
	$: allGifts = data?.allGifts || [];

	// Local state management for UI selection and configuration
	let selectedHero = null; // Currently active student being planned for
	let showHeroModal = false; // Controls student selection modal visibility
	let showFilterModal = false;
	let currentRank = 1; // Starting relationship level
	let targetRank = 9; // Goal relationship level

	// Filter settings
	let showBouquets = true;
	let showLimited = false;
	let showAll = false;
	let sortBy = 'default';
	let sortOrder = 'desc';

	// Load saved filters on mount
	onMount(() => {
		const saved = storage.loadRelationshipFilters();
		if (saved) {
			showBouquets = saved.showBouquets ?? true;
			showLimited = saved.showLimited ?? false;
			showAll = saved.showAll ?? false;
			sortBy = saved.sortBy ?? 'default';
			sortOrder = saved.sortOrder ?? 'desc';
		}

		// Load saved student choice or default to Reisa (ID 10068)
		const savedStudentId = storage.loadSelectedStudent() || 10068;
		const found = localStudents.find((s) => s.id === savedStudentId);
		if (found) {
			selectedHero = found;
			targetRank = selectedHero.live2d_lvl || 9;
		} else if (localStudents.length > 0 && !selectedHero) {
			selectedHero = localStudents[0];
			targetRank = selectedHero.live2d_lvl || 9;
		}
	});

	function handleFilterApply(e) {
		const filters = e.detail;
		showBouquets = filters.showBouquets;
		showLimited = filters.showLimited;
		showAll = filters.showAll;
		sortBy = filters.sortBy;
		sortOrder = filters.sortOrder;
		storage.saveRelationshipFilters({ showBouquets, showLimited, showAll, sortBy, sortOrder });
	}

	// Remove the reactive block that overwrites the selection on load
	// We handle initialization in onMount now
</script>

<svelte:head>
	<title>Relationship Planner | BA Tools</title>
</svelte:head>

<PageContainer>
	<!-- Top Bar -->
	<PageHeader title="Relationship Planner" />

	<!-- Hero Section -->
	{#if selectedHero}
		<RelationshipHero student={selectedHero} on:change={() => (showHeroModal = true)} />

		<RelationshipConfig student={selectedHero} bind:currentRank bind:targetRank />

		<RelationshipCalculator
			student={selectedHero}
			{allGifts}
			{currentRank}
			{targetRank}
			{showBouquets}
			{showLimited}
			{showAll}
			{sortBy}
			{sortOrder}
			on:openFilter={() => (showFilterModal = true)}
		/>
	{/if}
</PageContainer>

{#if showHeroModal}
	<StudentListModal
		students={localStudents}
		on:close={() => (showHeroModal = false)}
		on:select={(e) => {
			selectedHero = e.detail;
			targetRank = selectedHero.live2d_lvl || 9;
			storage.saveSelectedStudent(selectedHero.id);
			showHeroModal = false;
		}}
	/>
{/if}

{#if showFilterModal}
	<RelationshipFilterModal
		{showBouquets}
		{showLimited}
		{showAll}
		{sortBy}
		{sortOrder}
		on:close={() => (showFilterModal = false)}
		on:apply={handleFilterApply}
	/>
{/if}
