<script lang="ts">
	import { Urls } from '$lib/constants/urls';
	import type { User } from '$lib/types/domain';
	import { RoleTypeEnum } from '$lib/types/domain';
	import { t } from '$lib/i18n';
	import Button from '$lib/components/Button.svelte';

	let { user = null }: { user?: User | null } = $props();
	let mobileMenuOpen = $state(false);
	let logoutForm: HTMLFormElement;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleLogout() {
		logoutForm.requestSubmit();
	}

	// Get the appropriate portal URL based on user role
	const portalUrl = $derived(
		!user
			? Urls.LOGIN
			: user.roleType === RoleTypeEnum.ADMIN
				? Urls.ADMIN
				: user.roleType === RoleTypeEnum.ORGANIZER_OWNER ||
					  user.roleType === RoleTypeEnum.ORGANIZER_STAFF
					? Urls.PANEL
					: Urls.ACCOUNT
	);
</script>

<!-- Hidden logout form -->
<form method="POST" action="/?/logout" bind:this={logoutForm} class="hidden"></form>

<nav class="bg-blue-600 text-white">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<a href={Urls.HOME} class="text-2xl font-bold">ACS</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden sm:flex sm:gap-4">
				<Button href={Urls.HOME} variant="filled" color="primary" size="md">
					{$t('common.navigation.home')}
				</Button>
				<Button href={Urls.RESULTS} variant="filled" color="primary" size="md">
					{$t('common.navigation.results')}
				</Button>

				{#if user}
					<Button href={portalUrl} variant="filled" color="primary" size="md">
						{$t('common.navigation.account')}
					</Button>
					<Button variant="filled" color="primary" size="md" onclick={handleLogout}>
						{$t('common.navigation.logout')}
					</Button>
				{:else}
					<Button href={Urls.LOGIN} variant="filled" color="primary" size="md">
						{$t('common.navigation.login')}
					</Button>
				{/if}
			</div>

			<!-- Mobile menu button -->
			<div class="sm:hidden">
				<Button
					variant="text"
					color="primary"
					size="sm"
					onclick={toggleMobileMenu}
					ariaLabel={$t('common.navigation.openMenu')}
					ariaExpanded={mobileMenuOpen}
				>
					<!-- Hamburger icon -->
					<svg
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</Button>
			</div>
		</div>
	</div>

	<!-- Mobile menu drawer -->
	{#if mobileMenuOpen}
		<!-- Backdrop -->
		<div
			class="bg-opacity-50 fixed inset-0 z-40 bg-black"
			onclick={closeMobileMenu}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
		></div>

		<!-- Drawer -->
		<div class="fixed top-0 right-0 z-50 h-full w-64 bg-blue-600 shadow-lg">
			<nav class="flex flex-col gap-4 p-10 text-right">
				<a href={Urls.HOME} class="text-white hover:text-blue-200" onclick={closeMobileMenu}>
					{$t('common.navigation.home')}
				</a>
				<a href={Urls.RESULTS} class="text-white hover:text-blue-200" onclick={closeMobileMenu}>
					{$t('common.navigation.results')}
				</a>
				<a href={Urls.TEAMS} class="text-white hover:text-blue-200" onclick={closeMobileMenu}>
					{$t('common.navigation.teams')}
				</a>

				{#if user}
					<a
						href={portalUrl}
						class="font-bold text-white hover:text-blue-200"
						onclick={closeMobileMenu}
					>
						{$t('common.navigation.account')}
					</a>
					<button
						class="text-white hover:text-blue-200"
						onclick={() => {
							handleLogout();
							closeMobileMenu();
						}}
					>
						{$t('common.navigation.logout')}
					</button>
				{:else}
					<a
						href={Urls.LOGIN}
						class="font-bold text-white hover:text-blue-200"
						onclick={closeMobileMenu}
					>
						{$t('common.navigation.login')}
					</a>
				{/if}
			</nav>
		</div>
	{/if}
</nav>
