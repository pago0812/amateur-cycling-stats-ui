import qs from 'qs';
import type { Cyclist } from '$lib/types/entities/cyclists';

interface GetCyclistWithResultsByIdParams {
	id: string;
}

export const getCyclistWithResultsById = async ({
	id
}: GetCyclistWithResultsByIdParams): Promise<Cyclist> => {
	const query = {
		populate: {
			raceResults: {
				populate: {
					race: {
						populate: [
							'event',
							'raceCategory',
							'raceCategoryGender',
							'raceCategoryLength',
							'raceRanking'
						]
					},
					rankingPoint: {
						fields: ['points']
					}
				}
			}
		}
	};

	const queryString = qs.stringify(query);

	const cyclistResponse = await fetch(
		`${import.meta.env.VITE_SERVICE_URL}/api/cyclists/${id}?${queryString}`,
		{
			cache: 'no-store'
		}
	);

	if (!cyclistResponse.ok) {
		throw new Error(cyclistResponse.statusText);
	}

	const cyclist: Cyclist = (await cyclistResponse.json()).data;
	return cyclist;
};

export const createCyclist = async (cyclist: Cyclist) => {
	const createCyclistResponse = await fetch(
		`${import.meta.env.VITE_SERVICE_URL}/api/cyclists`,
		{
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify(cyclist)
		}
	);

	if (!createCyclistResponse.ok) {
		throw new Error(createCyclistResponse.statusText);
	}

	return createCyclistResponse.json();
};
