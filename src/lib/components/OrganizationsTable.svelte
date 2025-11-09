<script lang="ts">
	import type { Organization } from '$lib/types/domain';
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
</script>

<div class="overflow-x-auto rounded-lg bg-white shadow-md">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<!-- Name - always visible -->
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('admin.organizations.table.name')}
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
					<td colspan="4" class="px-6 py-8 text-center text-gray-500">
						{$t('admin.organizations.table.noResults')}
					</td>
				</tr>
			{:else}
				{#each organizations as org (org.id)}
					<tr class="cursor-pointer hover:bg-gray-50 transition-colors">
						<!-- Make entire row clickable by wrapping in a link -->
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
							<a
								href="/admin/organizations/{org.id}"
								class="block font-medium text-blue-600 hover:text-blue-800"
							>
								{org.name}
							</a>
						</td>
						<!-- Description - hidden on mobile -->
						<td class="hidden px-6 py-4 text-sm text-gray-600 md:table-cell">
							<a
								href="/admin/organizations/{org.id}"
								class="block"
								title={org.description || ''}
							>
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
						<td class="hidden px-6 py-4 text-sm text-gray-600 whitespace-nowrap lg:table-cell">
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
