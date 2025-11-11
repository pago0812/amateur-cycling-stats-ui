<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ButtonProps {
		// Content
		children: Snippet;

		// Behavior
		type?: 'button' | 'submit' | 'reset';
		href?: string; // When provided, renders as <a> instead of <button>
		disabled?: boolean;

		// Styling
		variant?: 'filled' | 'outlined' | 'text';
		color?: 'primary' | 'secondary' | 'danger' | 'success';
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;

		// Event handlers
		onclick?: () => void;

		// Accessibility
		ariaLabel?: string;
		ariaExpanded?: boolean;
	}

	let {
		children,
		type = 'button',
		href,
		disabled = false,
		variant = 'filled',
		color = 'primary',
		size = 'md',
		fullWidth = false,
		onclick,
		ariaLabel,
		ariaExpanded
	}: ButtonProps = $props();

	// Base styles applied to all buttons
	const baseStyles =
		'rounded-md font-medium transition-all duration-200 focus:outline-none inline-flex items-center justify-center cursor-pointer hover:shadow-md active:transform active:scale-95';

	// Size mappings
	const sizeStyles = $derived(() => {
		switch (size) {
			case 'sm':
				return 'text-sm px-2 py-1.5';
			case 'lg':
				return 'text-lg px-6 py-3';
			case 'md':
			default:
				return 'text-base px-4 py-2';
		}
	});

	// Variant + Color combinations
	const variantStyles = $derived(() => {
		// Filled variant
		if (variant === 'filled') {
			switch (color) {
				case 'primary':
					return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
				case 'secondary':
					return 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2';
				case 'danger':
					return 'bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
				case 'success':
					return 'bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2';
			}
		}

		// Outlined variant
		if (variant === 'outlined') {
			switch (color) {
				case 'primary':
					return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
				case 'secondary':
					return 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2';
				case 'danger':
					return 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
				case 'success':
					return 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2';
			}
		}

		// Text variant
		if (variant === 'text') {
			switch (color) {
				case 'primary':
					return 'text-gray-800 hover:text-gray-600 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2';
				case 'secondary':
					return 'text-gray-500 hover:text-gray-800 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2';
				case 'danger':
					return 'text-gray-800 hover:text-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-2';
				case 'success':
					return 'text-green-600 hover:text-green-700 focus:ring-2 focus:ring-green-400 focus:ring-offset-2';
			}
		}

		return '';
	});

	// Width styles
	const widthStyles = $derived(fullWidth ? 'w-full' : '');

	// Disabled styles
	const disabledStyles = $derived(
		disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
	);

	// Combined classes
	const classes = $derived(
		`${baseStyles} ${sizeStyles()} ${variantStyles()} ${widthStyles} ${disabledStyles}`.trim()
	);

	// Handle click event
	const handleClick = () => {
		if (!disabled && onclick) {
			onclick();
		}
	};
</script>

{#if href}
	<!-- Render as link when href is provided -->
	<a
		{href}
		class={classes}
		role="button"
		aria-label={ariaLabel}
		aria-disabled={disabled}
		onclick={handleClick}
	>
		{@render children()}
	</a>
{:else}
	<!-- Render as button -->
	<button
		{type}
		class={classes}
		{disabled}
		aria-label={ariaLabel}
		aria-expanded={ariaExpanded}
		onclick={handleClick}
	>
		{@render children()}
	</button>
{/if}
