<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';

	let accessToken = $state('');
	let refreshToken = $state('');
	let formElement: HTMLFormElement | undefined = $state();

	onMount(async () => {
		if (!browser) return;

		console.log('=== [Auth Callback Client] START ===');

		// Check for hash fragment (magic link tokens or errors)
		const hashParams = new URLSearchParams(window.location.hash.substring(1));
		const error = hashParams.get('error');
		const errorCode = hashParams.get('error_code');
		const errorDescription = hashParams.get('error_description');
		const hashAccessToken = hashParams.get('access_token');
		const hashRefreshToken = hashParams.get('refresh_token');
		const type = hashParams.get('type');

		console.log('[Auth Callback Client] Hash params:', {
			error,
			errorCode,
			errorDescription,
			hasAccessToken: !!hashAccessToken,
			hasRefreshToken: !!hashRefreshToken,
			type
		});

		// Handle authentication errors
		if (error) {
			// Map error codes to user-friendly error types
			let errorType = 'invalid';
			if (errorCode === 'otp_expired') {
				errorType = 'expired';
			} else if (error === 'access_denied') {
				errorType = 'invalid';
			}

			await goto(`/auth/setup-failed?error=${errorType}`);
			return;
		}

		// If we have tokens in the hash, submit them to server action
		if (hashAccessToken && hashRefreshToken) {
			console.log('[Auth Callback Client] 🔄 Submitting tokens to server for validation');
			accessToken = hashAccessToken;
			refreshToken = hashRefreshToken;

			// Auto-submit form after tokens are set
			setTimeout(() => {
				formElement?.requestSubmit();
			}, 0);
		} else {
			console.log('[Auth Callback Client] No hash tokens, PKCE flow handled by server');
		}
	});
</script>

<div class="flex items-center justify-center bg-muted px-4 py-8">
	<div class="text-center">
		<div
			class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
		></div>
		<p class="text-muted-foreground">Processing authentication...</p>

		<!-- Hidden form to submit tokens to server -->
		<form method="POST" bind:this={formElement} use:enhance class="hidden">
			<input type="hidden" name="access_token" value={accessToken} />
			<input type="hidden" name="refresh_token" value={refreshToken} />
		</form>
	</div>
</div>
