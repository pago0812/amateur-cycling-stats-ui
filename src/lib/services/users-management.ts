import type {
	LoginRequest,
	SigninRequest,
	UserSessionResponse
} from '$lib/types/services/users-management';

export const login = async ({ email, password }: LoginRequest): Promise<UserSessionResponse> => {
	const loginResponse = await fetch(`${import.meta.env.VITE_SERVICE_URL}/api/auth/local`, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify({
			identifier: email,
			password: password
		})
	});

	if (loginResponse.ok) {
		return { data: await loginResponse.json() };
	}

	return await loginResponse.json();
};

export const signin = async ({
	username,
	email,
	password
}: SigninRequest): Promise<UserSessionResponse> => {
	const signinResponse = await fetch(
		`${import.meta.env.VITE_SERVICE_URL}/api/auth/local/register`,
		{
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify({
				username,
				email,
				password
			})
		}
	);

	if (signinResponse.ok) {
		return { data: await signinResponse.json() };
	}

	return await signinResponse.json();
};
