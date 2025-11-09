<script lang="ts">
	import OrganizationProfile from '$lib/components/OrganizationProfile.svelte';
	import { t } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.organization.name} - {$t('admin.organizations.title')} - ACS</title>
</svelte:head>

<!-- Organization details (back button and title now in layout) -->
<OrganizationProfile organization={data.organization} />

<!-- Placeholder for future actions -->
<div class="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
	<p class="mb-2 text-lg font-semibold text-gray-700">Funcionalidad en desarrollo</p>
	<p class="text-gray-600">
		En el futuro aquí estarán disponibles las opciones para editar y eliminar la organización.
	</p>
</div>
