<script>
	import { createEventDispatcher } from 'svelte';
	import ScanModal from '$lib/components/ui/ScanModal.svelte';

	const dispatch = createEventDispatcher();

	function handleScanSubmit(e) {
		const scanData = e.detail;
		dispatch('submit', {
			lv: scanData.current_level,
			credits: scanData.credit.total,
			reports: scanData.credit.reports
		});
	}
</script>

<ScanModal
	title="AI Inventory Scan"
	description="Scan your inventory screenshot to automatically fill levels and resources."
	action="?/scan"
	on:close
	on:submit={handleScanSubmit}
/>
