import type { CyclistGender } from '$lib/types/collections/cyclist-gender';
import type { RaceResult } from '$lib/types/entities/race-results';

export interface Cyclist {
	id: string;
	documentId: string;
	name: string;
	lastName: string;
	bornYear: number;
	gender: CyclistGender;
	raceResults?: RaceResult[];
}
