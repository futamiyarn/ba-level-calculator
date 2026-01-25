<script>
	import { enhance } from '$app/forms';

	export let form;
	let isScanning = false;
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">Test 2: Cloudflare AI Worker Scan</h1>

	<div class="mb-8 rounded-lg bg-white p-6 shadow">
		<form
			method="POST"
			action="?/scan"
			enctype="multipart/form-data"
			use:enhance={() => {
				isScanning = true;
				return async ({ update }) => {
					isScanning = false;
					await update();
				};
			}}
			class="flex flex-col gap-4"
		>
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-slate-700">Select Screenshot</span>
				<input
					type="file"
					name="image"
					accept="image/*"
					class="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100"
				/>
			</label>

			<button
				type="submit"
				disabled={isScanning}
				class="rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700 disabled:opacity-50"
			>
				{isScanning ? 'Scanning...' : 'Scan with Cloudflare AI'}
			</button>
		</form>
	</div>

	{#if form}
		<div class="rounded-lg bg-slate-800 p-6 text-slate-200 shadow">
			<h2 class="mb-2 text-lg font-bold text-white">Output Result:</h2>
			<div class="overflow-x-auto">
				<pre class="font-mono text-xs">{JSON.stringify(form, null, 2)}</pre>
			</div>
		</div>
	{/if}
</div>
