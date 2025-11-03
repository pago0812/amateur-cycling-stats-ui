import qs from 'qs';
import type { Race } from '$lib/types/entities/races';

interface GetRaceWithFiltersParams {
	age: string;
	length: string;
	gender: string;
}

export const getRaceWithResultsWithFilters = async (
	params: GetRaceWithFiltersParams
): Promise<Race> => {
	const query = {
		filters: {
			raceCategory: {
				documentId: params.age
			},
			raceCategoryGender: {
				documentId: params.gender
			},
			raceCategoryLength: {
				documentId: params.length
			}
		},
		populate: {
			raceResults: {
				sort: 'place',
				populate: ['cyclist', 'rankingPoint']
			}
		}
	};

	const queryString = qs.stringify(query);

	const raceResponse = await fetch(
		`${import.meta.env.VITE_SERVICE_URL}/api/races?${queryString}`,
		{
			cache: 'no-store'
		}
	);

	if (!raceResponse.ok) {
		throw new Error(raceResponse.statusText);
	}

	const races: Race[] = (await raceResponse.json()).data;
	return races[0];
};
