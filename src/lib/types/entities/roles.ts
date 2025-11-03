import { RoleTypeEnum } from '../collections/roles';

export interface Role {
	id: string;
	documentId: string;
	name: string;
	description: string;
	type: RoleTypeEnum;
}
