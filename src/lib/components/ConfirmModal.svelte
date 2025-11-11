<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	interface ConfirmModalProps {
		open: boolean;
		title: string;
		message: string;
		confirmText: string;
		cancelText: string;
		variant?: 'danger' | 'warning' | 'primary';
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmText,
		cancelText,
		variant = 'danger',
		onConfirm,
		onCancel
	}: ConfirmModalProps = $props();

	// Map variant to Button color
	const confirmColor = $derived(() => {
		switch (variant) {
			case 'danger':
				return 'danger';
			case 'warning':
				return 'secondary';
			case 'primary':
				return 'primary';
			default:
				return 'primary';
		}
	});

	// Handle escape key
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && open) {
			onCancel();
		}
	};

	// Handle backdrop click
	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop with transition -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<!-- Modal Dialog -->
		<div
			class="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-transform"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			aria-describedby="modal-description"
		>
			<!-- Title -->
			<h2 id="modal-title" class="mb-4 text-xl font-bold text-gray-900">
				{title}
			</h2>

			<!-- Message -->
			<p id="modal-description" class="mb-6 text-gray-600">
				{message}
			</p>

			<!-- Action Buttons -->
			<div class="flex justify-end gap-3">
				<Button variant="outlined" color="secondary" onclick={onCancel}>
					{cancelText}
				</Button>
				<Button variant="filled" color={confirmColor()} onclick={onConfirm}>
					{confirmText}
				</Button>
			</div>
		</div>
	</div>
{/if}
