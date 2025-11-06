<script lang="ts">
	import { enhance } from '$app/forms';
	import Onboarding from '$lib/components/Onboarding.svelte';
	import { RoleTypeEnum } from '$lib/types/domain/role-type.domain';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Portal - ACS</title>
</svelte:head>

<!-- Portal Header -->
<div class="bg-white border-b border-gray-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<h1 class="text-xl font-bold">Portal</h1>
			<div class="flex items-center gap-4">
				<span class="text-sm text-gray-600">
					{data.user?.username}
				</span>
				<form method="POST" action="?/logout" use:enhance>
					<button
						type="submit"
						class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
					>
						Cerrar sesión
					</button>
				</form>
			</div>
		</div>
	</div>
</div>

<!-- Portal Content -->
<section class="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
	{#if data.user?.role?.name === RoleTypeEnum.CYCLIST}
		<Onboarding {form} />
	{:else}
		<div class="max-w-4xl mx-auto">
			<h2 class="text-2xl font-bold mb-6">Bienvenido al Portal</h2>
			<div class="bg-white border border-gray-200 rounded-lg p-6">
				<p class="text-gray-600">
					Rol: <span class="font-medium">{data.user?.role?.name || 'No asignado'}</span>
				</p>
			</div>
		</div>
	{/if}
</section>
