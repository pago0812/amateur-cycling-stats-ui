<script lang="ts">
	import type { OrganizerWithRelations } from '$lib/types/domain';
	import { t } from '$lib/i18n';

	let { organizers }: { organizers: OrganizerWithRelations[] } = $props();

	// Format date to locale string
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="overflow-x-auto rounded-lg bg-white shadow-md">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<!-- Name - always visible -->
				<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
					{$t('common.members.table.name')}
				</th>
				<!-- Role - hidden on mobile, visible on sm+ -->
				<th
					class="hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:table-cell"
				>
					{$t('common.members.table.role')}
				</th>
				<!-- Date Added - hidden on mobile, visible on md+ -->
				<th
					class="hidden px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase md:table-cell"
				>
					{$t('common.members.table.dateAdded')}
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 bg-white">
			{#if organizers.length === 0}
				<tr>
					<td colspan="3" class="px-6 py-8 text-center text-gray-500">
						{$t('common.members.table.noResults')}
					</td>
				</tr>
			{:else}
				{#each organizers as organizer (organizer.id)}
					<tr>
						<!-- Name -->
						<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
							<span class="font-medium">
								{organizer.user?.firstName ?? ''} {organizer.user?.lastName ?? ''}
							</span>
						</td>
						<!-- Role - hidden on mobile -->
						<td class="hidden px-6 py-4 text-sm text-gray-600 sm:table-cell">
							{organizer.user?.role?.name ?? '-'}
						</td>
						<!-- Date Added - hidden on mobile -->
						<td class="hidden px-6 py-4 text-sm text-gray-600 whitespace-nowrap md:table-cell">
							{formatDate(organizer.createdAt)}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
