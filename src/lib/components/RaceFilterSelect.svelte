<script lang="ts">
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import {
		translateCategory,
		translateGender,
		translateLength
	} from '$lib/i18n/category-translations';
	import type { EventWithRaces } from '$lib/types/domain';

	let { event, currentRaceId }: { event: EventWithRaces; currentRaceId?: string } = $props();

	// Find current race to initialize filters
	const currentRace = $derived(
		currentRaceId ? event.races.find((r) => r.id === currentRaceId) : undefined
	);

	// Filter state - empty strings represent "not selected" (placeholder state)
	let selectedCategoryId = $state('');
	let selectedGenderId = $state('');
	let selectedLengthId = $state('');

	// Initialize filter state from current race if provided
	$effect(() => {
		if (currentRaceId) {
			const race = event.races.find((r) => r.id === currentRaceId);

			if (race) {
				selectedCategoryId = race.raceCategoryId;
				selectedGenderId = race.raceCategoryGenderId;
				selectedLengthId = race.raceCategoryLengthId;
			}
		}
		// If no currentRaceId, leave as empty (placeholders will show)
	});

	// Map categories to select options
	const categoryOptions = $derived(
		event.supportedRaceCategories?.map((category) => ({
			value: category.id,
			label: translateCategory(category.name)
		})) || []
	);

	const genderOptions = $derived(
		event.supportedRaceCategoryGenders?.map((gender) => ({
			value: gender.id,
			label: translateGender(gender.name)
		})) || []
	);

	const lengthOptions = $derived(
		event.supportedRaceCategoryLengths?.map((length) => ({
			value: length.id,
			label: translateLength(length.name)
		})) || []
	);

	/**
	 * Handle filter change and navigate to matching race.
	 * Only navigates if all three filters are selected AND a matching race exists.
	 */
	function handleFilterChange() {
		// Only search if all three are selected (not placeholders)
		if (!selectedCategoryId || !selectedGenderId || !selectedLengthId) {
			return; // Don't navigate with incomplete selection
		}

		console.log(event.races);

		console.log(selectedCategoryId, selectedGenderId, selectedLengthId);

		// Find exact matching race
		const matchingRace = event.races.find(
			(r) =>
				r.raceCategoryId === selectedCategoryId &&
				r.raceCategoryGenderId === selectedGenderId &&
				r.raceCategoryLengthId === selectedLengthId
		);

		console.log('matchingRace :', matchingRace);

		// Only navigate if match found AND different from current race
		if (matchingRace && matchingRace.id !== currentRaceId) {
			goto(`/results/${event.id}?raceId=${matchingRace.id}`);
		}

		// If no match found: stay put, keep selections, let page show "no results"
	}
</script>

<div class="mb-4 flex flex-wrap gap-3">
	<div>
		<label for="category-filter" class="mb-1 block text-sm font-medium text-gray-700">
			{$t('races.filters.category')}
		</label>
		<select
			id="category-filter"
			bind:value={selectedCategoryId}
			onchange={handleFilterChange}
			class="block rounded-md border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
		>
			<option value="">{$t('races.filters.selectCategory')}</option>
			{#each categoryOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="gender-filter" class="mb-1 block text-sm font-medium text-gray-700">
			{$t('races.filters.gender')}
		</label>
		<select
			id="gender-filter"
			bind:value={selectedGenderId}
			onchange={handleFilterChange}
			class="block rounded-md border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
		>
			<option value="">{$t('races.filters.selectGender')}</option>
			{#each genderOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="length-filter" class="mb-1 block text-sm font-medium text-gray-700">
			{$t('races.filters.distance')}
		</label>
		<select
			id="length-filter"
			bind:value={selectedLengthId}
			onchange={handleFilterChange}
			class="block rounded-md border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
		>
			<option value="">{$t('races.filters.selectDistance')}</option>
			{#each lengthOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>
</div>
