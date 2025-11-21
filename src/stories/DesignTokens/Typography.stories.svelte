<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design Tokens/Typography',
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script lang="ts">
	const headings = [
		{ tag: 'h1', class: 'text-4xl', label: 'Heading 1', size: '36px / 2.25rem' },
		{ tag: 'h2', class: 'text-3xl', label: 'Heading 2', size: '30px / 1.875rem' },
		{ tag: 'h3', class: 'text-2xl', label: 'Heading 3', size: '24px / 1.5rem' },
		{ tag: 'h4', class: 'text-xl', label: 'Heading 4', size: '20px / 1.25rem' },
		{ tag: 'h5', class: 'text-lg', label: 'Heading 5', size: '18px / 1.125rem' },
		{ tag: 'h6', class: 'text-base', label: 'Heading 6', size: '16px / 1rem' }
	];

	const textSizes = [
		{ class: 'text-xs', label: 'Extra Small', size: '12px / 0.75rem', lineHeight: '16px' },
		{ class: 'text-sm', label: 'Small', size: '14px / 0.875rem', lineHeight: '20px' },
		{ class: 'text-base', label: 'Base', size: '16px / 1rem', lineHeight: '24px' },
		{ class: 'text-lg', label: 'Large', size: '18px / 1.125rem', lineHeight: '28px' },
		{ class: 'text-xl', label: 'Extra Large', size: '20px / 1.25rem', lineHeight: '28px' },
		{ class: 'text-2xl', label: '2XL', size: '24px / 1.5rem', lineHeight: '32px' },
		{ class: 'text-3xl', label: '3XL', size: '30px / 1.875rem', lineHeight: '36px' },
		{ class: 'text-4xl', label: '4XL', size: '36px / 2.25rem', lineHeight: '40px' }
	];

	const fontWeights = [
		{ class: 'font-normal', label: 'Normal', weight: '400' },
		{ class: 'font-medium', label: 'Medium', weight: '500' },
		{ class: 'font-semibold', label: 'Semibold', weight: '600' },
		{ class: 'font-bold', label: 'Bold', weight: '700' }
	];
</script>
<Story name="Overview">
<div class="mx-auto max-w-7xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Typography System</h1>
		<p class="text-lg text-muted-foreground">
			Consistent typography scale and weights for building clear content hierarchy.
		</p>
	</div>
<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Headings</h2>
		<div class="space-y-6">
			{#each headings as heading}
				<div class="flex items-center gap-6 rounded-lg border border-border bg-card p-6">
					<div class="min-w-32">
						<div class="mb-1 text-sm font-semibold text-card-foreground">{heading.label}</div>
						<code class="text-xs text-muted-foreground">{heading.class}</code>
					</div>
					<div class="flex-1">
						{#if heading.tag === 'h1'}
							<h1 class="{heading.class} font-bold text-card-foreground">
								The quick brown fox jumps over the lazy dog
							</h1>
						{:else if heading.tag === 'h2'}
							<h2 class="{heading.class} font-semibold text-card-foreground">
								The quick brown fox jumps over the lazy dog
							</h2>
						{:else if heading.tag === 'h3'}
							<h3 class="{heading.class} font-semibold text-card-foreground">
								The quick brown fox jumps over the lazy dog
							</h3>
						{:else if heading.tag === 'h4'}
							<h4 class="{heading.class} font-semibold text-card-foreground">
								The quick brown fox jumps over the lazy dog
							</h4>
						{:else if heading.tag === 'h5'}
							<h5 class="{heading.class} font-semibold text-card-foreground">
								The quick brown fox jumps over the lazy dog
							</h5>
						{:else if heading.tag === 'h6'}
							<h6 class="{heading.class} font-semibold text-card-foreground">
								The quick brown fox jumps over the lazy dog
							</h6>
						{/if}
					</div>
					<div class="min-w-24 text-right">
						<div class="text-sm text-muted-foreground">{heading.size}</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Text Sizes</h2>
		<div class="space-y-4">
			{#each textSizes as size}
				<div class="flex items-center gap-6 rounded-lg border border-border bg-card p-6">
					<div class="min-w-32">
						<div class="mb-1 text-sm font-semibold text-card-foreground">{size.label}</div>
						<code class="text-xs text-muted-foreground">{size.class}</code>
					</div>
					<div class="flex-1">
						<p class="{size.class} text-card-foreground">
							The quick brown fox jumps over the lazy dog
						</p>
					</div>
					<div class="min-w-32 text-right">
						<div class="text-sm text-muted-foreground">{size.size}</div>
						<div class="text-xs text-muted-foreground">LH: {size.lineHeight}</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Font Weights</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each fontWeights as weight}
				<div class="rounded-lg border border-border bg-card p-6">
					<div class="mb-4">
						<div class="mb-1 font-semibold text-card-foreground">{weight.label}</div>
						<code class="text-xs text-muted-foreground">{weight.class} ({weight.weight})</code>
					</div>
					<p class="{weight.class} text-lg text-card-foreground">
						The quick brown fox jumps over the lazy dog
					</p>
				</div>
			{/each}
		</div>
	</section>
<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<h3 class="mb-3 font-semibold text-foreground">Tailwind Classes</h3>
			<pre
				class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>
&lt;h1 class="text-4xl font-bold"&gt;Page Title&lt;/h1&gt;
&lt;h2 class="text-2xl font-semibold"&gt;Section Title&lt;/h2&gt;
&lt;p class="text-base"&gt;Regular paragraph text&lt;/p&gt;
&lt;p class="text-sm text-muted-foreground"&gt;Helper text&lt;/p&gt;
&lt;span class="text-lg font-semibold"&gt;Important text&lt;/span&gt;</code></pre>
		</div>
	</section>
</div>
</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>
