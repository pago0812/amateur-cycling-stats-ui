<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Compositions/Form Examples',
		parameters: {
			layout: 'centered'
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
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Alert from '$lib/components/ui/alert/alert.svelte';
	import AlertDescription from '$lib/components/ui/alert/alert-description.svelte';
	import { Mail, Lock, User, Building, AlertCircle } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let signupEmail = $state('');
	let signupPassword = $state('');
	let confirmPassword = $state('');
	let agreeToTerms = $state(false);
	let showSuccess = $state(false);
</script>
<Story name="Overview">
<div class="mx-auto w-full max-w-6xl space-y-12 p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Form Compositions</h1>
		<p class="text-lg text-muted-foreground">
			Real-world form examples using shadcn-svelte components with proper validation and UX
			patterns.
		</p>
	</div>
<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Login Form</h2>
		<Card class="mx-auto max-w-md">
			<CardHeader>
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>Enter your credentials to access your account</CardDescription>
			</CardHeader>
			<CardContent>
				<form class="space-y-4">
					<div class="space-y-2">
						<Label for="login-email">Email</Label>
						<div class="relative">
							<Mail
								class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								id="login-email"
								type="email"
								placeholder="name@example.com"
								class="pl-10"
								bind:value={email}
								required
							/>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<Label for="login-password">Password</Label>
							<a href="#forgot" class="text-sm text-primary hover:underline">Forgot password?</a>
						</div>
						<div class="relative">
							<Lock
								class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								id="login-password"
								type="password"
								placeholder="Enter your password"
								class="pl-10"
								bind:value={password}
								required
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2">
						<Checkbox id="remember" bind:checked={rememberMe} />
						<Label
							for="remember"
							class="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Remember me
						</Label>
					</div>
				</form>
			</CardContent>
			<CardFooter class="flex flex-col space-y-4">
				<Button class="w-full">Sign in</Button>
				<div class="text-center text-sm text-muted-foreground">
					Don't have an account?
					<a href="#signup" class="text-primary hover:underline">Sign up</a>
				</div>
			</CardFooter>
		</Card>
	</section>
<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Signup Form</h2>
		<Card class="mx-auto max-w-md">
			<CardHeader>
				<CardTitle>Create an account</CardTitle>
				<CardDescription>Enter your information to get started</CardDescription>
			</CardHeader>
			<CardContent>
				<form class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="first-name">First name</Label>
							<Input id="first-name" placeholder="John" required />
						</div>
						<div class="space-y-2">
							<Label for="last-name">Last name</Label>
							<Input id="last-name" placeholder="Doe" required />
						</div>
					</div>
					<div class="space-y-2">
						<Label for="signup-email">Email</Label>
						<Input
							id="signup-email"
							type="email"
							placeholder="name@example.com"
							bind:value={signupEmail}
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="signup-password">Password</Label>
						<Input
							id="signup-password"
							type="password"
							placeholder="Create a password"
							bind:value={signupPassword}
							required
						/>
						<p class="text-xs text-muted-foreground">Must be at least 8 characters</p>
					</div>
					<div class="space-y-2">
						<Label for="confirm-password">Confirm password</Label>
						<Input
							id="confirm-password"
							type="password"
							placeholder="Confirm your password"
							bind:value={confirmPassword}
							required
						/>
					</div>
					{#if confirmPassword && signupPassword !== confirmPassword}
						<Alert variant="destructive">
							<AlertCircle class="size-4" />
							<AlertDescription>Passwords do not match</AlertDescription>
						</Alert>
					{/if}
					<div class="flex items-start space-x-2">
						<Checkbox id="terms" bind:checked={agreeToTerms} class="mt-1" />
						<Label
							for="terms"
							class="cursor-pointer text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							I agree to the <a href="#terms" class="text-primary hover:underline">terms of service</a>
							and <a href="#privacy" class="text-primary hover:underline">privacy policy</a>
						</Label>
					</div>
				</form>
			</CardContent>
			<CardFooter class="flex flex-col space-y-4">
				<Button class="w-full" disabled={!agreeToTerms}>Create account</Button>
				<div class="text-center text-sm text-muted-foreground">
					Already have an account?
					<a href="#login" class="text-primary hover:underline">Sign in</a>
				</div>
			</CardFooter>
		</Card>
	</section>
<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Contact Form</h2>
		<Card class="mx-auto max-w-2xl">
			<CardHeader>
				<CardTitle>Contact us</CardTitle>
				<CardDescription>Send us a message and we'll get back to you</CardDescription>
			</CardHeader>
			<CardContent>
				<form class="space-y-4">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="contact-name">Name</Label>
							<Input id="contact-name" placeholder="Your name" required />
						</div>
						<div class="space-y-2">
							<Label for="contact-email">Email</Label>
							<Input id="contact-email" type="email" placeholder="your@email.com" required />
						</div>
					</div>
					<div class="space-y-2">
						<Label for="subject">Subject</Label>
						<Input id="subject" placeholder="What is this about?" required />
					</div>
					<div class="space-y-2">
						<Label for="message">Message</Label>
						<Textarea id="message" placeholder="Your message here..." rows={5} required />
						<p class="text-xs text-muted-foreground">Please be as detailed as possible</p>
					</div>
				</form>
			</CardContent>
			<CardFooter class="flex justify-between">
				<Button variant="outline">Cancel</Button>
				<Button onclick={() => (showSuccess = true)}>Send message</Button>
			</CardFooter>
		</Card>

		{#if showSuccess}
			<Alert class="mx-auto mt-4 max-w-2xl">
				<AlertDescription>
					Thank you for your message! We'll get back to you within 24 hours.
				</AlertDescription>
			</Alert>
		{/if}
	</section>
<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Organization Form</h2>
		<Card class="mx-auto max-w-2xl">
			<CardHeader>
				<CardTitle>Create organization</CardTitle>
				<CardDescription>Set up a new cycling organization</CardDescription>
			</CardHeader>
			<CardContent>
				<form class="space-y-6">
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="org-name">Organization name</Label>
							<div class="relative">
								<Building
									class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="org-name"
									placeholder="Pro Cycling League"
									class="pl-10"
									required
								/>
							</div>
						</div>
						<div class="space-y-2">
							<Label for="org-description">Description</Label>
							<Textarea
								id="org-description"
								placeholder="Describe your organization..."
								rows={3}
							/>
						</div>
					</div>

					<Separator />

					<div class="space-y-4">
						<h3 class="font-semibold text-foreground">Owner information</h3>
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="owner-first">First name</Label>
								<Input id="owner-first" placeholder="John" required />
							</div>
							<div class="space-y-2">
								<Label for="owner-last">Last name</Label>
								<Input id="owner-last" placeholder="Doe" required />
							</div>
						</div>
						<div class="space-y-2">
							<Label for="owner-email">Email</Label>
							<div class="relative">
								<Mail
									class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="owner-email"
									type="email"
									placeholder="owner@organization.com"
									class="pl-10"
									required
								/>
							</div>
							<p class="text-xs text-muted-foreground">
								An invitation email will be sent to this address
							</p>
						</div>
					</div>
				</form>
			</CardContent>
			<CardFooter class="flex justify-between">
				<Button variant="outline">Cancel</Button>
				<Button>Create organization</Button>
			</CardFooter>
		</Card>
	</section>
</div>
</Story>

<style>
	code {
		font-family: 'Monaco', 'Courier New', monospace;
	}
</style>
