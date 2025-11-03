import qs from 'qs';
import type { RaceResult } from '$lib/types/entities/race-results';

interface GetRaceResultsByRaceIdParams {
	id: string;
}

export const getRaceResultsByRaceId = async ({
	id
}: GetRaceResultsByRaceIdParams): Promise<RaceResult[]> => {
	const query = {
		filters: {
			race: {
				documentId: id
			}
		},
		sort: 'place',
		populate: ['cyclist', 'rankingPoint']
	};

	const queryString = qs.stringify(query);

	const raceResultsResponse = await fetch(
		`${import.meta.env.VITE_SERVICE_URL}/api/race-results?${queryString}`,
		{
			cache: 'no-store'
		}
	);

	if (!raceResultsResponse.ok) {
		throw new Error(raceResultsResponse.statusText);
	}

	const raceResults: RaceResult[] = (await raceResultsResponse.json()).data;
	return raceResults;
};
