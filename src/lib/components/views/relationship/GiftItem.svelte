<script>
	import FaceXD from '$lib/components/ui/icons/FaceXD.svelte';
	import FaceHeartEyes from '$lib/components/ui/icons/FaceHeartEyes.svelte';
	import FaceSmile from '$lib/components/ui/icons/FaceSmile.svelte';
	import FaceMouthOpen from '$lib/components/ui/icons/FaceMouthOpen.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import TextBox from '$lib/components/ui/TextBox.svelte';

	export let item;
	export let styles;
	export let icon;
	export let count;
	export let placeholder;
	export let onInput;

	function handleInput(e) {
		onInput(item.id, e);
	}
</script>

<div class="flex flex-col items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
	<Tooltip text={item.name}>
		<div
			class="relative flex h-12 w-12 items-center justify-center rounded-full border-2 {styles.border} {item.isVirtual
				? item.category.includes('epic')
					? 'text-purple-500'
					: 'text-orange-500'
				: ''}"
		>
			{#if item.isVirtual}
				{#if icon === 'laugh'}
					<FaceMouthOpen size={28} />
				{:else}
					<FaceSmile size={28} />
				{/if}
			{:else}
				<img src={item.imgUrl} alt={item.name} class="h-10 w-10 object-contain" />
				<div
					class="absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm {styles.badge}"
				>
					{#if icon === 'heart_eyes'}
						<FaceHeartEyes size={20} />
					{:else if icon === 'xd'}
						<FaceXD size={20} />
					{:else if icon === 'laugh'}
						<FaceMouthOpen size={20} />
					{:else}
						<FaceSmile size={20} />
					{/if}
				</div>
			{/if}
		</div>
	</Tooltip>

	<div
		class="flex h-[34px] w-full items-center justify-center rounded-lg px-1 text-center {styles.textBg}"
	>
		<span
			class="line-clamp-2 text-[9px] leading-tight font-bold tracking-wider uppercase {styles.text}"
		>
			{item.name}
		</span>
	</div>

	{#if item.isVirtual}
		<div
			class="flex h-[38px] w-full items-center justify-center rounded-xl bg-slate-50 text-center text-sm font-bold text-slate-700"
		>
			{count || placeholder || '0'}
		</div>
	{:else}
		<TextBox
			type="number"
			min="0"
			value={count || ''}
			{placeholder}
			on:input={handleInput}
			textClass="text-sm font-bold"
			class="!py-2 !text-center"
		/>
	{/if}
</div>
