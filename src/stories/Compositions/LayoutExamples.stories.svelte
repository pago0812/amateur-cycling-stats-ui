<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Compositions/Layout Examples',
		parameters: {
			layout: 'fullscreen'
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
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Tabs from '$lib/components/ui/tabs/tabs.svelte';
	import TabsList from '$lib/components/ui/tabs/tabs-list.svelte';
	import TabsTrigger from '$lib/components/ui/tabs/tabs-trigger.svelte';
	import TabsContent from '$lib/components/ui/tabs/tabs-content.svelte';
	import {
		Users,
		Calendar,
		Trophy,
		TrendingUp,
		ArrowUpRight,
		ArrowDownRight,
		MoreVertical
	} from '@lucide/svelte';
</script>
<Story name="Overview">
<div class="mx-auto max-w-7xl space-y-12 p-8">
	<div class="mb-12">
		<h1 class="mb-2 text-4xl font-bold text-foreground">Layout Compositions</h1>
		<p class="text-lg text-muted-foreground">
			Real-world layout patterns for building dashboards, profiles, and content pages.
		</p>
	</div>
<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Stats Dashboard</h2>
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-sm font-medium">Total Cyclists</CardTitle>
					<Users class="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">2,847</div>
					<p class="flex items-center text-xs text-muted-foreground">
						<ArrowUpRight class="mr-1 size-4 text-success" />
						<span class="text-success">+12.5%</span>
						<span class="ml-1">from last month</span>
					</p>
				</CardContent>
			</Card>
<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-sm font-medium">Active Events</CardTitle>
					<Calendar class="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">127</div>
					<p class="flex items-center text-xs text-muted-foreground">
						<ArrowUpRight class="mr-1 size-4 text-success" />
						<span class="text-success">+8.2%</span>
						<span class="ml-1">from last month</span>
					</p>
				</CardContent>
			</Card>
<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-sm font-medium">Results Published</CardTitle>
					<Trophy class="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">1,423</div>
					<p class="flex items-center text-xs text-muted-foreground">
						<ArrowDownRight class="mr-1 size-4 text-destructive" />
						<span class="text-destructive">-3.1%</span>
						<span class="ml-1">from last month</span>
					</p>
				</CardContent>
			</Card>
<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-sm font-medium">Growth Rate</CardTitle>
					<TrendingUp class="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">+24.6%</div>
					<p class="flex items-center text-xs text-muted-foreground">
						<ArrowUpRight class="mr-1 size-4 text-success" />
						<span class="text-success">+4.2%</span>
						<span class="ml-1">from last month</span>
					</p>
				</CardContent>
			</Card>
		</div>
	</section>
<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Tabbed Content</h2>
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<div>
						<CardTitle>Events</CardTitle>
						<CardDescription>Manage your cycling events</CardDescription>
					</div>
					<Button>
						<Calendar class="mr-2" />
						Create Event
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs value="upcoming">
					<TabsList class="grid w-full grid-cols-3">
						<TabsTrigger value="upcoming">Upcoming</TabsTrigger>
						<TabsTrigger value="ongoing">Ongoing</TabsTrigger>
						<TabsTrigger value="finished">Finished</TabsTrigger>
					</TabsList>
					<TabsContent value="upcoming" class="space-y-4 pt-6">
						{#each [
							{
								name: 'Gran Fondo Barcelona',
								date: 'March 15, 2025',
								location: 'Barcelona',
								participants: 245
							},
							{
								name: 'Vuelta Catalunya Amateur',
								date: 'March 22, 2025',
								location: 'Girona',
								participants: 189
							},
							{
								name: 'Costa Brava Challenge',
								date: 'April 5, 2025',
								location: 'Lloret de Mar',
								participants: 312
							}
						] as event}
							<div class="flex items-center justify-between rounded-lg border border-border p-4">
								<div class="space-y-1">
									<p class="font-semibold text-card-foreground">{event.name}</p>
									<p class="text-sm text-muted-foreground">
										{event.date} • {event.location}
									</p>
								</div>
								<div class="flex items-center gap-4">
									<div class="text-right">
										<p class="text-sm font-medium text-card-foreground">{event.participants}</p>
										<p class="text-xs text-muted-foreground">participants</p>
									</div>
									<Button variant="ghost" size="icon">
										<MoreVertical class="size-4" />
									</Button>
								</div>
							</div>
						{/each}
					</TabsContent>
					<TabsContent value="ongoing" class="pt-6">
						<p class="text-center text-muted-foreground">No ongoing events</p>
					</TabsContent>
					<TabsContent value="finished" class="pt-6">
						<p class="text-center text-muted-foreground">No finished events</p>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	</section>
<section>
		<h2 class="mb-6 text-2xl font-semibold text-foreground">Profile Layout</h2>
		<div class="grid gap-6 lg:grid-cols-3">
<div class="lg:col-span-2">
				<Card>
					<CardHeader>
						<div class="flex items-start justify-between">
							<div class="flex items-center gap-4">
								<div class="flex size-16 items-center justify-center rounded-full bg-primary">
									<Users class="size-8 text-primary-foreground" />
								</div>
								<div>
									<CardTitle>John Doe</CardTitle>
									<CardDescription>@johndoe • Pro Cyclist</CardDescription>
								</div>
							</div>
							<Button variant="outline">Edit Profile</Button>
						</div>
					</CardHeader>
					<CardContent class="space-y-4">
						<p class="text-sm text-muted-foreground">
							Professional cyclist with 10+ years of experience. Specialized in Gran Fondo and long
							distance events. Multiple podium finishes in regional and national competitions.
						</p>
						<Separator />
						<div class="grid grid-cols-3 gap-4 text-center">
							<div>
								<div class="text-2xl font-bold text-card-foreground">127</div>
								<p class="text-xs text-muted-foreground">Races</p>
							</div>
							<div>
								<div class="text-2xl font-bold text-card-foreground">34</div>
								<p class="text-xs text-muted-foreground">Wins</p>
							</div>
							<div>
								<div class="text-2xl font-bold text-card-foreground">82</div>
								<p class="text-xs text-muted-foreground">Podiums</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
<div class="space-y-6">
<Card>
					<CardHeader>
						<CardTitle class="text-base">Team</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="flex items-center gap-3">
							<div
								class="flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
							>
								CT
							</div>
							<div>
								<p class="font-semibold text-card-foreground">Cycling Team Pro</p>
								<p class="text-sm text-muted-foreground">Since 2020</p>
							</div>
						</div>
					</CardContent>
				</Card>
<Card>
					<CardHeader>
						<CardTitle class="text-base">Recent Achievements</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center gap-3">
							<Trophy class="size-8 text-yellow-500" />
							<div>
								<p class="text-sm font-medium text-card-foreground">1st Place</p>
								<p class="text-xs text-muted-foreground">Gran Fondo 2024</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<Trophy class="size-8 text-gray-400" />
							<div>
								<p class="text-sm font-medium text-card-foreground">2nd Place</p>
								<p class="text-xs text-muted-foreground">Vuelta Regional</p>
							</div>
						</div>
					</CardContent>
				</Card>
<Card>
					<CardHeader>
						<CardTitle class="text-base">Status</CardTitle>
					</CardHeader>
					<CardContent class="flex items-center justify-between">
						<p class="text-sm text-muted-foreground">Active</p>
						<Badge>Verified</Badge>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>
</div>
</Story>

