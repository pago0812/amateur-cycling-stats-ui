<script module lang="ts">
	import type { Meta } from '@storybook/svelte';

	export const meta: Meta = {
		title: 'Design Tokens/Spacing',
		parameters: {
			layout: 'fullscreen'
		}
	};
</script>

<script lang="ts">
	const spacingScale = [
		{ class: 'p-0', value: '0', px: '0px' },
		{ class: 'p-0.5', value: '0.5', px: '2px' },
		{ class: 'p-1', value: '1', px: '4px' },
		{ class: 'p-1.5', value: '1.5', px: '6px' },
		{ class: 'p-2', value: '2', px: '8px' },
		{ class: 'p-2.5', value: '2.5', px: '10px' },
		{ class: 'p-3', value: '3', px: '12px' },
		{ class: 'p-3.5', value: '3.5', px: '14px' },
		{ class: 'p-4', value: '4', px: '16px' },
		{ class: 'p-5', value: '5', px: '20px' },
		{ class: 'p-6', value: '6', px: '24px' },
		{ class: 'p-7', value: '7', px: '28px' },
		{ class: 'p-8', value: '8', px: '32px' },
		{ class: 'p-9', value: '9', px: '36px' },
		{ class: 'p-10', value: '10', px: '40px' },
		{ class: 'p-11', value: '11', px: '44px' },
		{ class: 'p-12', value: '12', px: '48px' },
		{ class: 'p-14', value: '14', px: '56px' },
		{ class: 'p-16', value: '16', px: '64px' }
	];

	const borderRadii = [
		{ var: '--radius-sm', label: 'Small', value: 'calc(var(--radius) - 4px)', approx: '~6px' },
		{ var: '--radius-md', label: 'Medium', value: 'calc(var(--radius) - 2px)', approx: '~8px' },
		{ var: '--radius-lg', label: 'Large', value: 'var(--radius)', approx: '10px' },
		{ var: '--radius-xl', label: 'Extra Large', value: 'calc(var(--radius) + 4px)', approx: '~14px' },
		{ var: '--radius', label: 'Default', value: '0.65rem', approx: '10px' }
	];
</script>

<div class="mx-auto max-w-7xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Spacing System</h1>
		<p class="text-lg text-muted-foreground">
			Consistent spacing scale and border radius values for harmonious layouts.
		</p>
	</div>

	<!-- Spacing Scale -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Spacing Scale</h2>
		<p class="mb-6 text-muted-foreground">
			Based on Tailwind's default spacing scale (4px = 1 unit). Use for padding, margin, and gap.
		</p>
		<div class="space-y-4">
			{#each spacingScale as space}
				<div class="flex items-center gap-6 rounded-lg border border-border bg-card p-4">
					<div class="min-w-24">
						<code class="text-sm font-semibold text-card-foreground">{space.value}</code>
					</div>
					<div class="min-w-20 text-sm text-muted-foreground">{space.px}</div>
					<div class="flex-1">
						<div class="h-8 bg-primary" style="width: {space.px}"></div>
					</div>
					<div class="min-w-32">
						<code class="text-xs text-muted-foreground">{space.class}</code>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Border Radius -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Border Radius</h2>
		<p class="mb-6 text-muted-foreground">
			Smooth, consistent corner radii based on the CSS variable <code
				class="rounded bg-muted px-1.5 py-0.5 text-sm">--radius</code
			> (10px).
		</p>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each borderRadii as radius}
				<div class="overflow-hidden rounded-lg border border-border bg-card p-6">
					<div class="mb-4">
						<h3 class="mb-1 font-semibold text-card-foreground">{radius.label}</h3>
						<code class="text-xs text-muted-foreground">{radius.var}</code>
					</div>
					<div class="mb-3 text-sm text-muted-foreground">
						{radius.value}
						<span class="text-xs">({radius.approx})</span>
					</div>
					<div
						class="h-24 bg-primary"
						style="border-radius: var({radius.var})"
						aria-label="{radius.label} border radius"
					></div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Common Patterns -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Common Spacing Patterns</h2>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Card Padding -->
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold text-card-foreground">Card Padding</h3>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Compact</span>
						<code class="text-card-foreground">p-4 (16px)</code>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Default</span>
						<code class="text-card-foreground">p-6 (24px)</code>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Spacious</span>
						<code class="text-card-foreground">p-8 (32px)</code>
					</div>
				</div>
			</div>

			<!-- Stack Spacing -->
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold text-card-foreground">Stack Spacing</h3>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Tight</span>
						<code class="text-card-foreground">gap-2 (8px)</code>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Default</span>
						<code class="text-card-foreground">gap-4 (16px)</code>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Loose</span>
						<code class="text-card-foreground">gap-6 (24px)</code>
					</div>
				</div>
			</div>

			<!-- Form Fields -->
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold text-card-foreground">Form Field Spacing</h3>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Between fields</span>
						<code class="text-card-foreground">gap-4 (16px)</code>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Label margin</span>
						<code class="text-card-foreground">mb-2 (8px)</code>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Input padding</span>
						<code class="text-card-foreground">px-3 py-2 (12px 8px)</code>
					</div>
				</div>
			</div>

			<!-- Section Spacing -->
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold text-card-foreground">Section Spacing</h3>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Between sections</span>
						<code class="text-card-foreground">mb-8 or mb-12</code>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Section title margin</span>
						<code class="text-card-foreground">mb-4 or mb-6</code>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Page padding</span>
						<code class="text-card-foreground">py-8 or py-12</code>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Usage Example -->
	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<h3 class="mb-3 font-semibold text-foreground">Tailwind Classes</h3>
			<pre
				class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code><!-- Padding -->
class="p-4"      <!-- 16px all sides -->
class="px-6 py-4" <!-- 24px horizontal, 16px vertical -->

<!-- Margin -->
class="mb-4"     <!-- 16px bottom margin -->
class="mx-auto"  <!-- Auto horizontal centering -->

<!-- Gap (Flexbox/Grid) -->
class="flex gap-4"  <!-- 16px gap between items -->
class="grid gap-6"  <!-- 24px gap between grid items -->

<!-- Border Radius -->
class="rounded-lg"   <!-- var(--radius-lg) -->
class="rounded-md"   <!-- var(--radius-md) --></code></pre>
		</div>
	</section>
</div>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>
