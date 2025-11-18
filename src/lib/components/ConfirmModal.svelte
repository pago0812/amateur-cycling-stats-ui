<script lang="ts">
	import { Button } from '$lib/components/ui/button';

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

	// Map variant to Button variant
	const confirmVariant = $derived(() => {
		switch (variant) {
			case 'danger':
				return 'destructive';
			case 'warning':
				return 'secondary';
			case 'primary':
				return 'default';
			default:
				return 'default';
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
		class="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm transition-opacity"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<!-- Modal Dialog -->
		<div
			class="relative mx-4 w-full max-w-md rounded-lg bg-card p-6 shadow-xl transition-transform"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			aria-describedby="modal-description"
		>
			<!-- Title -->
			<h2 id="modal-title" class="mb-4 text-xl font-bold text-foreground">
				{title}
			</h2>

			<!-- Message -->
			<p id="modal-description" class="mb-6 text-muted-foreground">
				{message}
			</p>

			<!-- Action Buttons -->
			<div class="flex justify-end gap-3">
				<Button variant="outline" onclick={onCancel}>
					{cancelText}
				</Button>
				<Button variant={confirmVariant()} onclick={onConfirm}>
					{confirmText}
				</Button>
			</div>
		</div>
	</div>
{/if}
