import qs from 'qs';
import type { Event } from '$lib/types/entities/events';
import { EventStatusEnum } from '$lib/types/collections/events';

interface GetPastEventsParams {
	year?: string;
}

const getPastEvents = async (params: GetPastEventsParams) => {
	const queryYear = !isNaN(Number(params.year)) ? Number(params.year) : new Date().getFullYear();

	const query = {
		sort: 'dateTime:desc',
		filters: {
			year: {
				$eq: queryYear
			},
			eventStatus: {
				$eq: EventStatusEnum.FINISHED
			}
		}
	};
	const queryString = qs.stringify(query);
	return getEvents(queryString);
};

const getFutureEvents = async () => {
	console.log('getFutureEvents');
	const query = {
		sort: 'dateTime:asc',
		filters: {
			$or: [
				{
					eventStatus: {
						$eq: EventStatusEnum.AVAILABLE
					}
				},
				{
					eventStatus: {
						$eq: EventStatusEnum.SOLD_OUT
					}
				}
			]
		}
	};
	const queryString = qs.stringify(query);
	return getEvents(queryString);
};

const getEvents = async (query: string) => {
	const eventResponse = await fetch(`${import.meta.env.VITE_SERVICE_URL}/api/events?${query}`, {
		cache: 'no-store'
	});

	if (!eventResponse.ok) {
		throw eventResponse.statusText;
	}

	const events: Event[] = (await eventResponse.json()).data;

	return events;
};

interface GetEventByIdParams {
	id: string;
}

const getEventWithCategoriesById = async (params: GetEventByIdParams) => {
	const query = {
		populate: [
			'supportedRaceCategories',
			'supportedRaceCategoryGenders',
			'supportedRaceCategoryLengths'
		]
	};

	const queryString = qs.stringify(query);

	const eventResponse = await fetch(
		`${import.meta.env.VITE_SERVICE_URL}/api/events/${params.id}?${queryString}`,
		{
			cache: 'no-store'
		}
	);
	if (!eventResponse.ok) {
		throw eventResponse.statusText;
	}

	const event: Event = (await eventResponse.json()).data;
	return event;
};

export { getPastEvents, getFutureEvents, getEventWithCategoriesById };
