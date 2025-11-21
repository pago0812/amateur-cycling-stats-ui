# Amateur Cycling Stats - Design System

Complete design system documentation for building consistent, accessible, and beautiful user interfaces.

**Version:** 1.0.0
**Last Updated:** November 2025
**Framework:** SvelteKit + Svelte 5
**Component Library:** shadcn-svelte
**Styling:** Tailwind CSS 4

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Design Tokens](#design-tokens)
4. [Component Library](#component-library)
5. [Composition Patterns](#composition-patterns)
6. [Best Practices](#best-practices)
7. [Svelte 5 Guidelines](#svelte-5-guidelines)
8. [Storybook](#storybook)
9. [Contributing](#contributing)

---

## Overview

### Philosophy

Our design system is built on these core principles:

- **Consistency** - Unified visual language across the entire application
- **Accessibility** - WCAG 2.1 AA compliant components with proper ARIA attributes
- **Performance** - Optimized components with minimal bundle size
- **Developer Experience** - Intuitive APIs with full TypeScript support
- **Flexibility** - Composable primitives that adapt to various use cases

### Tech Stack

- **Svelte 5** - Latest version with runes syntax (`$props`, `$state`, `$derived`, `$effect`)
- **shadcn-svelte** - High-quality, accessible component primitives
- **Tailwind CSS 4** - Utility-first CSS with OKLCH color space
- **TypeScript** - Strict mode enabled for type safety
- **Storybook** - Component documentation and visual testing

### Component Count

- **21 shadcn-svelte components** installed and configured
- **3 design token stories** (Colors, Typography, Spacing)
- **Multiple composition examples** (Forms, Layouts)

---

## Getting Started

### Prerequisites

```bash
Node.js 18+
npm 9+
```

### Installation

All shadcn-svelte components are already installed. To use them in your code:

```typescript
// Import individual components
import { Button } from '$lib/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
```

### Adding New Components

If you need to add a new shadcn-svelte component:

```bash
npx shadcn-svelte@latest add [component-name]
```

Example:

```bash
npx shadcn-svelte@latest add accordion
```

### Running Storybook

View all components and examples in Storybook:

```bash
npm run storybook
```

Access at: `http://localhost:6006`

---

## Design Tokens

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

### Colors

Our color system uses CSS custom properties with **OKLCH color space** for better consistency across light and dark modes.

#### Semantic Colors

```css
/* Background colors */
--background          /* Page background */
--foreground          /* Primary text color */
--card                /* Card backgrounds */
--card-foreground     /* Card text */
--popover             /* Popover backgrounds */
--popover-foreground  /* Popover text */

/* Brand colors */
--primary             /* Primary actions (blue) */
--primary-foreground  /* Text on primary */
--secondary           /* Secondary actions (gray) */
--secondary-foreground /* Text on secondary */

/* UI colors */
--muted               /* Muted backgrounds */
--muted-foreground    /* Muted text */
--accent              /* Accent highlights */
--accent-foreground   /* Text on accent */
--border              /* Border color */
--input               /* Input borders */
--ring                /* Focus rings */

/* State colors */
--destructive         /* Errors, delete actions (red) */
--destructive-foreground /* Text on destructive */
--success             /* Success states (green) */
--success-foreground  /* Text on success */
--warning             /* Warning states (yellow) */
--warning-foreground  /* Text on warning */
--info                /* Info states (blue) */
--info-foreground     /* Text on info */

/* Chart colors */
--chart-1 through --chart-5  /* Data visualization colors */
```

#### Usage

```typescript
// In Tailwind classes
<div class="bg-primary text-primary-foreground">Primary button</div>
<p class="text-muted-foreground">Helper text</p>
<div class="border-border">Bordered element</div>

// In custom CSS
.custom-element {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### Typography

Font scale based on Tailwind's default scale with consistent line heights.

#### Scale

| Class       | Size | Line Height | Usage                   |
| ----------- | ---- | ----------- | ----------------------- |
| `text-xs`   | 12px | 16px        | Small labels, captions  |
| `text-sm`   | 14px | 20px        | Body text, descriptions |
| `text-base` | 16px | 24px        | Default body text       |
| `text-lg`   | 18px | 28px        | Emphasized text         |
| `text-xl`   | 20px | 28px        | Small headings          |
| `text-2xl`  | 24px | 32px        | Section headings        |
| `text-3xl`  | 30px | 36px        | Page titles             |
| `text-4xl`  | 36px | 40px        | Hero headings           |

#### Weights

- `font-normal` (400) - Body text
- `font-medium` (500) - Emphasized text
- `font-semibold` (600) - Headings
- `font-bold` (700) - Strong emphasis

#### Usage

```svelte
<h1 class="text-4xl font-bold">Page Title</h1>
<h2 class="text-2xl font-semibold">Section Title</h2>
<p class="text-base">Regular body text</p>
<p class="text-sm text-muted-foreground">Helper text</p>
```

### Spacing

Consistent spacing based on 4px unit scale.

#### Scale

| Value | Pixels | Usage                  |
| ----- | ------ | ---------------------- |
| 0     | 0px    | No spacing             |
| 1     | 4px    | Minimal spacing        |
| 2     | 8px    | Tight spacing          |
| 3     | 12px   | Default label-to-input |
| 4     | 16px   | Default between fields |
| 6     | 24px   | Between sections       |
| 8     | 32px   | Large spacing          |
| 12    | 48px   | Section padding        |

#### Common Patterns

```typescript
// Card padding
class="p-4"     // Compact: 16px
class="p-6"     // Default: 24px
class="p-8"     // Spacious: 32px

// Form field spacing
class="gap-4"   // Between fields: 16px
class="mb-2"    // Label to input: 8px

// Section spacing
class="mb-8"    // Between sections: 32px
class="mb-12"   // Large sections: 48px

// Page padding
class="py-8"    // Vertical: 32px
class="py-12"   // Vertical: 48px
```

### Border Radius

Smooth, consistent corner radii.

```css
--radius-sm: calc(var(--radius) - 4px) /* ~6px */ --radius-md: calc(var(--radius) - 2px) /* ~8px */
	--radius-lg: var(--radius) /* 10px */ --radius-xl: calc(var(--radius) + 4px) /* ~14px */
	--radius: 0.65rem /* 10px base */;
```

Usage:

```typescript
class="rounded-md"  // Medium radius
class="rounded-lg"  // Large radius (default)
class="rounded-xl"  // Extra large radius
```

---

## Component Library

### Form Components

#### Button

Primary action component with multiple variants and sizes.

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`

```svelte
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Download } from '@lucide/svelte';
</script>

<!-- Basic usage -->
<Button>Click me</Button>

<!-- With variants -->
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>

<!-- With icons -->
<Button>
	<Download />
	Download
</Button>

<!-- As link -->
<Button href="/login">Login</Button>

<!-- Icon only -->
<Button size="icon">
	<Download />
</Button>
```

#### Input

Text input component with support for various types.

**Types:** `text`, `email`, `password`, `number`, `tel`, `url`, `search`

```svelte
<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Search } from '@lucide/svelte';

	let email = $state('');
</script>

<!-- Basic usage -->
<Label for="email">Email</Label>
<Input id="email" type="email" placeholder="name@example.com" bind:value={email} />

<!-- With icon -->
<div class="relative">
	<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2" />
	<Input type="search" placeholder="Search..." class="pl-10" />
</div>

<!-- States -->
<Input disabled placeholder="Disabled" />
<Input readonly value="Read only" />
```

#### Label

Form label component with proper accessibility.

```svelte
<Label for="username">Username</Label>
<Input id="username" />
```

#### Textarea

Multi-line text input.

```svelte
<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
</script>

<Label for="message">Message</Label>
<Textarea id="message" placeholder="Your message here..." rows={5} />
```

#### Select

Dropdown selection component.

```svelte
<script lang="ts">
	import {
		Select,
		SelectTrigger,
		SelectValue,
		SelectContent,
		SelectItem
	} from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
</script>

<Label>Category</Label>
<Select>
	<SelectTrigger>
		<SelectValue placeholder="Select option" />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value="option1">Option 1</SelectItem>
		<SelectItem value="option2">Option 2</SelectItem>
		<SelectItem value="option3">Option 3</SelectItem>
	</SelectContent>
</Select>
```

#### Checkbox

Boolean selection component.

```svelte
<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';

	let checked = $state(false);
</script>

<div class="flex items-center space-x-2">
	<Checkbox id="terms" bind:checked />
	<Label for="terms">Accept terms and conditions</Label>
</div>
```

#### Radio Group

Single selection from multiple options.

```svelte
<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
</script>

<RadioGroup value="option1">
	<div class="flex items-center space-x-2">
		<RadioGroupItem value="option1" id="opt1" />
		<Label for="opt1">Option 1</Label>
	</div>
	<div class="flex items-center space-x-2">
		<RadioGroupItem value="option2" id="opt2" />
		<Label for="opt2">Option 2</Label>
	</div>
</RadioGroup>
```

#### Switch

Toggle control.

```svelte
<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';

	let enabled = $state(false);
</script>

<div class="flex items-center space-x-2">
	<Switch id="airplane" bind:checked={enabled} />
	<Label for="airplane">Airplane mode</Label>
</div>
```

### Layout Components

#### Card

Flexible container component.

**Sub-components:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

```svelte
<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
</script>

<Card>
	<CardHeader>
		<CardTitle>Card Title</CardTitle>
		<CardDescription>Card description</CardDescription>
	</CardHeader>
	<CardContent>
		<p>Card content goes here</p>
	</CardContent>
	<CardFooter>
		<Button>Action</Button>
	</CardFooter>
</Card>
```

#### Dialog

Modal overlay component.

```svelte
<script lang="ts">
	import {
		Dialog,
		DialogTrigger,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
</script>

<Dialog>
	<DialogTrigger asChild let:builder>
		<Button builders={[builder]}>Open Dialog</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Dialog Title</DialogTitle>
			<DialogDescription>Dialog description</DialogDescription>
		</DialogHeader>
		<p>Dialog content</p>
		<DialogFooter>
			<Button>Confirm</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

#### Alert Dialog

Confirmation dialog for important actions.

```svelte
<script lang="ts">
	import {
		AlertDialog,
		AlertDialogTrigger,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogCancel,
		AlertDialogAction
	} from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
</script>

<AlertDialog>
	<AlertDialogTrigger asChild let:builder>
		<Button variant="destructive" builders={[builder]}>Delete</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you sure?</AlertDialogTitle>
			<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction>Delete</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
```

#### Badge

Status indicator component.

**Variants:** `default`, `secondary`, `outline`, `destructive`

```svelte
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
</script>

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

#### Separator

Visual divider.

```svelte
<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
</script>

<div class="space-y-4">
	<p>Content above</p>
	<Separator />
	<p>Content below</p>
</div>

<!-- Vertical -->
<div class="flex items-center gap-4">
	<p>Left</p>
	<Separator orientation="vertical" class="h-6" />
	<p>Right</p>
</div>
```

#### Sheet

Slide-out panel component.

```svelte
<script lang="ts">
	import {
		Sheet,
		SheetTrigger,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription
	} from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
</script>

<Sheet>
	<SheetTrigger asChild let:builder>
		<Button builders={[builder]}>Open Sheet</Button>
	</SheetTrigger>
	<SheetContent>
		<SheetHeader>
			<SheetTitle>Sheet Title</SheetTitle>
			<SheetDescription>Sheet description</SheetDescription>
		</SheetHeader>
		<div class="py-4">Sheet content</div>
	</SheetContent>
</Sheet>
```

### Navigation Components

#### Breadcrumb

Navigation breadcrumb trail.

```svelte
<script lang="ts">
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbSeparator,
		BreadcrumbPage
	} from '$lib/components/ui/breadcrumb';
</script>

<Breadcrumb>
	<BreadcrumbList>
		<BreadcrumbItem>
			<BreadcrumbLink href="/">Home</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbLink href="/events">Events</BreadcrumbLink>
		</BreadcrumbItem>
		<BreadcrumbSeparator />
		<BreadcrumbItem>
			<BreadcrumbPage>Event Details</BreadcrumbPage>
		</BreadcrumbItem>
	</BreadcrumbList>
</Breadcrumb>
```

#### Tabs

Tabbed interface component.

```svelte
<script lang="ts">
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
</script>

<Tabs value="tab1">
	<TabsList>
		<TabsTrigger value="tab1">Tab 1</TabsTrigger>
		<TabsTrigger value="tab2">Tab 2</TabsTrigger>
		<TabsTrigger value="tab3">Tab 3</TabsTrigger>
	</TabsList>
	<TabsContent value="tab1">Content 1</TabsContent>
	<TabsContent value="tab2">Content 2</TabsContent>
	<TabsContent value="tab3">Content 3</TabsContent>
</Tabs>
```

#### Dropdown Menu

Contextual menu component.

```svelte
<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator
	} from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
</script>

<DropdownMenu>
	<DropdownMenuTrigger asChild let:builder>
		<Button variant="outline" builders={[builder]}>Menu</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuItem>Profile</DropdownMenuItem>
		<DropdownMenuItem>Settings</DropdownMenuItem>
		<DropdownMenuSeparator />
		<DropdownMenuItem>Logout</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
```

#### Tooltip

Hover information component.

```svelte
<script lang="ts">
	import { Tooltip, TooltipTrigger, TooltipContent } from '$lib/components/ui/tooltip';
	import { Button } from '$lib/components/ui/button';
</script>

<Tooltip>
	<TooltipTrigger asChild let:builder>
		<Button variant="outline" builders={[builder]}>Hover me</Button>
	</TooltipTrigger>
	<TooltipContent>
		<p>Tooltip content</p>
	</TooltipContent>
</Tooltip>
```

#### Popover

Floating content component.

```svelte
<script lang="ts">
	import { Popover, PopoverTrigger, PopoverContent } from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
</script>

<Popover>
	<PopoverTrigger asChild let:builder>
		<Button builders={[builder]}>Open Popover</Button>
	</PopoverTrigger>
	<PopoverContent>
		<p>Popover content goes here</p>
	</PopoverContent>
</Popover>
```

### Feedback Components

#### Alert

Inline notification component.

**Variants:** `default`, `destructive`

```svelte
<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { AlertCircle } from '@lucide/svelte';
</script>

<Alert>
	<AlertCircle class="size-4" />
	<AlertTitle>Heads up!</AlertTitle>
	<AlertDescription>This is an informational alert message.</AlertDescription>
</Alert>

<Alert variant="destructive">
	<AlertCircle class="size-4" />
	<AlertTitle>Error</AlertTitle>
	<AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

### Data Components

#### Table

Structured data table.

```svelte
<script lang="ts">
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell
	} from '$lib/components/ui/table';
</script>

<Table>
	<TableHeader>
		<TableRow>
			<TableHead>Name</TableHead>
			<TableHead>Email</TableHead>
			<TableHead>Role</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell>John Doe</TableCell>
			<TableCell>john@example.com</TableCell>
			<TableCell>Admin</TableCell>
		</TableRow>
	</TableBody>
</Table>
```

---

## Composition Patterns

### Login Form

```svelte
<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let email = $state('');
	let password = $state('');
	let remember = $state(false);
</script>

<Card class="max-w-md">
	<CardHeader>
		<CardTitle>Welcome back</CardTitle>
		<CardDescription>Sign in to your account</CardDescription>
	</CardHeader>
	<CardContent>
		<form class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" bind:value={email} />
			</div>
			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input id="password" type="password" bind:value={password} />
			</div>
			<div class="flex items-center space-x-2">
				<Checkbox id="remember" bind:checked={remember} />
				<Label for="remember">Remember me</Label>
			</div>
		</form>
	</CardContent>
	<CardFooter>
		<Button class="w-full">Sign in</Button>
	</CardFooter>
</Card>
```

### Stats Dashboard

```svelte
<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { TrendingUp, Users, Calendar } from '@lucide/svelte';
</script>

<div class="grid gap-4 md:grid-cols-3">
	<Card>
		<CardHeader class="flex flex-row items-center justify-between pb-2">
			<CardTitle class="text-sm font-medium">Total Users</CardTitle>
			<Users class="size-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">2,847</div>
			<p class="text-xs text-muted-foreground">+12.5% from last month</p>
		</CardContent>
	</Card>

	<!-- Repeat for other stats... -->
</div>
```

### Data Table with Actions

```svelte
<script lang="ts">
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell
	} from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { MoreVertical, Edit, Trash2 } from '@lucide/svelte';
</script>

<Table>
	<TableHeader>
		<TableRow>
			<TableHead>Name</TableHead>
			<TableHead>Status</TableHead>
			<TableHead>Role</TableHead>
			<TableHead class="text-right">Actions</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell>John Doe</TableCell>
			<TableCell><Badge>Active</Badge></TableCell>
			<TableCell>Admin</TableCell>
			<TableCell class="text-right">
				<Button variant="ghost" size="icon">
					<MoreVertical class="size-4" />
				</Button>
			</TableCell>
		</TableRow>
	</TableBody>
</Table>
```

---

## Best Practices

### Accessibility

1. **Always use Label with Input**

```svelte
<Label for="email">Email</Label>
<Input id="email" type="email" />
```

2. **Provide aria-label for icon-only buttons**

```svelte
<Button size="icon" aria-label="Delete item">
	<Trash2 />
</Button>
```

3. **Use semantic HTML**

```svelte
<!-- Good -->
<Button onclick={handleClick}>Submit</Button>

<!-- Bad -->
<div onclick={handleClick} class="button-like">Submit</div>
```

### Performance

1. **Lazy load heavy components**

```typescript
const Dialog = await import('$lib/components/ui/dialog');
```

2. **Use Svelte stores for shared state**

```typescript
// stores.ts
export const userStore = writable<User | null>(null);
```

3. **Avoid unnecessary reactivity**

```svelte
// Good - only reactive when needed let count = $state(0); // Bad - reactive when not needed let
staticValue = 'hello';
```

### Code Organization

1. **Group imports logically**

```typescript
// UI components
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';

// Icons
import { Download, Edit } from '@lucide/svelte';

// Utils
import { cn } from '$lib/utils';
```

2. **Extract reusable compositions**

```svelte
<!-- components/FormField.svelte -->
<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';

	let { id, label, type = 'text', ...rest } = $props();
</script>

<div class="space-y-2">
	<Label for={id}>{label}</Label>
	<Input {id} {type} {...rest} />
</div>
```

3. **Keep component files focused**

- One component per file
- Co-locate types with components
- Extract complex logic to utilities

---

## Svelte 5 Guidelines

### CRITICAL RULES

All components MUST use Svelte 5 syntax:

✅ **DO:**

```svelte
<script lang="ts">
	// Props
	let { variant = 'default', size = 'md' } = $props();

	// State
	let count = $state(0);

	// Derived values
	let doubled = $derived(count * 2);

	// Effects
	$effect(() => {
		console.log('Count changed:', count);
	});
</script>

{@render children?.()}
```

❌ **DON'T:**

```svelte
<script lang="ts">
	// WRONG - Svelte 4 syntax
	export let variant = 'default';
	export let size = 'md';

	// WRONG - Use $state instead
	let count = 0;

	// WRONG - Use $derived instead
	$: doubled = count * 2;

	// WRONG - Use $effect instead
	$: {
		console.log('Count changed:', count);
	}
</script>

<!-- WRONG - Use {@render children()} -->
<slot />
```

### Component Props Pattern

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		variant?: 'default' | 'destructive';
		children?: Snippet;
	}

	let { title, description, variant = 'default', children }: Props = $props();
</script>

<div>
	<h2>{title}</h2>
	{#if description}
		<p>{description}</p>
	{/if}
	{@render children?.()}
</div>
```

### Event Handling

```svelte
<script lang="ts">
	let { onclick }: { onclick?: () => void } = $props();
</script>

<button {onclick}> Click me </button>
```

---

## Storybook

### Viewing Components

Run Storybook to view all components:

```bash
npm run storybook
```

### Story Organization

```
src/stories/
├── Introduction.mdx           # Welcome page
├── DesignTokens/
│   ├── Colors.stories.svelte
│   ├── Typography.stories.svelte
│   └── Spacing.stories.svelte
├── Components/
│   ├── Button.stories.svelte
│   ├── Input.stories.svelte
│   ├── Card.stories.svelte
│   └── ...
└── Compositions/
    ├── FormExamples.stories.svelte
    └── LayoutExamples.stories.svelte
```

### Dark Mode

Toggle dark mode using the theme switcher in the Storybook toolbar (moon icon).

### Creating New Stories

```svelte
<!-- src/stories/Components/MyComponent.stories.svelte -->
<script context="module" lang="ts">
	import type { Meta } from '@storybook/svelte';
	import MyComponent from '$lib/components/MyComponent.svelte';

	export const meta: Meta<typeof MyComponent> = {
		title: 'Components/MyComponent',
		component: MyComponent,
		tags: ['autodocs']
	};
</script>

<script lang="ts">
	import MyComponent from '$lib/components/MyComponent.svelte';
</script>

<MyComponent />
```

---

## Contributing

### Adding New Components

1. Install component via shadcn-svelte:

```bash
npx shadcn-svelte@latest add [component-name]
```

2. Create Storybook story in `src/stories/Components/`

3. Document usage in this file

4. Test in both light and dark modes

### Guidelines

- ✅ Follow Svelte 5 syntax strictly
- ✅ Use TypeScript with strict mode
- ✅ Maintain accessibility standards
- ✅ Document all components in Storybook
- ✅ Test dark mode compatibility
- ✅ Keep consistency with existing patterns

---

## Resources

- [shadcn-svelte Documentation](https://shadcn-svelte.com)
- [Svelte 5 Documentation](https://svelte.dev)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Questions or Issues?**

- Check Storybook for component examples
- Review CLAUDE.md for project-specific patterns
- Consult shadcn-svelte documentation for component APIs
