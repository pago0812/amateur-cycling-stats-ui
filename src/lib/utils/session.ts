import type { Cookies } from '@sveltejs/kit';

const JWT_SESSION_KEY = 'jwt-session';

export function saveJWT(cookies: Cookies, jwt: string) {
	const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 24 hours

	cookies.set(JWT_SESSION_KEY, jwt, {
		httpOnly: true,
		secure: false, // Set to true in production with HTTPS
		expires: expiresAt,
		sameSite: 'lax',
		path: '/'
	});
}

export function getJWT(cookies: Cookies): string {
	return cookies.get(JWT_SESSION_KEY) || '';
}

export function revokeJWT(cookies: Cookies) {
	cookies.delete(JWT_SESSION_KEY, {
		path: '/'
	});
}
