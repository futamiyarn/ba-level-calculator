<script>
	import { createEventDispatcher } from 'svelte';
	import { Settings, User, CreditCard, Clipboard, Scan } from 'lucide-svelte';
	import TextBox from '$lib/components/ui/TextBox.svelte';
	import TxtReports from '$lib/components/ui/TxtReports.svelte';
	import HeaderButton from '$lib/components/ui/HeaderButton.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

	export let senseiLevel;
	export let ownedResources;

	const dispatch = createEventDispatcher();

	function onScan() {
		dispatch('scan');
	}
</script>

<div class="space-y-4 pt-2">
	<SectionHeader title="Configuration">
		<Settings slot="icon" size={20} />
		<HeaderButton slot="actions" onClick={onScan} class="!px-3 !py-1.5 !normal-case">
			<Scan size={14} /> <span>Scan / Edit</span>
		</HeaderButton>
	</SectionHeader>

	<div class="mx-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<!-- Sensei Level -->
			<div class="space-y-3">
				<label class="text-xs font-bold text-slate-400 uppercase" for="sensei-level"
					>Sensei Level</label
				>
				<div class="flex items-center gap-3">
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600"
					>
						<User size={16} />
					</div>
					<TextBox
						type="number"
						id="sensei-level"
						min="1"
						max="90"
						textClass="text-sm font-bold"
						class="!py-2"
						placeholder="1-90"
						bind:value={senseiLevel}
						suffix="/ 90"
					/>
				</div>
			</div>

			<!-- Owned Credits -->
			<div class="space-y-3">
				<label class="text-xs font-bold text-slate-400 uppercase" for="owned-credits"
					>Owned Credits</label
				>
				<div class="flex items-center gap-3">
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-50 text-yellow-500"
					>
						<CreditCard size={16} />
					</div>
					<TextBox
						type="number"
						id="owned-credits"
						textClass="text-sm font-bold"
						class="!py-2"
						placeholder="0"
						bind:value={ownedResources.credits}
					/>
				</div>
			</div>

			<!-- Owned Reports -->
			<div class="col-span-1 space-y-3 sm:col-span-2">
				<label class="text-xs font-bold text-slate-400 uppercase" for="owned-reports"
					>Owned Activity Reports</label
				>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<TxtReports label="Superior" color="pink" bind:value={ownedResources.superior} />
					<TxtReports label="Advanced" color="orange" bind:value={ownedResources.advanced} />
					<TxtReports label="Normal" color="blue" bind:value={ownedResources.normal} />
					<TxtReports label="Novice" color="slate" bind:value={ownedResources.novice} />
				</div>
			</div>
		</div>
	</div>
</div>
