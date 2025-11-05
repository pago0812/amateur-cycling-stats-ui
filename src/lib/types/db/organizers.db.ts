import type { Tables } from '../database.types';

/**
 * Database type for organizers table.
 * Use this instead of Tables<'organizers'> throughout the codebase.
 */
export type OrganizerDB = Tables<'organizers'>;
