<script lang="ts">
	import type { Event } from '$lib/types/domain';
	import { t } from '$lib/i18n';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

	interface Props {
		mode: 'create' | 'edit';
		event?: Event;
		categories: Array<{ id: string; name: string }>;
		genders: Array<{ id: string; name: string }>;
		lengths: Array<{ id: string; name: string }>;
		formElement?: HTMLFormElement;
		error?: string;
	}

	let {
		mode,
		event,
		categories,
		genders,
		lengths,
		formElement = $bindable(),
		error
	}: Props = $props();

	// Format datetime for input
	function formatForDatetimeLocal(isoString: string | undefined): string {
		if (!isoString) return '';
		return isoString.slice(0, 16);
	}

	// Track selected items
	let selectedCategories = $state<string[]>(event ? [] : []);
	let selectedGenders = $state<string[]>(event ? [] : []);
	let selectedLengths = $state<string[]>(event ? [] : []);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>
			{mode === 'create' ? $t('panel.events.form.createTitle') : $t('panel.events.form.editTitle')}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if error}
			<Alert variant="destructive" class="mb-4">
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		{/if}

		<form bind:this={formElement} method="POST" use:enhance class="space-y-6">
			<!-- Name -->
			<div class="space-y-2">
				<Label for="name">{$t('panel.events.form.nameLabel')}</Label>
				<Input
					id="name"
					name="name"
					value={event?.name ?? ''}
					placeholder={$t('panel.events.form.namePlaceholder')}
					required
				/>
			</div>

			<!-- Description -->
			<div class="space-y-2">
				<Label for="description">{$t('panel.events.form.descriptionLabel')}</Label>
				<textarea
					id="description"
					name="description"
					class="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					placeholder={$t('panel.events.form.descriptionPlaceholder')}
					>{event?.description ?? ''}</textarea
				>
			</div>

			<!-- Date/Time -->
			<div class="space-y-2">
				<Label for="dateTime">{$t('panel.events.form.dateTimeLabel')}</Label>
				<Input
					id="dateTime"
					name="dateTime"
					type="datetime-local"
					value={formatForDatetimeLocal(event?.dateTime)}
					required
				/>
			</div>

			<!-- Location fields -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="space-y-2">
					<Label for="country">{$t('panel.events.form.countryLabel')}</Label>
					<Input
						id="country"
						name="country"
						value={event?.country ?? ''}
						placeholder={$t('panel.events.form.countryPlaceholder')}
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="state">{$t('panel.events.form.stateLabel')}</Label>
					<Input
						id="state"
						name="state"
						value={event?.state ?? ''}
						placeholder={$t('panel.events.form.statePlaceholder')}
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="city">{$t('panel.events.form.cityLabel')}</Label>
					<Input
						id="city"
						name="city"
						value={event?.city ?? ''}
						placeholder={$t('panel.events.form.cityPlaceholder')}
					/>
				</div>
			</div>

			<!-- Visibility -->
			<div class="flex items-center space-x-2">
				<Checkbox
					id="isPublicVisible"
					name="isPublicVisible"
					checked={event?.isPublicVisible ?? false}
				/>
				<Label for="isPublicVisible">{$t('panel.events.form.visibleLabel')}</Label>
			</div>

			{#if mode === 'create'}
				<!-- Categories (only for create) -->
				<div class="space-y-2">
					<Label>{$t('panel.events.form.categoriesLabel')}</Label>
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
						{#each categories as category}
							<div class="flex items-center space-x-2">
								<Checkbox
									id={`category-${category.id}`}
									name="categoryIds"
									value={category.id}
									checked={selectedCategories.includes(category.id)}
									onCheckedChange={(checked) => {
										if (checked) {
											selectedCategories = [...selectedCategories, category.id];
										} else {
											selectedCategories = selectedCategories.filter((id) => id !== category.id);
										}
									}}
								/>
								<Label for={`category-${category.id}`} class="text-sm font-normal">
									{category.name}
								</Label>
							</div>
						{/each}
					</div>
				</div>

				<!-- Genders -->
				<div class="space-y-2">
					<Label>{$t('panel.events.form.gendersLabel')}</Label>
					<div class="flex gap-4">
						{#each genders as gender}
							<div class="flex items-center space-x-2">
								<Checkbox
									id={`gender-${gender.id}`}
									name="genderIds"
									value={gender.id}
									checked={selectedGenders.includes(gender.id)}
									onCheckedChange={(checked) => {
										if (checked) {
											selectedGenders = [...selectedGenders, gender.id];
										} else {
											selectedGenders = selectedGenders.filter((id) => id !== gender.id);
										}
									}}
								/>
								<Label for={`gender-${gender.id}`} class="text-sm font-normal">
									{gender.name}
								</Label>
							</div>
						{/each}
					</div>
				</div>

				<!-- Lengths -->
				<div class="space-y-2">
					<Label>{$t('panel.events.form.lengthsLabel')}</Label>
					<div class="flex gap-4">
						{#each lengths as length}
							<div class="flex items-center space-x-2">
								<Checkbox
									id={`length-${length.id}`}
									name="lengthIds"
									value={length.id}
									checked={selectedLengths.includes(length.id)}
									onCheckedChange={(checked) => {
										if (checked) {
											selectedLengths = [...selectedLengths, length.id];
										} else {
											selectedLengths = selectedLengths.filter((id) => id !== length.id);
										}
									}}
								/>
								<Label for={`length-${length.id}`} class="text-sm font-normal">
									{length.name}
								</Label>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</form>
	</Card.Content>
</Card.Root>
