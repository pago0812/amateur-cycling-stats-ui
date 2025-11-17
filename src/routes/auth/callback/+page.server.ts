import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const accessToken = formData.get('access_token')?.toString();
		const refreshToken = formData.get('refresh_token')?.toString();

		// Validate that we have both tokens
		if (!accessToken || !refreshToken) {
			console.error('[Auth Callback Server Action] ❌ Missing tokens');
			throw redirect(303, '/auth/setup-failed?error=invalid');
		}

		// Use server-side Supabase client to set session
		const { error, data } = await locals.supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});

		console.log('[Auth Callback Server Action] setSession result:', {
			error: error ? error.message : null,
			hasSession: !!data?.session,
			hasUser: !!data?.user,
			userId: data?.user?.id,
			email: data?.user?.email,
			hasMetadata: !!data?.user?.user_metadata,
			metadata: data?.user?.user_metadata,
			organizationId: data?.user?.user_metadata?.organizationId
		});

		if (error || !data?.user) {
			console.error('[Auth Callback Server Action] ❌ Failed to set session:', error);
			throw redirect(303, '/auth/setup-failed?error=invalid');
		}

		const user = data.user;

		// Check if this is an organization invitation
		if (user.user_metadata?.organizationId) {
			console.log(
				'[Auth Callback Server Action] ✅ Invitation detected, redirecting to complete-setup'
			);
			throw redirect(303, '/auth/complete-setup');
		}

		console.log('[Auth Callback Server Action] ✅ Session created, redirecting to home');
		throw redirect(303, '/');
	}
};
