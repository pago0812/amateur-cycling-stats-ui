<script lang="ts">
	import { enhance } from '$app/forms';
	import { RoleTypeEnum } from '$lib/types/collections/roles';
	import { alertStore } from '$lib/stores/alert-store';
	import type { ActionData } from '../../routes/portal/$types';

	let { form }: { form: ActionData } = $props();

	let selectedRole = $state<RoleTypeEnum>(RoleTypeEnum.CYCLIST);

	// Show error in alert if present
	$effect(() => {
		if (form?.error) {
			alertStore.openAlert(form.error);
		}
	});
</script>

<div class="flex flex-col items-center max-w-2xl mx-auto">
	<h3 class="text-2xl font-bold mb-8">Elige tu perfil</h3>

	<div class="flex gap-4 mb-8 w-full">
		<button
			type="button"
			onclick={() => (selectedRole = RoleTypeEnum.CYCLIST)}
			class="flex-1 p-6 border-2 rounded-lg cursor-pointer transition-all {selectedRole ===
			RoleTypeEnum.CYCLIST
				? 'border-blue-600 bg-blue-50'
				: 'border-gray-300 hover:border-gray-400'}"
		>
			<p class="text-lg font-medium">Ciclista</p>
		</button>

		<button
			type="button"
			onclick={() => (selectedRole = RoleTypeEnum.ORGANIZER_ADMIN)}
			class="flex-1 p-6 border-2 rounded-lg cursor-pointer transition-all {selectedRole ===
			RoleTypeEnum.ORGANIZER_ADMIN
				? 'border-blue-600 bg-blue-50'
				: 'border-gray-300 hover:border-gray-400'}"
		>
			<p class="text-lg font-medium">Organizador</p>
		</button>
	</div>

	<form method="POST" action="?/updateRole" use:enhance class="w-full">
		<input type="hidden" name="roleType" value={selectedRole} />
		<button
			type="submit"
			class="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-lg"
		>
			Elegir
		</button>
	</form>
</div>
