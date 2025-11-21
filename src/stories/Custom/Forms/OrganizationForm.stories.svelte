<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrganizationForm from '$lib/components/custom/OrganizationForm/OrganizationForm.svelte';

	const { Story } = defineMeta({
		title: 'Custom/Forms/OrganizationForm',
		component: OrganizationForm,
		tags: ['autodocs'],
		argTypes: {
			mode: {
				control: 'select',
				options: ['create', 'edit'],
				description: 'Form mode: create or edit'
			}
		}
	});
</script>

<script lang="ts">
	import { mockOrganizationActive } from '../../mocks';

	let createFormElement = $state<HTMLFormElement>();
	let editFormElement = $state<HTMLFormElement>();
	let isSubmitting = $state(false);

	const handleSubmit = () => {
		isSubmitting = true;
		setTimeout(() => {
			isSubmitting = false;
			console.log('Form submitted');
		}, 1000);
	};
</script>

<Story name="Overview">
	<div class="mx-auto max-w-6xl p-8">
		<div class="mb-12">
			<h1 class="mb-2 text-4xl font-bold text-foreground">Organization Form</h1>
			<p class="text-lg text-muted-foreground">
				Reusable form component for creating and editing organizations. Includes fields for name,
				description, and (in create mode) owner email and name.
			</p>
		</div>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Create Mode (New Organization)</h2>
			<div class="rounded-lg border border-border bg-card p-6">
				<OrganizationForm
					mode="create"
					bind:formElement={createFormElement}
					action="/admin/organizations?/create"
				/>
				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						class="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
					>
						Cancel
					</button>
					<button
						type="submit"
						onclick={() => createFormElement?.requestSubmit()}
						class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
					>
						Create Organization
					</button>
				</div>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Edit Mode (Existing Organization)</h2>
			<div class="rounded-lg border border-border bg-card p-6">
				<OrganizationForm
					mode="edit"
					bind:formElement={editFormElement}
					initialData={{
						name: mockOrganizationActive.name,
						description: mockOrganizationActive.description
					}}
					action="/admin/organizations/{mockOrganizationActive.id}?/update"
				/>
				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						class="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
					>
						Cancel
					</button>
					<button
						type="submit"
						onclick={() => editFormElement?.requestSubmit()}
						class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
					>
						Save Changes
					</button>
				</div>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Field Comparison</h2>
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="min-w-full divide-y divide-border">
					<thead class="bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Field</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
								>Create Mode</th
							>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
								>Edit Mode</th
							>
							<th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Required</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-border bg-card">
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Name</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">Yes</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Description</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm">No</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Owner Email</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm">Yes (create only)</td>
						</tr>
						<tr>
							<td class="px-4 py-3 text-sm font-medium">Owner Name</td>
							<td class="px-4 py-3 text-sm">✓</td>
							<td class="px-4 py-3 text-sm text-muted-foreground">Hidden</td>
							<td class="px-4 py-3 text-sm">Yes (create only)</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Features</h2>
			<ul class="list-disc space-y-2 pl-6 text-muted-foreground">
				<li>Two modes: create and edit (conditional field rendering)</li>
				<li>
					Progressive enhancement with <code class="rounded bg-muted px-1.5 py-0.5"
						>use:enhance</code
					>
				</li>
				<li>
					Bindable form element reference via <code class="rounded bg-muted px-1.5 py-0.5"
						>formElement</code
					>
				</li>
				<li>
					Loading state support with <code class="rounded bg-muted px-1.5 py-0.5">isSubmitting</code
					>
				</li>
				<li>Form validation (HTML5 required, minlength, maxlength)</li>
				<li>Internationalization support</li>
				<li>
					Pre-filled values support via <code class="rounded bg-muted px-1.5 py-0.5"
						>initialData</code
					>
					and <code class="rounded bg-muted px-1.5 py-0.5">form</code>
				</li>
			</ul>
		</section>

		<section>
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
			<div class="rounded-lg border border-border bg-muted/50 p-6">
				<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
						>&lt;script lang="ts"&gt;
  import OrganizationForm from '$lib/components/custom/OrganizationForm/OrganizationForm.svelte';

  let formElement: HTMLFormElement;

  // Create mode
  &lt;OrganizationForm
    mode="create"
    bind:formElement
    action="/admin/organizations?/create"
  /&gt;

  // Edit mode
  &lt;OrganizationForm
    mode="edit"
    bind:formElement
    initialData=&#123;&#123; name: 'Existing Org', description: 'Description' &#125;&#125;
    action="/admin/organizations/[id]?/update"
  /&gt;

  // Submit programmatically
  formElement?.requestSubmit();
&lt;/script&gt;</code
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
