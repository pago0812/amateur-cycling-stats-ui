import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Auth callback handler for Supabase authentication flows.
 * Handles magic link invitations sent to organization owners.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	console.log('=== [Auth Callback] START ===');
	console.log('[Auth Callback] Full URL:', url.toString());
	console.log('[Auth Callback] Search Params:', Object.fromEntries(url.searchParams.entries()));

	const code = url.searchParams.get('code');
	const accessToken = url.searchParams.get('access_token');
	const refreshToken = url.searchParams.get('refresh_token');
	const tokenType = url.searchParams.get('token_type');
	const type = url.searchParams.get('type');

	console.log('[Auth Callback] Extracted params:', {
		code: code ? `${code.substring(0, 20)}...` : null,
		accessToken: accessToken ? `${accessToken.substring(0, 30)}...` : null,
		refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
		tokenType,
		type
	});

	// Handle PKCE flow (code parameter)
	if (code) {
		console.log('[Auth Callback] 🔄 Using PKCE flow (code exchange)');
		const { error, data } = await locals.supabase.auth.exchangeCodeForSession(code);

		console.log('[Auth Callback] exchangeCodeForSession result:', {
			error: error ? error.message : null,
			hasSession: !!data?.session,
			hasUser: !!data?.user
		});

		if (error) {
			console.error('[Auth Callback] ❌ PKCE flow failed:', error);
			return redirect(303, '/auth/setup-failed?error=invalid');
		}

		// Get user after session is established
		const {
			data: { user },
			error: userError
		} = await locals.supabase.auth.getUser();

		console.log('[Auth Callback] getUser result:', {
			error: userError ? userError.message : null,
			userId: user?.id,
			email: user?.email,
			hasMetadata: !!user?.user_metadata,
			organizationId: user?.user_metadata?.organizationId
		});

		if (user?.user_metadata?.organizationId) {
			console.log('[Auth Callback] ✅ Detected invitation flow, redirecting to complete-setup');
			return redirect(303, '/auth/complete-setup');
		}

		console.log('[Auth Callback] ✅ PKCE flow complete, redirecting to home');
		return redirect(303, '/');
	}

	// Handle magic link flow (access_token + refresh_token in query params)
	if (accessToken && refreshToken) {
		console.log('[Auth Callback] 🔄 Using Magic Link flow (token-based)');
		const { error, data } = await locals.supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});

		console.log('[Auth Callback] setSession result:', {
			error: error ? error.message : null,
			hasSession: !!data?.session,
			hasUser: !!data?.user
		});

		if (error) {
			console.error('[Auth Callback] ❌ Magic link flow failed:', error);
			return redirect(303, '/auth/setup-failed?error=invalid');
		}

		// Get user after session is established
		const {
			data: { user },
			error: userError
		} = await locals.supabase.auth.getUser();

		console.log('[Auth Callback] getUser result:', {
			error: userError ? userError.message : null,
			userId: user?.id,
			email: user?.email,
			hasMetadata: !!user?.user_metadata,
			metadata: user?.user_metadata,
			organizationId: user?.user_metadata?.organizationId
		});

		if (user?.user_metadata?.organizationId) {
			console.log('[Auth Callback] ✅ Detected invitation flow, redirecting to complete-setup');
			return redirect(303, '/auth/complete-setup');
		}

		console.log('[Auth Callback] ✅ Magic link flow complete, redirecting to home');
		return redirect(303, '/');
	}

	// No valid auth parameters found
	console.error('[Auth Callback] ❌ No valid auth parameters found');
	console.error(
		'[Auth Callback] Available params:',
		Object.keys(Object.fromEntries(url.searchParams.entries()))
	);
	return redirect(303, '/auth/setup-failed?error=invalid');
};
