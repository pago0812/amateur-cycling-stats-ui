import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

/**
 * Common database types used across service layer
 */

/**
 * Type-safe Supabase client with Database schema
 */
export type TypedSupabaseClient = SupabaseClient<Database>;
