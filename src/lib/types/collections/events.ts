export type EventStatusType = `${EventStatusEnum}`;

export enum EventStatusEnum {
	DRAFT = 'DRAFT',
	AVAILABLE = 'AVAILABLE',
	SOLD_OUT = 'SOLD_OUT',
	ON_GOING = 'ON_GOING',
	FINISHED = 'FINISHED'
}
