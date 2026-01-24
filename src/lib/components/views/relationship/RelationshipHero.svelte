<script>
	import { createEventDispatcher } from 'svelte';
	import { User, School } from 'lucide-svelte';
	import HeroCard from '$lib/components/ui/HeroCard.svelte';

	export let student;

	const dispatch = createEventDispatcher();

	function openModal() {
		dispatch('change');
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

	function getRarityGlow(rarity) {
		switch (rarity) {
			case 3:
				return 'bg-purple-500/20';
			case 2:
				return 'bg-yellow-500/20';
			case 1:
				return 'bg-blue-400/20';
			default:
				return 'bg-slate-500/20';
		}
	}
</script>

<div class="px-1">
	<HeroCard>
		<!-- Background Effects -->
		<div
			class="absolute -top-10 -right-10 h-48 w-48 rounded-full blur-3xl {getRarityGlow(
				student.rarity
			)}"
		></div>
		<div
			class="absolute -bottom-10 -left-10 h-48 w-48 rounded-full blur-3xl {getRarityGlow(
				student.rarity
			)}"
		></div>

		<div class="relative z-10 flex flex-col items-center gap-6 sm:flex-row">
			<!-- Hero Image -->
			<div class="relative flex-shrink-0">
				<div
					class="h-28 w-28 overflow-hidden rounded-full border-4 border-white/10 p-1 {getRarityColor(
						student.rarity
					)} shadow-lg"
				>
					<img
						src="https://schaledb.com/images/student/icon/{student.id}.webp"
						alt={student.name}
						class="h-full w-full rounded-full object-cover"
					/>
				</div>
				<div
					class="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-white font-bold text-slate-900 shadow-lg"
				>
					{student.rarity}★
				</div>
			</div>

			<!-- Hero Info -->
			<div class="flex-1 text-center sm:text-left">
				<div class="mb-2 flex items-center justify-center gap-2 sm:justify-start">
					<div
						class="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
					>
						<School size={10} class="text-cyan-400" />
						<span>{student.school}</span>
					</div>
				</div>

				<h2 class="mb-4 text-3xl font-bold tracking-tight">{student.name}</h2>

				<div class="flex justify-center sm:justify-start">
					<button
						class="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-slate-900 shadow-sm transition-transform hover:scale-105 hover:bg-cyan-50 hover:shadow-md active:scale-95"
						on:click={openModal}
					>
						<User size={14} />
						<span>Change Student</span>
					</button>
				</div>
			</div>
		</div>
	</HeroCard>
</div>
