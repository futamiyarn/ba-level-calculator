<script>
	import {
		calculateTotalExpNeeded,
		calculateTotalCreditNeeded,
		calculateExpFromReports
	} from '$lib/utils/StudentCalculator';
	import PageContainer from '$lib/components/ui/PageContainer.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import StudentScanModal from '$lib/components/views/student/StudentScanModal.svelte';
	import HeaderBadge from '$lib/components/ui/HeaderBadge.svelte';
	import StudentHero from '$lib/components/views/student/StudentHero.svelte';
	import StudentConfig from '$lib/components/views/student/StudentConfig.svelte';
	import StudentList from '$lib/components/views/student/StudentList.svelte';

	// --- State ---
	let showScanModal = false;

	// Global Config
	let senseiLevel = 90;
	let ownedResources = {
		credits: 0,
		superior: 0,
		advanced: 0,
		normal: 0,
		novice: 0
	};

	// Student List
	let students = [
		{
			id: Date.now(),
			count: 1,
			currentLevel: 1,
			currentExp: 1,
			targetLevel: 90,
			isExpanded: true
		}
	];

	const MAX_STUDENTS = 27;

	// --- Actions ---

	const addStudent = () => {
		if (students.length >= MAX_STUDENTS) return;

		// Collapse all existing students
		students = students.map((s) => ({ ...s, isExpanded: false }));

		students = [
			...students,
			{
				id: Date.now(),
				count: 1,
				currentLevel: 1,
				currentExp: 1,
				targetLevel: senseiLevel,
				isExpanded: true
			}
		];
	};

	const removeStudent = (event) => {
		const index = event.detail;
		if (students.length > 1) {
			students = students.filter((_, i) => i !== index);
		}
	};

	const toggleExpand = (event) => {
		const index = event.detail;
		students = students.map((s, i) => ({
			...s,
			isExpanded: i === index ? !s.isExpanded : false
		}));
	};

	const onUpdateStudent = (event) => {
		const { index, student } = event.detail;
		students[index] = student;
		// Trigger reactivity for the array (Svelte needs this for array mutations to propagate deeply if binding isn't enough context)
		// But more importantly, this keeps the update localized logic here.
		// However, with `bind:students` in the list, changes inside *should* propagate.
		// The issue might be that `bind:value` in the child component inputs works fine,
		// but the buttons were manual.
		// By reassignment here:
		students = [...students];
	};

	const openScanModal = () => {
		showScanModal = true;
	};

	const closeScanModal = () => {
		showScanModal = false;
	};

	const onScanModalSubmit = (event) => {
		const { lv, credits } = event.detail;
		senseiLevel = parseInt(lv);
		ownedResources.credits = parseInt(credits);
		showScanModal = false;
	};

	// --- Logic & Validation ---
	// We use a reactive statement to enforce constraints on the students array
	// Optimized to only trigger an update if values actually need to change
	let previousSenseiLevel = senseiLevel;

	$: {
		// Cap sensei level at 90
		if (senseiLevel > 90) senseiLevel = 90;

		if (senseiLevel && senseiLevel >= 1) {
			let hasChanges = false;
			const senseiLevelChanged = senseiLevel !== previousSenseiLevel;

			const updatedStudents = students.map((s) => {
				let newCurrent = s.currentLevel;
				let newTarget = s.targetLevel;

				// Stickiness: If Sensei Level changed and target was at previous max, follow the new max
				if (senseiLevelChanged && newTarget === previousSenseiLevel) {
					newTarget = senseiLevel;
				}

				// Cap current level at senseiLevel - 1
				const maxCur = Math.max(1, senseiLevel - 1);
				if (newCurrent > maxCur) newCurrent = maxCur;

				// Ensure target is at least current + 1
				if (newTarget <= newCurrent) {
					newTarget = newCurrent + 1;
				}

				// Cap target at Sensei Level
				if (newTarget > senseiLevel) newTarget = senseiLevel;
				// Ensure target is still valid after cap
				if (newTarget <= newCurrent) newTarget = newCurrent + 1;

				if (newCurrent !== s.currentLevel || newTarget !== s.targetLevel) {
					hasChanges = true;
					return { ...s, currentLevel: newCurrent, targetLevel: newTarget };
				}
				return s;
			});

			if (hasChanges) {
				students = updatedStudents;
			}

			if (senseiLevelChanged) {
				previousSenseiLevel = senseiLevel;
			}
		}
	}

	// --- Calculations ---

	// Calculate aggregates
	$: totalExpNeeded = students.reduce((sum, s) => {
		const effectiveTarget = Math.min(s.targetLevel, senseiLevel);
		const needed = calculateTotalExpNeeded(s.currentLevel, effectiveTarget, s.currentExp);
		return sum + needed * (s.count || 1);
	}, 0);

	$: totalCreditsNeeded = students.reduce((sum, s) => {
		const effectiveTarget = Math.min(s.targetLevel, senseiLevel);
		const needed = calculateTotalCreditNeeded(s.currentLevel, effectiveTarget, s.currentExp);
		return sum + needed * (s.count || 1);
	}, 0);

	$: totalStudentCount = students.reduce((sum, s) => sum + (s.count || 0), 0);

	// Calculate Owned Assets
	$: totalOwnedExp = calculateExpFromReports({
		superior: ownedResources.superior,
		advanced: ownedResources.advanced,
		normal: ownedResources.normal,
		novice: ownedResources.novice
	});

	// Calculate Deficits
	$: missingExp = Math.max(0, totalExpNeeded - totalOwnedExp);
	$: missingCredits = Math.max(0, totalCreditsNeeded - ownedResources.credits);
</script>

<svelte:head>
	<title>Student Planner | BA Tools</title>
</svelte:head>

<PageContainer>
	<!-- Top Bar -->
	<PageHeader title="Student Leveling">
		<HeaderBadge>
			{totalStudentCount} Students
		</HeaderBadge>
	</PageHeader>

	<!-- Hero Section -->
	<StudentHero {totalExpNeeded} {totalCreditsNeeded} {missingExp} {missingCredits} />

	<!-- Configuration Section -->
	<StudentConfig bind:senseiLevel bind:ownedResources on:scan={openScanModal} />

	<!-- Student List Section -->
	<StudentList
		bind:students
		{senseiLevel}
		maxStudents={MAX_STUDENTS}
		on:add={addStudent}
		on:remove={removeStudent}
		on:toggle={toggleExpand}
		on:update={onUpdateStudent}
	/>
</PageContainer>

{#if showScanModal}
	<StudentScanModal on:close={closeScanModal} on:submit={onScanModalSubmit} />
{/if}
