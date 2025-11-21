<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ConfirmModal from '$lib/components/custom/ConfirmModal/ConfirmModal.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Modals/ConfirmModal',
		component: ConfirmModal,
		tags: ['autodocs'],
		argTypes: {
			open: {
				control: 'boolean',
				description: 'Whether the modal is open'
			},
			title: {
				control: 'text',
				description: 'Modal title'
			},
			message: {
				control: 'text',
				description: 'Modal message content'
			},
			confirmText: {
				control: 'text',
				description: 'Confirm button text'
			},
			cancelText: {
				control: 'text',
				description: 'Cancel button text'
			},
			variant: {
				control: 'select',
				options: ['danger', 'warning', 'primary'],
				description: 'Visual variant of the modal'
			}
		}
	});
</script>

<script lang="ts">
	let dangerOpen = $state(false);
	let warningOpen = $state(false);
	let primaryOpen = $state(false);
	let confirmCount = $state(0);
	let cancelCount = $state(0);

	const handleConfirm = () => {
		confirmCount++;
		dangerOpen = false;
		warningOpen = false;
		primaryOpen = false;
	};

	const handleCancel = () => {
		cancelCount++;
		dangerOpen = false;
		warningOpen = false;
		primaryOpen = false;
	};
</script>

<Story name="Overview">
<div class="mx-auto max-w-6xl p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Confirm Modal</h1>
		<p class="text-lg text-muted-foreground">
			A modal dialog for confirming critical user actions. Supports different variants for various
			action severities.
		</p>
	</div>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Variants</h2>
		<div class="flex flex-wrap gap-4">
			<button
				class="rounded-md bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/90"
				onclick={() => (dangerOpen = true)}
			>
				Open Danger Modal
			</button>
			<button
				class="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
				onclick={() => (warningOpen = true)}
			>
				Open Warning Modal
			</button>
			<button
				class="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
				onclick={() => (primaryOpen = true)}
			>
				Open Primary Modal
			</button>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Interaction Stats</h2>
		<div class="flex gap-6">
			<div class="rounded-lg bg-card p-4 shadow">
				<p class="text-sm text-muted-foreground">Confirmed</p>
				<p class="text-3xl font-bold text-foreground">{confirmCount}</p>
			</div>
			<div class="rounded-lg bg-card p-4 shadow">
				<p class="text-sm text-muted-foreground">Cancelled</p>
				<p class="text-3xl font-bold text-foreground">{cancelCount}</p>
			</div>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Common Use Cases</h2>
		<div class="grid gap-6 md:grid-cols-3">
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold text-card-foreground">Delete Action (Danger)</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					Use danger variant for destructive actions that cannot be undone.
				</p>
				<code class="text-xs">variant="danger"</code>
			</div>

			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold text-card-foreground">Warning Action</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					Use warning variant for actions that require caution but aren't destructive.
				</p>
				<code class="text-xs">variant="warning"</code>
			</div>

			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold text-card-foreground">Primary Action</h3>
				<p class="mb-4 text-sm text-muted-foreground">
					Use primary variant for standard confirmations.
				</p>
				<code class="text-xs">variant="primary"</code>
			</div>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
		<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
			<li>Accessible with ARIA labels and roles</li>
			<li>Backdrop blur effect</li>
			<li>ESC key to close</li>
			<li>Click outside to close</li>
			<li>Keyboard navigation support</li>
			<li>Three severity variants</li>
		</ul>
	</section>

	<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
		<div class="rounded-lg border border-border bg-muted/50 p-6">
			<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code>&lt;script lang="ts"&gt;
  import ConfirmModal from '$lib/components/custom/ConfirmModal/ConfirmModal.svelte';

  let open = $state(false);

  const handleDelete = () =&gt; &#123;
    // Perform delete action
    open = false;
  &#125;;
&lt;/script&gt;

&lt;button onclick=&#123;() =&gt; (open = true)&#125;&gt;
  Delete Item
&lt;/button&gt;

&lt;ConfirmModal
  &#123;open&#125;
  title="Delete Item"
  message="Are you sure you want to delete this item? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  onConfirm=&#123;handleDelete&#125;
  onCancel=&#123;() =&gt; (open = false)&#125;
/&gt;</code></pre>
		</div>
	</section>
</div>

<ConfirmModal
	open={dangerOpen}
	title="Delete Organization"
	message="Are you sure you want to delete this organization? This action cannot be undone."
	confirmText="Delete"
	cancelText="Cancel"
	variant="danger"
	onConfirm={handleConfirm}
	onCancel={handleCancel}
/>

<ConfirmModal
	open={warningOpen}
	title="Disable User Account"
	message="This will temporarily disable the user account. They can be re-enabled later."
	confirmText="Disable"
	cancelText="Cancel"
	variant="warning"
	onConfirm={handleConfirm}
	onCancel={handleCancel}
/>

<ConfirmModal
	open={primaryOpen}
	title="Publish Event"
	message="This will make the event visible to all users. You can edit it later if needed."
	confirmText="Publish"
	cancelText="Cancel"
	variant="primary"
	onConfirm={handleConfirm}
	onCancel={handleCancel}
/>

</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>
