/**
 * Supabase Client Mock Utilities
 *
 * Provides mock factories for testing services that depend on Supabase client.
 */

import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

/**
 * Create a mock Supabase client with chainable query methods
 *
 * @example
 * const mockSupabase = createMockSupabaseClient();
 * mockSupabaseQuery(mockSupabase, { data: [...], error: null });
 */
export function createMockSupabaseClient(): SupabaseClient<Database> {
	const mock = {
		from: vi.fn(),
		rpc: vi.fn(),
		auth: {
			signInWithPassword: vi.fn(),
			signUp: vi.fn(),
			signOut: vi.fn(),
			getSession: vi.fn(),
			getUser: vi.fn()
		}
	} as unknown as SupabaseClient<Database>;

	return mock;
}

/**
 * Mock a successful Supabase query response
 *
 * @example
 * mockSupabaseQuery(mockSupabase, { data: [{ id: '1', name: 'Test' }], error: null });
 */
export function mockSupabaseQuery<T>(
	mockSupabase: SupabaseClient<Database>,
	response: { data: T | null; error: { message: string; code?: string } | null }
) {
	// Create a thenable query mock that resolves to response
	const queryMock = {
		select: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		neq: vi.fn().mockReturnThis(),
		gt: vi.fn().mockReturnThis(),
		gte: vi.fn().mockReturnThis(),
		lt: vi.fn().mockReturnThis(),
		lte: vi.fn().mockReturnThis(),
		like: vi.fn().mockReturnThis(),
		ilike: vi.fn().mockReturnThis(),
		is: vi.fn().mockReturnThis(),
		in: vi.fn().mockReturnThis(),
		contains: vi.fn().mockReturnThis(),
		order: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		range: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue(response),
		maybeSingle: vi.fn().mockResolvedValue(response),
		// Make the chain thenable so it can be awaited directly
		then: vi.fn((resolve) => Promise.resolve(response).then(resolve))
	};

	(mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue(queryMock);

	return queryMock;
}

/**
 * Mock a Supabase RPC function response
 *
 * @example
 * mockSupabaseRPC(mockSupabase, 'get_user_with_relations', { data: {...}, error: null });
 */
export function mockSupabaseRPC<T>(
	mockSupabase: SupabaseClient<Database>,
	functionName: string,
	response: { data: T | null; error: { message: string; code?: string } | null }
) {
	(mockSupabase.rpc as ReturnType<typeof vi.fn>).mockImplementation((name: string) => {
		if (name === functionName) {
			return Promise.resolve(response);
		}
		return Promise.resolve({ data: null, error: { message: 'Function not mocked' } });
	});
}

/**
 * Mock Supabase authentication methods
 */
export function mockSupabaseAuth(
	mockSupabase: SupabaseClient<Database>,
	options: {
		signInWithPassword?: { data: unknown; error: unknown };
		signUp?: { data: unknown; error: unknown };
		signOut?: { error: unknown };
		getSession?: { data: unknown; error: unknown };
		getUser?: { data: unknown; error: unknown };
	}
) {
	if (options.signInWithPassword) {
		(mockSupabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue(
			options.signInWithPassword
		);
	}

	if (options.signUp) {
		(mockSupabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue(options.signUp);
	}

	if (options.signOut) {
		(mockSupabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue(options.signOut);
	}

	if (options.getSession) {
		(mockSupabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(
			options.getSession
		);
	}

	if (options.getUser) {
		(mockSupabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(options.getUser);
	}
}

/**
 * Create mock database row with timestamps
 */
export function createMockDbRow<T extends object>(data: T) {
	return {
		...data,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	};
}

/**
 * Mock Supabase error response
 */
export function createMockError(message: string, code?: string) {
	return {
		message,
		code: code || 'UNKNOWN_ERROR',
		details: '',
		hint: ''
	};
}

/**
 * Common error codes for testing
 */
export const SUPABASE_ERROR_CODES = {
	PGRST116: 'PGRST116', // No rows found
	PGRST301: 'PGRST301', // Invalid filter
	'23505': '23505', // Unique violation
	'23503': '23503', // Foreign key violation
	invalid_credentials: 'invalid_credentials', // Auth error
	email_not_confirmed: 'email_not_confirmed' // Auth error
} as const;
