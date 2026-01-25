<script>
	let result = '';
	let loading = false;
	let error = '';

	async function handleSubmit(e) {
		e.preventDefault();
		loading = true;
		error = '';
		result = '';

		const formData = new FormData(e.target);

		try {
			const res = await fetch('/koyuki-scan-test', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();
			if (res.ok) {
				result = JSON.stringify(data, null, 2);
			} else {
				error = data.error || 'Something went wrong';
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-4">
	<h1 class="text-xl font-bold mb-4">Koyuki Scan Test</h1>
	<p class="mb-4">Upload an image to test the Cloudflare AI Vision model (@cf/meta/llama-3.2-11b-vision-instruct).</p>

	<form on:submit={handleSubmit} class="space-y-4">
		<div>
			<input type="file" name="image" accept="image/*" required class="block w-full text-sm text-slate-500
				file:mr-4 file:py-2 file:px-4
				file:rounded-full file:border-0
				file:text-sm file:font-semibold
				file:bg-violet-50 file:text-violet-700
				hover:file:bg-violet-100
			"/>
		</div>
		<button type="submit" disabled={loading} class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
			{loading ? 'Scanning...' : 'Scan Image'}
		</button>
	</form>

	{#if error}
		<div class="mt-4 p-4 bg-red-100 text-red-700 rounded">
			<strong>Error:</strong> {error}
		</div>
	{/if}

	{#if result}
		<div class="mt-4">
			<h2 class="font-bold mb-2">Result:</h2>
			<pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">{result}</pre>
		</div>
	{/if}
</div>
