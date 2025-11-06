import type { Tables } from '../database.types';

/**
 * Database types for event junction tables.
 * These link events to their supported race configurations (categories, genders, lengths).
 *
 * Note: These tables don't have created_at/updated_at fields - they only have composite primary keys.
 */

/**
 * Junction table linking events to supported race categories.
 * Primary key: (event_id, race_category_id)
 */
export type EventSupportedCategoryDB = Tables<'event_supported_categories'>;

/**
 * Junction table linking events to supported race genders.
 * Primary key: (event_id, race_category_gender_id)
 */
export type EventSupportedGenderDB = Tables<'event_supported_genders'>;

/**
 * Junction table linking events to supported race lengths.
 * Primary key: (event_id, race_category_length_id)
 */
export type EventSupportedLengthDB = Tables<'event_supported_lengths'>;
