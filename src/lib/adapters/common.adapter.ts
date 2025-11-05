/**
 * Common Adapter Utilities
 *
 * Reusable functions for transforming database types to domain types.
 * All functions are type-safe (no 'any' types).
 */

/**
 * Maps timestamp fields from snake_case to camelCase.
 * Used by all entity adapters.
 */
export function mapTimestamps<T extends { created_at: string; updated_at: string }>(
	dbData: T
): { createdAt: string; updatedAt: string } {
	return {
		createdAt: dbData.created_at,
		updatedAt: dbData.updated_at
	};
}

/**
 * Generic array adapter utility.
 * Applies an adapter function to each item in an array.
 */
export function adaptArray<TDb, TDomain>(
	dbArray: TDb[] | null | undefined,
	adapter: (item: TDb) => TDomain
): TDomain[] {
	return (dbArray || []).map(adapter);
}

/**
 * Type guard to check if a value is not null or undefined.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}
