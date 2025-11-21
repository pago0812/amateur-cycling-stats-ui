<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from '$lib/components/ui/button/button.svelte';

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
				description: 'The visual style variant of the button'
			},
			size: {
				control: 'select',
				options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
				description: 'The size of the button'
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the button is disabled'
			}
		}
	});
</script>

<script lang="ts">
	import { ChevronRight, Download, Heart, Plus, Trash2 } from '@lucide/svelte';

	let clickCount = $state(0);
</script>

<Story name="Overview">
	<div class="mx-auto max-w-6xl p-8">
		<div class="mb-12">
			<h1 class="mb-2 text-4xl font-bold text-foreground">Button</h1>
			<p class="text-lg text-muted-foreground">
				Displays a button or a component that looks like a button.
			</p>
		</div>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Variants</h2>
			<div class="flex flex-wrap gap-4">
				<Button variant="default">Default</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
			</div>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Sizes</h2>
			<div class="flex flex-wrap items-center gap-4">
				<Button size="sm">Small</Button>
				<Button size="default">Default</Button>
				<Button size="lg">Large</Button>
			</div>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">With Icons</h2>
			<div class="space-y-6">
				<div>
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Icon on left</h3>
					<div class="flex flex-wrap gap-4">
						<Button>
							<Download />
							Download
						</Button>
						<Button variant="outline">
							<Plus />
							Add Item
						</Button>
						<Button variant="secondary">
							<Heart />
							Favorite
						</Button>
					</div>
				</div>
				<div>
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Icon on right</h3>
					<div class="flex flex-wrap gap-4">
						<Button>
							Continue
							<ChevronRight />
						</Button>
						<Button variant="outline">
							Next Step
							<ChevronRight />
						</Button>
					</div>
				</div>
				<div>
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Icon only</h3>
					<div class="flex flex-wrap gap-4">
						<Button size="icon">
							<Plus />
						</Button>
						<Button size="icon" variant="outline">
							<Download />
						</Button>
						<Button size="icon" variant="destructive">
							<Trash2 />
						</Button>
						<Button size="icon-sm">
							<Heart />
						</Button>
						<Button size="icon-lg" variant="secondary">
							<Download />
						</Button>
					</div>
				</div>
			</div>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">States</h2>
			<div class="space-y-6">
				<div>
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Disabled</h3>
					<div class="flex flex-wrap gap-4">
						<Button disabled>Default Disabled</Button>
						<Button variant="outline" disabled>Outline Disabled</Button>
						<Button variant="secondary" disabled>Secondary Disabled</Button>
					</div>
				</div>
				<div>
					<h3 class="mb-3 text-sm font-medium text-muted-foreground">Interactive</h3>
					<div class="flex flex-wrap items-center gap-4">
						<Button onclick={() => clickCount++}>Click me ({clickCount})</Button>
						<Button variant="outline" onclick={() => (clickCount = 0)}>Reset</Button>
					</div>
				</div>
			</div>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">As Link</h2>
			<p class="mb-4 text-muted-foreground">
				Buttons can render as <code class="rounded bg-muted px-1.5 py-0.5 text-sm">{'<a>'}</code>
				tags when an <code class="rounded bg-muted px-1.5 py-0.5 text-sm">href</code> prop is provided.
			</p>
			<div class="flex flex-wrap gap-4">
				<Button href="https://shadcn-svelte.com" target="_blank">Visit shadcn-svelte</Button>
				<Button href="#top" variant="outline">Scroll to top</Button>
				<Button href="/login" variant="ghost">Login</Button>
			</div>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Common Use Cases</h2>
			<div class="grid gap-6 md:grid-cols-2">
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-4 font-semibold text-card-foreground">Primary Actions</h3>
					<div class="flex flex-col gap-3">
						<Button class="w-full">Save Changes</Button>
						<Button class="w-full">
							<Plus />
							Create New
						</Button>
						<Button class="w-full">Submit Form</Button>
					</div>
				</div>
				<div class="rounded-lg border border-border bg-card p-6">
					<h3 class="mb-4 font-semibold text-card-foreground">Destructive Actions</h3>
					<div class="flex flex-col gap-3">
						<Button variant="destructive" class="w-full">
							<Trash2 />
							Delete Account
						</Button>
						<Button variant="destructive" class="w-full">Remove Item</Button>
						<Button variant="outline" class="w-full">Cancel</Button>
					</div>
				</div>
			</div>
		</section>
		<section>
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
			<div class="rounded-lg border border-border bg-muted/50 p-6">
				<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
						>&lt;script lang="ts"&gt;
  import &#123; Button &#125; from '$lib/components/ui/button';
  import &#123; Download &#125; from '@lucide/svelte';

  let count = $state(0);
&lt;/script&gt;

&lt;!-- Basic button --&gt;
&lt;Button&gt;Click me&lt;/Button&gt;

&lt;!-- With variants --&gt;
&lt;Button variant="destructive"&gt;Delete&lt;/Button&gt;
&lt;Button variant="outline"&gt;Cancel&lt;/Button&gt;

&lt;!-- With icons --&gt;
&lt;Button&gt;
  &lt;Download /&gt;
  Download
&lt;/Button&gt;

&lt;!-- As link --&gt;
&lt;Button href="/login"&gt;Login&lt;/Button&gt;

&lt;!-- Event handling --&gt;
&lt;Button onclick=&#123;() =&gt; count++&#125;&gt;
  Count: &#123;count&#125;
&lt;/Button&gt;</code
					></pre>
			</div>
		</section>
	</div>
</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>
