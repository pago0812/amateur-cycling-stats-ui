I want to reactor this interface. I noticed that my domain interfaces are very coupled to my db model for example having name like "WithRelations" I want to change this to a simple
and domain driven aproach.

```
/**
 * Cyclist domain type - athlete profile.
 * All fields use camelCase convention.
 * Names are stored in the linked User record.
 */
export interface Cyclist {
	// Identity
	id: string;

	// Basic Info
	bornYear: number | null;

	// Relationships (Foreign Keys)
	genderId: string | null;
	userId: string; // Always required - every cyclist has a linked user (for name storage)

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Cyclist with populated relationships.
 * Used when fetching cyclist profile with race history and user account.
 */
export interface CyclistWithRelations extends Cyclist {
	// Populated relationships
	gender?: CyclistGender;
	user?: User;
	raceResults?: RaceResultWithRelations[];
}
```

So I would like to have something like

```
export interface Cyclist {
	// From users table
	id: string;  // The sort id of the user table
  firstName
  lastName
  createdAt: string;
	updatedAt: string;

  // From auth.users table
  email
  displayname
  hasAuth // boolean if it has a Auth.Users linked record

  // From roles table

  roleType

  //From cyclist table
  gender
	bornYear: number | null;

}
```

If you see this interface it is a sum of the tables that are defining a Cyclist
Cyclist = Auth.Users + Users + Roles + Cyclist

And this should be the same for other entities that are meant for people

Admin = Auth.Users + Users + Roles
Organizer = Auth.Users + Users + Roles + Organizer
Cyclist = Users + Roles + Cyclist // Anon variant

So in order to get this data we need to modify this RPC

```
		const { data: rpcResponse, error } = await event.locals.supabase.rpc(
			'get_user_with_relations'
			// No parameter - RPC will use auth.uid() internally and validate session
		);

```

So this rpc since we do not know which type of entity is my actual user it will return a reponse with all the posible objects

{
auth:{},
user:{},
role:{},
cyclist:{},
organizer:{}
}

Then based on the role.roleType we can determine which adapterUse

This RPC call should not live in hooks.server.ts file, create a function in services/user.ts that return this object and then return a User = Admin | Organizer | Cyclist

So in this request you should create admin.domain, modify cyclist.domain and organizer.domain

The goal of this refactor is to stop having 'WithRelations' interfaces in the domain, I want to start with the get Methods, but i a next task I will refactor create, update and delete

Let me know if you have questions, this a difficult task so it requires a deek thinking. Also please show me the Admin Organizer and Cyclist domain interface to check if you understand the request

---

This
// Optional populated relationships
organization?: Organization;
and
// Optional populated relationships
raceResults?: RaceResult[];

Must not be part of these interface since they are outside 'User' concept we should have methods like getOrganizationByOrganizer(organizer.id) or getRaceResultsByCyclist(...)

we can modify get_user_with_relations to get_user, this rpc now is checking if the user is authenticated, but I want to have a different method just to check that isAuthenticathed() so lets split that logic
