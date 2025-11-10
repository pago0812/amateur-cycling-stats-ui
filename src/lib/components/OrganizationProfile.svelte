<script lang="ts">
	import type { Organization } from '$lib/types/domain';
	import { t } from '$lib/i18n';

	let { organization }: { organization: Organization } = $props();

	// Format date to locale string
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<!-- Organization info grid -->
<dl class="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2">
	<!-- Name -->
	<div>
		<dt class="text-sm font-medium text-gray-500">{$t('admin.organizations.table.name')}</dt>
		<dd class="mt-1 text-lg text-gray-900">{organization.name}</dd>
	</div>

	<!-- Description -->
	<div>
		<dt class="text-sm font-medium text-gray-500">{$t('admin.organizations.table.description')}</dt>
		<dd class="mt-1 text-gray-900">{organization.description || '-'}</dd>
	</div>

	<!-- Created Date -->
	<div>
		<dt class="text-sm font-medium text-gray-500">{$t('admin.organizations.table.createdAt')}</dt>
		<dd class="mt-1 text-gray-900">{formatDate(organization.createdAt)}</dd>
	</div>

	<!-- Updated Date -->
	<div>
		<dt class="text-sm font-medium text-gray-500">Última actualización</dt>
		<dd class="mt-1 text-gray-900">{formatDate(organization.updatedAt)}</dd>
	</div>

	<!-- Event Count (optional) -->
	{#if organization.eventCount !== undefined}
		<div>
			<dt class="text-sm font-medium text-gray-500">
				{$t('admin.organizations.table.eventCount')}
			</dt>
			<dd class="mt-1 text-lg font-semibold text-gray-900">{organization.eventCount}</dd>
		</div>
	{/if}

	<!-- Status -->
	<div>
		<dt class="text-sm font-medium text-gray-500">Estado</dt>
		<dd class="mt-1">
			<span
				class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
			>
				{organization.isActive ? 'Activa' : 'Inactiva'}
			</span>
		</dd>
	</div>
</dl>
