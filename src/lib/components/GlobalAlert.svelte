<script lang="ts">
	import { alertStore } from '$lib/stores/alert-store';

	function handleClose() {
		alertStore.closeAlert();
	}
</script>

{#if $alertStore.open}
	<div class="fixed top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 transform px-4">
		<div
			class="flex items-center justify-between rounded-lg bg-red-600 px-6 py-4 text-white shadow-lg"
			role="alert"
		>
			<div class="flex items-center gap-3">
				<svg
					class="h-6 w-6 flex-shrink-0"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="font-medium">{$alertStore.text}</span>
			</div>
			<button
				onclick={handleClose}
				class="ml-4 text-white hover:text-gray-200 focus:outline-none"
				aria-label="Cerrar"
			>
				<svg
					class="h-5 w-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>
	</div>
{/if}
