<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/Card',
		parameters: {
			layout: 'padded'
		}
	});
</script>

<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardFooter from '$lib/components/ui/card/card-footer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Bell, Settings, User } from '@lucide/svelte';
</script>

<Story name="Overview">
	<div class="mx-auto max-w-6xl p-8">
		<div class="mb-12">
			<h1 class="mb-2 text-4xl font-bold text-foreground">Card</h1>
			<p class="text-lg text-muted-foreground">
				A flexible container component for displaying content with consistent styling.
			</p>
		</div>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Basic Card</h2>
			<Card class="max-w-md">
				<CardHeader>
					<CardTitle>Card Title</CardTitle>
					<CardDescription>Card description goes here</CardDescription>
				</CardHeader>
				<CardContent>
					<p class="text-sm text-card-foreground">
						This is the card content area. You can put any content here including text, images,
						forms, and more.
					</p>
				</CardContent>
			</Card>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">With Footer</h2>
			<Card class="max-w-md">
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
					<CardDescription>You have 3 unread messages</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="flex items-center gap-4">
						<Bell class="size-8 text-muted-foreground" />
						<div class="flex-1">
							<p class="font-semibold text-card-foreground">New notification</p>
							<p class="text-sm text-muted-foreground">You have a new message waiting</p>
						</div>
					</div>
				</CardContent>
				<CardFooter class="flex justify-between">
					<Button variant="outline">Dismiss</Button>
					<Button>View all</Button>
				</CardFooter>
			</Card>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">With Form</h2>
			<Card class="max-w-md">
				<CardHeader>
					<CardTitle>Create Account</CardTitle>
					<CardDescription>Enter your information to create an account</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Name</Label>
						<Input id="name" placeholder="John Doe" />
					</div>
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input id="email" type="email" placeholder="john@example.com" />
					</div>
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input id="password" type="password" />
					</div>
				</CardContent>
				<CardFooter>
					<Button class="w-full">Create account</Button>
				</CardFooter>
			</Card>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Multiple Cards</h2>
			<div class="grid gap-6 md:grid-cols-3">
				<Card>
					<CardHeader>
						<div class="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary">
							<User class="size-6 text-primary-foreground" />
						</div>
						<CardTitle>Profile</CardTitle>
						<CardDescription>Manage your profile</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Update your personal information and preferences.
						</p>
					</CardContent>
					<CardFooter>
						<Button variant="outline" class="w-full">Edit Profile</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<div class="mb-2 flex size-12 items-center justify-center rounded-lg bg-secondary">
							<Settings class="size-6 text-secondary-foreground" />
						</div>
						<CardTitle>Settings</CardTitle>
						<CardDescription>Configure your app</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Adjust application settings and preferences.
						</p>
					</CardContent>
					<CardFooter>
						<Button variant="outline" class="w-full">Open Settings</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<div class="mb-2 flex size-12 items-center justify-center rounded-lg bg-accent">
							<Bell class="size-6 text-accent-foreground" />
						</div>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>Manage alerts</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">Control how you receive notifications.</p>
					</CardContent>
					<CardFooter>
						<Button variant="outline" class="w-full">Manage</Button>
					</CardFooter>
				</Card>
			</div>
		</section>
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-semibold text-foreground">With Badge and Separator</h2>
			<Card class="max-w-md">
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle>Event Details</CardTitle>
						<Badge>Active</Badge>
					</div>
					<CardDescription>Gran Fondo Catalunya 2025</CardDescription>
				</CardHeader>
				<Separator />
				<CardContent class="pt-6">
					<dl class="space-y-2 text-sm">
						<div class="flex justify-between">
							<dt class="text-muted-foreground">Date</dt>
							<dd class="font-medium text-card-foreground">March 15, 2025</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-muted-foreground">Location</dt>
							<dd class="font-medium text-card-foreground">Barcelona, Spain</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-muted-foreground">Distance</dt>
							<dd class="font-medium text-card-foreground">120 km</dd>
						</div>
					</dl>
				</CardContent>
				<Separator />
				<CardFooter class="pt-6">
					<Button class="w-full">View Details</Button>
				</CardFooter>
			</Card>
		</section>
		<section>
			<h2 class="mb-6 text-2xl font-semibold text-foreground">Usage</h2>
			<div class="rounded-lg border border-border bg-muted/50 p-6">
				<pre class="overflow-x-auto rounded bg-card p-4 text-sm text-card-foreground"><code
						>&lt;script lang="ts"&gt;
  import &#123; Card, CardHeader, CardTitle, CardDescription,
           CardContent, CardFooter &#125; from '$lib/components/ui/card';
  import &#123; Button &#125; from '$lib/components/ui/button';
&lt;/script&gt;

&lt;Card&gt;
  &lt;CardHeader&gt;
    &lt;CardTitle&gt;Title&lt;/CardTitle&gt;
    &lt;CardDescription&gt;Description&lt;/CardDescription&gt;
  &lt;/CardHeader&gt;
  &lt;CardContent&gt;
    &lt;p&gt;Card content goes here&lt;/p&gt;
  &lt;/CardContent&gt;
  &lt;CardFooter&gt;
    &lt;Button&gt;Action&lt;/Button&gt;
  &lt;/CardFooter&gt;
&lt;/Card&gt;</code
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
