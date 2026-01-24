<script>
	import { fly } from 'svelte/transition';
</script>

<div in:fly={{ y: 20, duration: 600 }} class="mx-auto max-w-xl space-y-4 pb-24">
	<slot />
</div>
