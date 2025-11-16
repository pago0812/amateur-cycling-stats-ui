import type { RaceCategoryDB, RaceCategoryGenderDB, RaceCategoryLengthDB } from '$lib/types/db';
import type {
	RaceCategory,
	RaceCategoryGender,
	RaceCategoryLength
} from '$lib/types/domain/race-category.domain';
import { mapTimestamps } from './common.adapter';

/**
 * Adapts a raw database race category row to domain RaceCategory type.
 */
export function adaptRaceCategoryFromDb(dbCategory: RaceCategoryDB): RaceCategory {
	return {
		id: dbCategory.id,
		name: dbCategory.name,
		...mapTimestamps(dbCategory)
	};
}

/**
 * Adapts a raw database race category gender row to domain RaceCategoryGender type.
 */
export function adaptRaceCategoryGenderFromDb(dbGender: RaceCategoryGenderDB): RaceCategoryGender {
	return {
		id: dbGender.id,
		name: dbGender.name,
		...mapTimestamps(dbGender)
	};
}

/**
 * Adapts a raw database race category length row to domain RaceCategoryLength type.
 */
export function adaptRaceCategoryLengthFromDb(dbLength: RaceCategoryLengthDB): RaceCategoryLength {
	return {
		id: dbLength.id,
		name: dbLength.name,
		...mapTimestamps(dbLength)
	};
}

/**
 * Adapts race category from RPC response.
 * RPC returns flattened structure with name and id (no timestamps).
 */
export function adaptRaceCategoryFromRpc(rpcData: {
	name: string;
	id: string;
}): RaceCategory {
	return {
		id: rpcData.id,
		name: rpcData.name,
		createdAt: '', // RPC doesn't return timestamps for supported arrays
		updatedAt: ''
	};
}

/**
 * Adapts race category gender from RPC response.
 * RPC returns flattened structure with name and id (no timestamps).
 */
export function adaptRaceCategoryGenderFromRpc(rpcData: {
	name: string;
	id: string;
}): RaceCategoryGender {
	return {
		id: rpcData.id,
		name: rpcData.name,
		createdAt: '', // RPC doesn't return timestamps for supported arrays
		updatedAt: ''
	};
}

/**
 * Adapts race category length from RPC response.
 * RPC returns flattened structure with name and id (no timestamps).
 */
export function adaptRaceCategoryLengthFromRpc(rpcData: {
	name: string;
	id: string;
}): RaceCategoryLength {
	return {
		id: rpcData.id,
		name: rpcData.name,
		createdAt: '', // RPC doesn't return timestamps for supported arrays
		updatedAt: ''
	};
}
