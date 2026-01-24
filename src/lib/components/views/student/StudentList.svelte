<script>
	/**
	 * StudentList Component
	 * Manages and displays the list of student groups, including their level configuration
	 * and resource requirements calculation.
	 */
	import {
		Star,
		User,
		Plus,
		Trash2,
		ChevronUp,
		ChevronDown,
		GraduationCap,
		Target,
		CreditCard,
		ChevronLeft,
		ChevronRight,
		ChevronsLeft,
		ChevronsRight
	} from 'lucide-svelte';
	import {
		calculateTotalExpNeeded,
		calculateTotalCreditNeeded,
		getNextLevelExp
	} from '$lib/utils/StudentCalculator';
	import { getGroupName, getStudentExpNeeded, calculateNewCount } from './student-list-logic.js';
	import TextBox from '$lib/components/ui/TextBox.svelte';
	import HeaderButton from '$lib/components/ui/HeaderButton.svelte';
	import Collapse from '$lib/components/ui/Collapse.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';

	// Component Props
	export let students = [];
	export let senseiLevel = 90;
	export let maxStudents = 27;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	/**
	 * Adds a new student group to the list
	 */
	const addStudent = () => {
		dispatch('add');
	};

	/**
	 * Removes a student group at the specified index
	 * @param {number} index - The index of the student group to remove
	 */
	const removeStudent = (index) => {
		dispatch('remove', index);
	};

	/**
	 * Toggles the expanded state of a student group card
	 * @param {number} index - The index of the student group to toggle
	 */
	const toggleExpand = (index) => {
		dispatch('toggle', index);
	};

	/**
	 * Updates the student count for a specific group
	 * @param {Object} student - The student group object
	 * @param {number} change - The amount to change the count by
	 * @param {number} index - The index of the group
	 */
	const updateCount = (student, change, index) => {
		const updatedStudent = calculateNewCount(student, change);
		dispatch('update', { index, student: updatedStudent });
	};
</script>

<div class="space-y-4 pt-2">
	<!-- Header Section with Student List Title and Add Button -->
	<SectionHeader title="Student List" iconColorClass="bg-cyan-100 text-cyan-800">
		<User slot="icon" size={20} />
		<HeaderButton
			slot="actions"
			onClick={addStudent}
			disabled={students.length >= maxStudents}
			class={students.length >= maxStudents
				? 'cursor-not-allowed !bg-slate-100 !text-slate-400'
				: '!bg-cyan-500 hover:!bg-cyan-600'}
		>
			<Plus size={16} /> <span>Add ({students.length}/{maxStudents})</span>
		</HeaderButton>
	</SectionHeader>

	<!-- Main List of Student Groups -->
	<div class="space-y-3">
		{#each students as student, index (student.id)}
			<div>
				<Collapse isOpen={student.isExpanded} on:toggle={() => toggleExpand(index)}>
					<!-- Custom Header -->
					<div slot="header" class="flex-1">
						<div class="flex items-baseline gap-2">
							<span class="text-base font-bold text-slate-800">Group {getGroupName(index)}:</span>
							<span class="text-sm font-medium text-slate-500"
								>{student.count} {student.count === 1 ? 'Student' : 'Students'}</span
							>
						</div>
						{#if !student.isExpanded}
							<div class="flex items-center gap-2 text-xs text-slate-400">
								<span class="flex items-center gap-1 font-medium text-blue-500 tabular-nums"
									><Star size={14} /> {getStudentExpNeeded(student, senseiLevel)}</span
								>
							</div>
						{/if}
					</div>

					<!-- Header Actions -->
					<div slot="actions">
						{#if students.length > 1}
							<button
								on:click={() => removeStudent(index)}
								class="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-rose-100 hover:text-rose-500"
								title="Remove"
							>
								<Trash2 size={16} />
							</button>
						{/if}
					</div>

					<!-- Body Section (Quantity Controls and Configuration) -->
					<div class="space-y-6">
						<!-- Quantity Controls Section -->
						<div class="space-y-4">
							<div class="flex items-center gap-2 text-slate-400">
								<User size={14} />
								<span class="text-[10px] font-black tracking-widest uppercase"
									>Student Quantity</span
								>
							</div>

							<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
								<div class="flex w-full items-center justify-center gap-2 rounded-xl p-1">
									<!-- Decrease Quantity Controls -->
									<div class="flex items-center gap-1">
										<button
											type="button"
											on:click={() => updateCount(student, -5, index)}
											class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition-all hover:text-slate-600 active:scale-95 sm:h-8 sm:w-8"
											title="-5"
										>
											<ChevronsLeft size={18} />
										</button>
										<button
											type="button"
											on:click={() => updateCount(student, -1, index)}
											class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition-all hover:text-slate-800 active:scale-95 sm:h-8 sm:w-8"
											title="-1"
										>
											<ChevronLeft size={18} />
										</button>
									</div>

									<!-- Value Input Display -->
									<TextBox
										type="number"
										min="1"
										rootClass="w-auto"
										class="!h-10 !w-16 !p-1 !text-center !text-lg !font-black"
										bind:value={student.count}
									/>

									<!-- Increase Quantity Controls -->
									<div class="flex items-center gap-1">
										<button
											type="button"
											on:click={() => updateCount(student, 1, index)}
											class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm transition-all hover:text-slate-800 active:scale-95 sm:h-8 sm:w-8"
											title="+1"
										>
											<ChevronRight size={18} />
										</button>
										<button
											type="button"
											on:click={() => updateCount(student, 5, index)}
											class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition-all hover:text-slate-600 active:scale-95 sm:h-8 sm:w-8"
											title="+5"
										>
											<ChevronsRight size={18} />
										</button>
									</div>
								</div>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
							<!-- Current State Section (Current Level and EXP) -->
							<div class="space-y-4">
								<div class="flex items-center gap-2 text-slate-400">
									<GraduationCap size={14} />
									<span class="text-[10px] font-black tracking-widest uppercase">Current State</span
									>
								</div>

								<div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
									<!-- Level Slider and Input -->
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<label
												for="cur-lv-{student.id}"
												class="text-[10px] font-bold text-slate-400 uppercase">Level</label
											>
											<div class="flex items-center gap-1.5">
												<TextBox
													type="number"
													min="1"
													max={Math.max(1, senseiLevel - 1)}
													disabled={senseiLevel <= 2}
													rootClass="w-auto"
													class="!w-14 !px-1.5 !py-0.5 !text-right !text-xs !font-black"
													bind:value={student.currentLevel}
												/>
												<span class="text-[10px] font-bold whitespace-nowrap text-slate-400">
													/ {Math.max(1, senseiLevel - 1)}
												</span>
											</div>
										</div>
										<Slider
											id="cur-lv-{student.id}"
											min="1"
											max={Math.max(1, senseiLevel - 1)}
											disabled={senseiLevel <= 2}
											bind:value={student.currentLevel}
											color="slate"
										/>
										{#if senseiLevel <= 2}
											<p class="text-[9px] text-orange-500">Sensei level too low to adjust.</p>
										{/if}
									</div>

									<!-- EXP Input with next level indicator -->
									<div class="space-y-2">
										<label
											class="text-[10px] font-bold text-slate-400 uppercase"
											for="cur-exp-{student.id}">Experience</label
										>
										<div class="flex items-center gap-2">
											<TextBox
												type="number"
												id="cur-exp-{student.id}"
												min="1"
												disabled={senseiLevel <= 2}
												class="!py-2 !text-sm !font-bold"
												placeholder="1"
												bind:value={student.currentExp}
											/>
											<span
												class="text-[10px] font-bold whitespace-nowrap text-slate-400 tabular-nums"
											>
												/ {getNextLevelExp(student.currentLevel).toLocaleString()}
											</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Target Goal Section (Target Level and Requirements Summary) -->
							<div class="space-y-4">
								<div class="flex items-center gap-2 text-cyan-500">
									<Target size={14} />
									<span class="text-[10px] font-black tracking-widest uppercase">Target Goal</span>
								</div>

								<div class="space-y-4 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
									<!-- Target Level Slider and Input -->
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<label
												for="target-lv-{student.id}"
												class="text-[10px] font-bold text-cyan-600 uppercase">Target Level</label
											>
											<div class="flex items-center gap-1.5">
												<TextBox
													type="number"
													min={student.currentLevel + 1}
													max={senseiLevel}
													disabled={senseiLevel <= 2 ||
														student.currentLevel >= senseiLevel ||
														student.currentLevel >= 89}
													rootClass="w-auto"
													class="!w-14 !border-cyan-100 !bg-cyan-50 !px-1.5 !py-0.5 !text-right !text-xs !font-black !text-cyan-600 !ring-cyan-400"
													bind:value={student.targetLevel}
												/>
												<span class="text-[10px] font-bold whitespace-nowrap text-cyan-600">
													/ {senseiLevel}
												</span>
											</div>
										</div>
										<Slider
											id="target-lv-{student.id}"
											min={student.currentLevel + 1}
											max={senseiLevel}
											disabled={senseiLevel <= 2 ||
												student.currentLevel >= senseiLevel ||
												student.currentLevel >= 89}
											bind:value={student.targetLevel}
											color="cyan"
										/>
									</div>

									<!-- Summary Stats of resources needed for the target -->
									<div class="mt-2 grid grid-cols-2 gap-3 border-t border-cyan-100/50 pt-3">
										<div>
											<div class="text-[9px] font-bold text-slate-400 uppercase">Total EXP</div>
											<div
												class="flex items-center gap-1 text-sm font-bold text-slate-700 tabular-nums"
											>
												<Star size={12} class="text-blue-400" />
												{(
													calculateTotalExpNeeded(
														student.currentLevel,
														Math.min(student.targetLevel, senseiLevel),
														student.currentExp
													) * (student.count || 1)
												).toLocaleString()}
											</div>
										</div>
										<div>
											<div class="text-[9px] font-bold text-slate-400 uppercase">Total Credits</div>
											<div
												class="flex items-center gap-1 text-sm font-bold text-slate-700 tabular-nums"
											>
												<CreditCard size={12} class="text-yellow-500" />
												{(
													calculateTotalCreditNeeded(
														student.currentLevel,
														Math.min(student.targetLevel, senseiLevel),
														student.currentExp
													) * (student.count || 1)
												).toLocaleString()}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Collapse>
			</div>
		{/each}
	</div>
</div>
