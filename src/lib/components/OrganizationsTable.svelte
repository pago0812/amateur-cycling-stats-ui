<script lang="ts">
	import type { Organization, OrganizationState } from '$lib/types/domain';
	import { t } from '$lib/i18n';

	let { organizations }: { organizations: Organization[] } = $props();

	// Format date to locale string
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Truncate text with ellipsis
	function truncate(text: string | null, maxLength: number): string {
		if (!text) return '-';
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

	// Get state label
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

<div class="overflow-x-auto rounded-lg bg-white shadow-md">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<!-- Name - always visible -->
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('admin.organizations.table.name')}
				</th>
				<!-- State - always visible -->
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('admin.organizations.table.state')}
				</th>
				<!-- Description - hidden on mobile, visible on md+ -->
				<th
					class="hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase md:table-cell"
				>
					{$t('admin.organizations.table.description')}
				</th>
				<!-- Event Count - hidden on mobile, visible on sm+ -->
				<th
					class="hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:table-cell"
				>
					{$t('admin.organizations.table.eventCount')}
				</th>
				<!-- Created Date - hidden on mobile and tablet, visible on lg+ -->
				<th
					class="hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase lg:table-cell"
				>
					{$t('admin.organizations.table.createdAt')}
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 bg-white">
			{#if organizations.length === 0}
				<tr>
					<td colspan="5" class="px-6 py-8 text-center text-gray-500">
						{$t('admin.organizations.table.noResults')}
					</td>
				</tr>
			{:else}
				{#each organizations as org (org.id)}
					<tr class="cursor-pointer transition-colors hover:bg-gray-50">
						<!-- Make entire row clickable by wrapping in a link -->
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
							<a
								href="/admin/organizations/{org.id}"
								class="block font-medium text-blue-600 hover:text-blue-800"
							>
								{org.name}
							</a>
						</td>
						<!-- State - always visible -->
						<td class="px-6 py-4 text-sm whitespace-nowrap">
							<a href="/admin/organizations/{org.id}" class="block">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStateBadgeClasses(
										org.state
									)}"
								>
									{getStateLabel(org.state)}
								</span>
							</a>
						</td>
						<!-- Description - hidden on mobile -->
						<td class="hidden px-6 py-4 text-sm text-gray-600 md:table-cell">
							<a href="/admin/organizations/{org.id}" class="block" title={org.description || ''}>
								{truncate(org.description, 50)}
							</a>
						</td>
						<!-- Event Count - hidden on mobile -->
						<td class="hidden px-6 py-4 text-sm text-gray-900 sm:table-cell">
							<a href="/admin/organizations/{org.id}" class="block">
								{org.eventCount ?? 0}
							</a>
						</td>
						<!-- Created Date - hidden on mobile and tablet -->
						<td class="hidden px-6 py-4 text-sm whitespace-nowrap text-gray-600 lg:table-cell">
							<a href="/admin/organizations/{org.id}" class="block">
								{formatDate(org.createdAt)}
							</a>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
