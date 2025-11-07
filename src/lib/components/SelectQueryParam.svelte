<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let {
		name,
		title,
		options = []
	}: {
		name: string;
		title: string;
		options: { value: string; t: string }[];
	} = $props();

	// Get current value from URL or default to first option
	let currentValue = $derived($page.url.searchParams.get(name) || options[0]?.value || '');

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newValue = target.value;

		// Update URL with new query param
		const url = new URL($page.url);
		url.searchParams.set(name, newValue);

		// Navigate to new URL (this will trigger SSR reload in load function)
		goto(url.toString(), { invalidateAll: true });
	}
</script>

<div class="flex flex-col gap-1">
	<label for={name} class="text-sm font-medium text-gray-700">
		{title}
	</label>
	<select
		id={name}
		{name}
		value={currentValue}
		onchange={handleChange}
		class="block w-full min-w-[120px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
	>
		{#each options as option (option.value)}
			<option value={option.value}>
				{option.t}
			</option>
		{/each}
	</select>
</div>
