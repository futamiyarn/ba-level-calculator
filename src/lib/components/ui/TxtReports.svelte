<script>
	import { Clipboard } from 'lucide-svelte';
	import TextBox from './TextBox.svelte';

	export let value;
	export let label = '';
	export let color = 'slate'; // pink, orange, blue, slate

	const themes = {
		pink: {
			border: 'border-pink-100',
			bg: 'bg-pink-50/50',
			label: 'text-pink-400',
			icon: 'text-pink-300',
			input: 'text-pink-700',
			placeholder: 'placeholder-pink-300'
		},
		orange: {
			border: 'border-orange-100',
			bg: 'bg-orange-50/50',
			label: 'text-orange-400',
			icon: 'text-orange-300',
			input: 'text-orange-700',
			placeholder: 'placeholder-orange-300'
		},
		blue: {
			border: 'border-blue-100',
			bg: 'bg-blue-50/50',
			label: 'text-blue-400',
			icon: 'text-blue-300',
			input: 'text-blue-700',
			placeholder: 'placeholder-blue-300'
		},
		slate: {
			border: 'border-slate-200',
			bg: 'bg-slate-50/50',
			label: 'text-slate-400',
			icon: 'text-slate-300',
			input: 'text-slate-600',
			placeholder: 'placeholder-slate-300'
		}
	};

	$: theme = themes[color] || themes.slate;
</script>

<div class="group relative rounded-xl border {theme.border} {theme.bg} p-2">
	<div class="mb-1 flex items-center justify-between">
		<span class="text-[9px] font-bold tracking-tight {theme.label} uppercase">{label}</span>
		<Clipboard size={12} class={theme.icon} />
	</div>
	<TextBox
		type="number"
		bind:value
		class="!border-none !bg-transparent !p-0 !text-center !text-sm !font-bold !ring-0 {theme.input} {theme.placeholder}"
		placeholder="0"
	/>
</div>
