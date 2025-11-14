<script lang="ts">
	import type { Organization, OrganizationState } from '$lib/types/domain';
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

	// Get state badge classes based on organization state
	function getStateBadgeClasses(state: OrganizationState): string {
		switch (state) {
			case 'ACTIVE':
				return 'bg-green-100 text-green-800';
			case 'WAITING_OWNER':
				return 'bg-yellow-100 text-yellow-800';
			case 'DISABLED':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	// Get state label i18n key
	function getStateLabel(state: OrganizationState): string {
		switch (state) {
			case 'ACTIVE':
				return $t('admin.organizations.state.active');
			case 'WAITING_OWNER':
				return $t('admin.organizations.state.waitingOwner');
			case 'DISABLED':
				return $t('admin.organizations.state.disabled');
			default:
				return $t('admin.organizations.state.disabled');
		}
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
		<dt class="text-sm font-medium text-gray-500">{$t('admin.organizations.state.label')}</dt>
		<dd class="mt-1">
			<span
				class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {getStateBadgeClasses(
					organization.state
				)}"
			>
				{getStateLabel(organization.state)}
			</span>
		</dd>
	</div>
</dl>
