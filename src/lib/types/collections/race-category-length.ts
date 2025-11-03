export interface RaceCategoryLength {
	documentId: string;
	name: RaceCategoryLengthType;
}

export type RaceCategoryLengthType = `${RaceCategoryLengthEnum}`;

export enum RaceCategoryLengthEnum {
	LONG = 'LONG',
	SHORT = 'SHORT',
	SPRINT = 'SPRINT',
	UNIQUE = 'UNIQUE'
}
