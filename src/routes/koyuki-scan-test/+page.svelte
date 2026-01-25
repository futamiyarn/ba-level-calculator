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

	async function handleAgree() {
		loading = true;
		error = '';
		result = '';
		const formData = new FormData();
		formData.append('agree', 'true');

		try {
			const res = await fetch('/koyuki-scan-test', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (res.ok) {
				result = 'Successfully agreed to license: ' + JSON.stringify(data, null, 2);
			} else {
				error = data.error || 'Failed to agree to license';
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-xl font-bold">Koyuki Scan Test</h1>

	<div class="mb-6 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm">
		<p class="mb-2 font-bold">License Requirement:</p>
		<p class="mb-2">
			Prior to using Llama 3.2 Vision, you must agree to the <a
				href="https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE"
				target="_blank"
				class="text-blue-600 underline">Community License</a
			>
			and
			<a
				href="https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md"
				target="_blank"
				class="text-blue-600 underline">Acceptable Use Policy</a
			>.
		</p>
		<button
			on:click={handleAgree}
			disabled={loading}
			class="rounded bg-yellow-600 px-3 py-1 text-xs text-white hover:bg-yellow-700 disabled:opacity-50"
		>
			Confirm 'agree' to License
		</button>
	</div>

	<p class="mb-4 text-gray-600">
		Upload an image to test the Cloudflare AI Vision model (@cf/meta/llama-3.2-11b-vision-instruct).
	</p>

	<form on:submit={handleSubmit} class="space-y-4">
		<div>
			<input
				type="file"
				name="image"
				accept="image/*"
				required
				class="block w-full text-sm text-slate-500
				file:mr-4 file:rounded-full file:border-0
				file:bg-violet-50 file:px-4
				file:py-2 file:text-sm
				file:font-semibold file:text-violet-700
				hover:file:bg-violet-100
			"
			/>
		</div>
		<button
			type="submit"
			disabled={loading}
			class="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
		>
			{loading ? 'Scanning...' : 'Scan Image'}
		</button>
	</form>

	{#if error}
		<div class="mt-4 rounded bg-red-100 p-4 text-red-700">
			<strong>Error:</strong>
			{error}
		</div>
	{/if}

	{#if result}
		<div class="mt-4">
			<h2 class="mb-2 font-bold">Result:</h2>
			<pre class="overflow-auto rounded bg-gray-100 p-4 text-sm">{result}</pre>
		</div>
	{/if}
</div>
