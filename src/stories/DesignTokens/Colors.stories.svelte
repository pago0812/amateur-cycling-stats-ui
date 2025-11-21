<script module lang="ts">
	import type { Meta } from '@storybook/svelte';

	export const meta: Meta = {
		title: 'Design Tokens/Colors',
		parameters: {
			layout: 'fullscreen'
		}
	};
</script>

<script lang="ts">
	const semanticColors = [
		{ name: 'Background', var: '--background', description: 'Page background color' },
		{ name: 'Foreground', var: '--foreground', description: 'Primary text color' },
		{ name: 'Card', var: '--card', description: 'Card background color' },
		{ name: 'Card Foreground', var: '--card-foreground', description: 'Card text color' },
		{ name: 'Popover', var: '--popover', description: 'Popover background color' },
		{ name: 'Popover Foreground', var: '--popover-foreground', description: 'Popover text color' },
		{ name: 'Primary', var: '--primary', description: 'Primary brand color' },
		{
			name: 'Primary Foreground',
			var: '--primary-foreground',
			description: 'Text on primary color'
		},
		{ name: 'Secondary', var: '--secondary', description: 'Secondary color for less emphasis' },
		{
			name: 'Secondary Foreground',
			var: '--secondary-foreground',
			description: 'Text on secondary color'
		},
		{ name: 'Muted', var: '--muted', description: 'Muted background color' },
		{ name: 'Muted Foreground', var: '--muted-foreground', description: 'Muted text color' },
		{ name: 'Accent', var: '--accent', description: 'Accent color for highlights' },
		{ name: 'Accent Foreground', var: '--accent-foreground', description: 'Text on accent color' },
		{ name: 'Destructive', var: '--destructive', description: 'Error and destructive actions' },
		{
			name: 'Destructive Foreground',
			var: '--destructive-foreground',
			description: 'Text on destructive color'
		},
		{ name: 'Success', var: '--success', description: 'Success state color' },
		{
			name: 'Success Foreground',
			var: '--success-foreground',
			description: 'Text on success color'
		},
		{ name: 'Warning', var: '--warning', description: 'Warning state color' },
		{
			name: 'Warning Foreground',
			var: '--warning-foreground',
			description: 'Text on warning color'
		},
		{ name: 'Info', var: '--info', description: 'Informational state color' },
		{ name: 'Info Foreground', var: '--info-foreground', description: 'Text on info color' },
		{ name: 'Border', var: '--border', description: 'Border color' },
		{ name: 'Input', var: '--input', description: 'Input border color' },
		{ name: 'Ring', var: '--ring', description: 'Focus ring color' }
	];

	const chartColors = [
		{ name: 'Chart 1', var: '--chart-1' },
		{ name: 'Chart 2', var: '--chart-2' },
		{ name: 'Chart 3', var: '--chart-3' },
		{ name: 'Chart 4', var: '--chart-4' },
		{ name: 'Chart 5', var: '--chart-5' }
	];
</script>

<div class="mx-auto max-w-7xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Color System</h1>
		<p class="text-lg text-muted-foreground">
			Our color palette uses CSS custom properties with OKLCH color space for better color
			consistency across light and dark modes.
		</p>
	</div>

	<!-- Semantic Colors -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Semantic Colors</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each semanticColors as color}
				<div class="overflow-hidden rounded-lg border border-border bg-card">
					<div
						class="h-24 w-full"
						style="background-color: hsl(var({color.var}))"
						aria-label={color.name}
					></div>
					<div class="p-4">
						<h3 class="mb-1 font-semibold text-card-foreground">{color.name}</h3>
						<code class="mb-2 block text-xs text-muted-foreground">{color.var}</code>
						{#if color.description}
							<p class="text-sm text-muted-foreground">{color.description}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Chart Colors -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Chart Colors</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
			{#each chartColors as color}
				<div class="overflow-hidden rounded-lg border border-border bg-card">
					<div
						class="h-32 w-full"
						style="background-color: hsl(var({color.var}))"
						aria-label={color.name}
					></div>
					<div class="p-4">
						<h3 class="mb-1 font-semibold text-card-foreground">{color.name}</h3>
						<code class="text-xs text-muted-foreground">{color.var}</code>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Usage Example -->
	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<h3 class="mb-3 font-semibold text-foreground">CSS Custom Properties</h3>
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
					>/* Use with hsl() */
background-color: hsl(var(--primary));
color: hsl(var(--primary-foreground));

/* Use with Tailwind classes */
class="bg-primary text-primary-foreground"
class="border-border text-muted-foreground"</code
				></pre>
		</div>
	</section>
</div>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>
