<script lang="ts">
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import {
		translateCategory,
		translateGender,
		translateLength
	} from '$lib/i18n/category-translations';
	import type { EventWithRaces } from '$lib/types/domain';

	let {
		event,
		currentRaceId,
		filterState
	}: {
		event: EventWithRaces;
		currentRaceId?: string;
		filterState?: { categoryId: string; genderId: string; lengthId: string } | null;
	} = $props();

	// Compute initial filter values synchronously (prevents render blink)
	function getInitialFilterState() {
		if (currentRaceId) {
			const race = event.races.find((r) => r.id === currentRaceId);
			if (race) {
				return {
					categoryId: race.raceCategoryId,
					genderId: race.raceCategoryGenderId,
					lengthId: race.raceCategoryLengthId
				};
			}
		} else if (filterState) {
			// Initialize from filterState (Mode B - no matching race)
			return {
				categoryId: filterState.categoryId,
				genderId: filterState.genderId,
				lengthId: filterState.lengthId
			};
		}
		// Fallback: use first available option from each category
		// (should never happen due to server-side redirect, but defensive)
		return {
			categoryId: event.supportedRaceCategories[0]?.id || '',
			genderId: event.supportedRaceCategoryGenders[0]?.id || '',
			lengthId: event.supportedRaceCategoryLengths[0]?.id || ''
		};
	}

	const initialState = getInitialFilterState();
	let selectedCategoryId = $state(initialState.categoryId);
	let selectedGenderId = $state(initialState.genderId);
	let selectedLengthId = $state(initialState.lengthId);

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
	 * Handle filter change and navigate with appropriate query params.
	 * - Mode A (match found): Navigate with ?raceId={uuid}
	 * - Mode B (no match): Navigate with ?categoryId={uuid}&genderId={uuid}&lengthId={uuid}
	 */
	function handleFilterChange() {
		// Find exact matching race
		const matchingRace = event.races.find(
			(r) =>
				r.raceCategoryId === selectedCategoryId &&
				r.raceCategoryGenderId === selectedGenderId &&
				r.raceCategoryLengthId === selectedLengthId
		);

		if (matchingRace) {
			// Mode A: Match found - navigate with raceId
			if (matchingRace.id !== currentRaceId) {
				goto(`/results/${event.id}?raceId=${matchingRace.id}`, { invalidateAll: true });
			}
		} else {
			// Mode B: No match - navigate with individual filter params
			const params = new URLSearchParams({
				categoryId: selectedCategoryId,
				genderId: selectedGenderId,
				lengthId: selectedLengthId
			});
			goto(`/results/${event.id}?${params.toString()}`, { invalidateAll: true });
		}
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
			{#each lengthOptions as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>
</div>
