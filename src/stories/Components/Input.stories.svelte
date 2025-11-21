<script module lang="ts">
	import type { Meta } from '@storybook/svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	export const meta: Meta<typeof Input> = {
		title: 'Components/Input',
		component: Input,
		tags: ['autodocs']
	};
</script>

<script lang="ts">
	import Label from '$lib/components/ui/label/label.svelte';
	import { Search, Mail, Lock, Eye, EyeOff } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let search = $state('');
	let showPassword = $state(false);
</script>

<div class="mx-auto max-w-4xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Input</h1>
		<p class="text-lg text-muted-foreground">
			A form input component for entering text, numbers, and other data.
		</p>
	</div>

	<!-- Basic Inputs -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Basic Inputs</h2>
		<div class="space-y-4">
			<div>
				<Label for="text-input">Text Input</Label>
				<Input id="text-input" type="text" placeholder="Enter text..." />
			</div>
			<div>
				<Label for="email-input">Email Input</Label>
				<Input id="email-input" type="email" placeholder="name@example.com" bind:value={email} />
				{#if email}
					<p class="mt-1 text-sm text-muted-foreground">Value: {email}</p>
				{/if}
			</div>
			<div>
				<Label for="password-input">Password Input</Label>
				<Input
					id="password-input"
					type="password"
					placeholder="Enter password..."
					bind:value={password}
				/>
			</div>
			<div>
				<Label for="number-input">Number Input</Label>
				<Input id="number-input" type="number" placeholder="0" />
			</div>
			<div>
				<Label for="tel-input">Telephone Input</Label>
				<Input id="tel-input" type="tel" placeholder="+1 (555) 000-0000" />
			</div>
			<div>
				<Label for="url-input">URL Input</Label>
				<Input id="url-input" type="url" placeholder="https://example.com" />
			</div>
		</div>
	</section>

	<!-- States -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">States</h2>
		<div class="space-y-4">
			<div>
				<Label for="normal-input">Normal</Label>
				<Input id="normal-input" type="text" placeholder="Normal state" />
			</div>
			<div>
				<Label for="disabled-input">Disabled</Label>
				<Input id="disabled-input" type="text" placeholder="Disabled state" disabled />
			</div>
			<div>
				<Label for="readonly-input">Read Only</Label>
				<Input id="readonly-input" type="text" value="Read only value" readonly />
			</div>
			<div>
				<Label for="required-input">Required</Label>
				<Input id="required-input" type="text" placeholder="Required field" required />
				<p class="mt-1 text-sm text-muted-foreground">This field is required</p>
			</div>
		</div>
	</section>

	<!-- With Icons -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">With Icons</h2>
		<p class="mb-4 text-muted-foreground">
			Inputs can be composed with icons using flex layout and positioning.
		</p>
		<div class="space-y-4">
			<!-- Search with icon -->
			<div>
				<Label for="search-input">Search</Label>
				<div class="relative">
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="search-input"
						type="search"
						placeholder="Search..."
						class="pl-10"
						bind:value={search}
					/>
				</div>
			</div>

			<!-- Email with icon -->
			<div>
				<Label for="email-icon">Email with Icon</Label>
				<div class="relative">
					<Mail class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input id="email-icon" type="email" placeholder="name@example.com" class="pl-10" />
				</div>
			</div>

			<!-- Password with toggle -->
			<div>
				<Label for="password-toggle">Password with Toggle</Label>
				<div class="relative">
					<Lock class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="password-toggle"
						type={showPassword ? 'text' : 'password'}
						placeholder="Enter password..."
						class="px-10"
					/>
					<button
						type="button"
						class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeOff class="size-4" />
						{:else}
							<Eye class="size-4" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Sizing -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Sizing</h2>
		<div class="space-y-4">
			<div>
				<Label>Full Width (default)</Label>
				<Input type="text" placeholder="Full width input" />
			</div>
			<div>
				<Label>Fixed Width</Label>
				<Input type="text" placeholder="Fixed width" class="max-w-xs" />
			</div>
			<div>
				<Label>Small Width</Label>
				<Input type="text" placeholder="Small" class="max-w-32" />
			</div>
		</div>
	</section>

	<!-- Validation -->
	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Validation</h2>
		<div class="space-y-4">
			<div>
				<Label for="valid-input">Valid Input</Label>
				<Input id="valid-input" type="email" value="user@example.com" class="border-success" />
				<p class="mt-1 text-sm text-success">Email is valid</p>
			</div>
			<div>
				<Label for="invalid-input">Invalid Input</Label>
				<Input
					id="invalid-input"
					type="email"
					value="invalid-email"
					class="border-destructive"
					aria-invalid="true"
				/>
				<p class="mt-1 text-sm text-destructive">Please enter a valid email</p>
			</div>
		</div>
	</section>

	<!-- Usage Example -->
	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
					>&lt;script lang="ts"&gt;
  import &#123; Input &#125; from '$lib/components/ui/input';
  import &#123; Label &#125; from '$lib/components/ui/label';

  let email = $state('');
&lt;/script&gt;

&lt;!-- Basic usage --&gt;
&lt;Label for="email"&gt;Email&lt;/Label&gt;
&lt;Input
  id="email"
  type="email"
  placeholder="name@example.com"
  bind:value=&#123;email&#125;
/&gt;

&lt;!-- With icon --&gt;
&lt;div class="relative"&gt;
  &lt;Search class="absolute left-3 top-1/2 -translate-y-1/2" /&gt;
  &lt;Input type="search" placeholder="Search..." class="pl-10" /&gt;
&lt;/div&gt;

&lt;!-- Disabled --&gt;
&lt;Input type="text" disabled /&gt;</code
				></pre>
		</div>
	</section>
</div>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>
