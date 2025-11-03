export interface RaceCategoryGender {
	documentId: string;
	name: RaceCategoryGenderEnum;
}

export enum RaceCategoryGenderEnum {
	FEMALE = 'FEMALE',
	MALE = 'MALE',
	OPEN = 'OPEN'
}
