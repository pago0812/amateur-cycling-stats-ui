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
				return 'bg-success/10 text-success';
			case 'WAITING_OWNER':
				return 'bg-warning/10 text-warning';
			case 'DISABLED':
				return 'bg-muted text-muted-foreground';
			default:
				return 'bg-muted text-muted-foreground';
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
		<dt class="text-sm font-medium text-muted-foreground">
			{$t('admin.organizations.table.name')}
		</dt>
		<dd class="mt-1 text-lg text-foreground">{organization.name}</dd>
	</div>

	<!-- Description -->
	<div>
		<dt class="text-sm font-medium text-muted-foreground">
			{$t('admin.organizations.table.description')}
		</dt>
		<dd class="mt-1 text-foreground">{organization.description || '-'}</dd>
	</div>

	<!-- Created Date -->
	<div>
		<dt class="text-sm font-medium text-muted-foreground">
			{$t('admin.organizations.table.createdAt')}
		</dt>
		<dd class="mt-1 text-foreground">{formatDate(organization.createdAt)}</dd>
	</div>

	<!-- Updated Date -->
	<div>
		<dt class="text-sm font-medium text-muted-foreground">Última actualización</dt>
		<dd class="mt-1 text-foreground">{formatDate(organization.updatedAt)}</dd>
	</div>

	<!-- Event Count (optional) -->
	{#if organization.eventCount !== undefined}
		<div>
			<dt class="text-sm font-medium text-muted-foreground">
				{$t('admin.organizations.table.eventCount')}
			</dt>
			<dd class="mt-1 text-lg font-semibold text-foreground">{organization.eventCount}</dd>
		</div>
	{/if}

	<!-- Status -->
	<div>
		<dt class="text-sm font-medium text-muted-foreground">
			{$t('admin.organizations.state.label')}
		</dt>
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
