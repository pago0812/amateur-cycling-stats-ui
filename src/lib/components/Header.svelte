<script lang="ts">
	import { Urls } from '$lib/constants/urls';
	import type { UserWithRelations } from '$lib/types/domain';
	import { t } from '$lib/i18n';

	let { user = null }: { user?: UserWithRelations | null } = $props();
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<nav class="bg-blue-600 text-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<a href={Urls.HOME} class="text-2xl font-bold">ACS</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden sm:flex sm:gap-4">
				<a href={Urls.HOME} class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
					{$t('common.navigation.home')}
				</a>
				<a
					href={Urls.RESULTS}
					class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
				>
					{$t('common.navigation.results')}
				</a>

				{#if user}
					<a
						href={Urls.PORTAL}
						class="px-3 py-2 rounded-md text-sm font-bold hover:bg-blue-700"
					>
						{$t('common.navigation.account')}
					</a>
				{:else}
					<a href={Urls.LOGIN} class="px-3 py-2 rounded-md text-sm font-bold hover:bg-blue-700">
						{$t('common.navigation.login')}
					</a>
				{/if}
			</div>

			<!-- Mobile menu button -->
			<div class="sm:hidden">
				<button
					onclick={toggleMobileMenu}
					class="inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700 focus:outline-none"
					aria-expanded={mobileMenuOpen}
				>
					<span class="sr-only">{$t('common.navigation.openMenu')}</span>
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
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu drawer -->
	{#if mobileMenuOpen}
		<!-- Backdrop -->
		<div
			class="fixed inset-0 bg-black bg-opacity-50 z-40"
			onclick={closeMobileMenu}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
		></div>

		<!-- Drawer -->
		<div class="fixed top-0 right-0 h-full w-64 bg-blue-600 z-50 shadow-lg">
			<nav class="flex flex-col gap-4 p-10 text-right">
				<a
					href={Urls.HOME}
					class="text-white hover:text-blue-200"
					onclick={closeMobileMenu}
				>
					{$t('common.navigation.home')}
				</a>
				<a
					href={Urls.RESULTS}
					class="text-white hover:text-blue-200"
					onclick={closeMobileMenu}
				>
					{$t('common.navigation.results')}
				</a>
				<a
					href={Urls.TEAMS}
					class="text-white hover:text-blue-200"
					onclick={closeMobileMenu}
				>
					{$t('common.navigation.teams')}
				</a>

				{#if user}
					<a
						href={Urls.PORTAL}
						class="text-white font-bold hover:text-blue-200"
						onclick={closeMobileMenu}
					>
						{$t('common.navigation.account')}
					</a>
				{:else}
					<a
						href={Urls.LOGIN}
						class="text-white font-bold hover:text-blue-200"
						onclick={closeMobileMenu}
					>
						{$t('common.navigation.login')}
					</a>
				{/if}
			</nav>
		</div>
	{/if}
</nav>
