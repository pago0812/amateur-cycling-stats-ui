# Supabase RPC Functions Documentation

Complete reference for all Remote Procedure Call (RPC) functions used in the Amateur Cycling Stats application.

---

## Table of Contents

1. [get_auth_user](#1-get_auth_user)
2. [get_cyclist_by_user_id](#2-get_cyclist_by_user_id)
3. [get_race_results_by_user_id](#3-get_race_results_by_user_id)
4. [create_user_with_organizer_owner](#4-create_user_with_organizer_owner)
5. [complete_organizer_owner_setup](#5-complete_organizer_owner_setup)

---

## 1. get_auth_user

**Purpose**: Retrieves authenticated user with full relations, email, and display name (session validation)

**Definition**: `supabase/migrations/20250115000004_session_email_improvements.sql:12-144`

**Security**: `SECURITY DEFINER` (can access `auth.users` schema)

### Parameters

```typescript
{
  user_id?: string  // Optional - If provided, lookup by UUID; otherwise use current session
}
```

### Request Example

```typescript
// hooks.server.ts -> getSessionUser()
const { data, error } = await supabase.rpc('get_auth_user');
```

### Response Example

```json
{
	"id": "a1b2c3d4e5",
	"authUserId": "550e8400-e29b-41d4-a716-446655440000",
	"firstName": "John",
	"lastName": "Doe",
	"email": "john.doe@example.com",
	"displayName": "John Doe",
	"roleType": "ADMIN",
	"role": {
		"id": 1,
		"name": "ADMIN",
		"label": "Administrator"
	},
	"createdAt": "2025-01-15T10:00:00Z",
	"updatedAt": "2025-01-15T10:00:00Z"
}
```

**OR for Cyclist:**

```json
{
	"id": "f6g7h8i9j0",
	"authUserId": "660f9511-f39c-52e5-b827-557766551111",
	"firstName": "Jane",
	"lastName": "Smith",
	"email": "jane.smith@example.com",
	"displayName": "Jane Smith",
	"roleType": "CYCLIST",
	"role": {
		"id": 2,
		"name": "CYCLIST",
		"label": "Cyclist"
	},
	"cyclist": {
		"id": 10,
		"userId": "f6g7h8i9j0",
		"licenseNumber": "UCI12345",
		"birthdate": "1990-05-15",
		"gender": "F",
		"genderDetail": {
			"id": 2,
			"label": "Female",
			"code": "F"
		}
	},
	"createdAt": "2025-01-15T11:00:00Z",
	"updatedAt": "2025-01-15T11:00:00Z"
}
```

**OR for Organizer:**

```json
{
	"id": "k1l2m3n4o5",
	"authUserId": "770g0622-g40d-63f6-c938-668877662222",
	"firstName": "Bob",
	"lastName": "Johnson",
	"email": "bob.johnson@example.com",
	"displayName": "Bob Johnson",
	"roleType": "ORGANIZER_OWNER",
	"role": {
		"id": 4,
		"name": "ORGANIZER_OWNER",
		"label": "Organizer Owner"
	},
	"organizer": {
		"id": 5,
		"userId": "k1l2m3n4o5",
		"organizationId": "org123abc45",
		"organization": {
			"id": "org123abc45",
			"name": "Pro Cycling League",
			"address": "123 Main St",
			"city": "Barcelona",
			"state": "ACTIVE",
			"createdAt": "2025-01-10T09:00:00Z",
			"updatedAt": "2025-01-15T12:00:00Z"
		}
	},
	"createdAt": "2025-01-15T12:00:00Z",
	"updatedAt": "2025-01-15T12:00:00Z"
}
```

### Error Response

**No Session (Code 28000)**:

```json
{
	"error": {
		"message": "No active session found",
		"code": "28000"
	}
}
```

### Flow Diagram

```
┌──────────────────────┐
│   Every Request      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  hooks.server.ts     │
│  handle()            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Create Supabase     │
│  client with cookies │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────┐
│  routes/                │
│  +layout.server.ts      │
│  (Root Layout)          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  locals.getSessionUser()│
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  services/users.ts      │
│  getAuthUser()          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  supabase               │
│  .rpc('get_auth_user')  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Database Function      │
│  - Validate session     │
│  - Join auth.users      │
│  - Join cyclist/org     │
│  - Return JSONB         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Adapter                │
│  adaptAuthUserFromRpc() │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  User object available  │
│  in all routes via      │
│  parent()               │
└─────────────────────────┘
```

---

## 2. get_cyclist_by_user_id

**Purpose**: Fetches cyclist profile data (optimized - no auth.users or race results)

**Definition**: `supabase/migrations/20250115000001_core_foundation.sql:1154-1217`

**Security**: `STABLE` (read-only, no side effects)

### Parameters

```typescript
{
	p_user_id: string; // Required - User's UUID
}
```

### Request Example

```typescript
// services/cyclists.ts -> getCyclistById()
const { data, error } = await supabase.rpc('get_cyclist_by_user_id', {
	p_user_id: 'abc123def4'
});
```

### Response Example

```json
{
	"id": "abc123def4",
	"authUserId": "550e8400-e29b-41d4-a716-446655440000",
	"firstName": "Jane",
	"lastName": "Smith",
	"roleType": "CYCLIST",
	"role": {
		"id": 2,
		"name": "CYCLIST",
		"label": "Cyclist"
	},
	"cyclist": {
		"id": 10,
		"userId": "abc123def4",
		"licenseNumber": "UCI12345",
		"birthdate": "1990-05-15",
		"gender": "F",
		"genderDetail": {
			"id": 2,
			"label": "Female",
			"code": "F"
		}
	},
	"createdAt": "2025-01-15T11:00:00Z",
	"updatedAt": "2025-01-15T11:00:00Z"
}
```

### Flow Diagram

```
┌──────────────────────────┐
│  User visits             │
│  /cyclists/abc123def4    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  routes/cyclists/[id]/   │
│  +page.server.ts         │
│  load()                  │
└──────────┬───────────────┘
           │
           ▼
┌────────────────────────────────────┐
│  Promise.all([                     │
│    getCyclistById(id),             │ ◄─── This RPC
│    getRaceResultsByUserId(id)      │
│  ])                                │
└──────────┬─────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│  services/cyclists.ts    │
│  getCyclistById()        │
└──────────┬───────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  supabase                           │
│  .rpc('get_cyclist_by_user_id'│
│    { p_user_id: id })         │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Database Function                  │
│  - Find user by short_id            │
│  - Join roles, cyclists, genders    │
│  - Return JSONB                     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Adapter                            │
│  adaptCyclistFromRpc()              │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Cyclist profile rendered           │
│  in CyclistProfile.svelte           │
└─────────────────────────────────────┘
```

---

## 3. get_race_results_by_user_id

**Purpose**: Fetches race results array for a user (optimized parallel fetch)

**Definition**: `supabase/migrations/20250115000001_core_foundation.sql:1022-1147`

**Security**: `STABLE` (read-only, no side effects)

### Parameters

```typescript
{
	p_user_id: string; // Required - User's UUID
}
```

### Request Example

```typescript
// services/race-results.ts -> getRaceResultsByUserId()
const { data, error } = await supabase.rpc('get_race_results_by_user_id', {
	p_user_id: 'abc123def4'
});
```

### Response Example

```json
[
	{
		"id": 1,
		"raceId": "race1xyz23",
		"userId": "abc123def4",
		"position": 3,
		"points": 15,
		"race": {
			"id": "race1xyz23",
			"eventId": "event1abc45",
			"name": "Elite Men",
			"distance": 120.5,
			"date": "2025-01-10",
			"isPublicVisible": true,
			"categoryId": 1,
			"category": {
				"id": 1,
				"name": "Elite Men",
				"gender": "MALE",
				"genderDetail": {
					"id": 1,
					"label": "Masculino",
					"code": "MALE"
				},
				"length": "LONG",
				"lengthDetail": {
					"id": 1,
					"label": "Larga Distancia",
					"code": "LONG"
				},
				"rankingId": 1,
				"ranking": {
					"id": 1,
					"name": "UCI Elite",
					"description": "International Cycling Union elite ranking"
				}
			},
			"event": {
				"id": "event1abc45",
				"name": "Gran Fondo Barcelona",
				"location": "Barcelona",
				"date": "2025-01-10",
				"status": "FINISHED",
				"isPublicVisible": true,
				"organizationId": "org123abc45"
			}
		},
		"createdAt": "2025-01-10T18:00:00Z",
		"updatedAt": "2025-01-10T18:00:00Z"
	},
	{
		"id": 2,
		"raceId": "race2def67",
		"userId": "abc123def4",
		"position": 1,
		"points": 25,
		"race": {
			"id": "race2def67",
			"eventId": "event2ghi89",
			"name": "Master 40+",
			"distance": 80.0,
			"date": "2025-01-03",
			"isPublicVisible": true,
			"categoryId": 5,
			"category": {
				"id": 5,
				"name": "Master 40+ Men",
				"gender": "MALE",
				"genderDetail": {
					"id": 1,
					"label": "Masculino",
					"code": "MALE"
				},
				"length": "LONG",
				"lengthDetail": {
					"id": 1,
					"label": "Larga Distancia",
					"code": "LONG"
				},
				"rankingId": 2,
				"ranking": {
					"id": 2,
					"name": "National",
					"description": "National cycling ranking"
				}
			},
			"event": {
				"id": "event2ghi89",
				"name": "Vuelta Costa Brava",
				"location": "Girona",
				"date": "2025-01-03",
				"status": "FINISHED",
				"isPublicVisible": true,
				"organizationId": "org456def78"
			}
		},
		"createdAt": "2025-01-03T17:30:00Z",
		"updatedAt": "2025-01-03T17:30:00Z"
	}
]
```

**Empty array if no results:**

```json
[]
```

### Flow Diagram

```
┌──────────────────────────┐
│  User visits             │
│  /cyclists/abc123def4    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  routes/cyclists/[id]/   │
│  +page.server.ts         │
│  load()                  │
└──────────┬───────────────┘
           │
           ▼
┌────────────────────────────────────┐
│  Promise.all([                     │
│    getCyclistById(id),             │
│    getRaceResultsByUserId(id)      │ ◄─── This RPC
│  ])                                │
└──────────┬─────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│  services/               │
│  race-results.ts         │
│  getRaceResultsByUserId()│
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  supabase                            │
│  .rpc('get_race_results_by_user_     │
│    short_id',                        │
│    { p_user_id: id })          │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Database Function                   │
│  - Find user by short_id             │
│  - Join race_results → races →       │
│    events → categories → rankings    │
│  - Order by event.date DESC          │
│  - Return JSONB array                │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Adapter                             │
│  adaptRaceResultFromRpc()            │
│  (array map)                         │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Race results rendered in            │
│  CyclistResultsTable.svelte          │
└──────────────────────────────────────┘
```

---

## 4. create_user_with_organizer_owner

**Purpose**: Creates/updates user with organizer_owner role and links to organization (atomic)

**Definition**: `supabase/migrations/20250115000003_invitation_enhancements.sql:75-128`

**Security**: `SECURITY DEFINER` (can bypass RLS for user creation)

### Parameters

```typescript
{
  p_auth_user_id: string,        // UUID - Supabase auth user ID
  p_first_name: string,          // First name
  p_last_name: string,           // Last name
  p_organization_id: string      // UUID - Organization to link to
}
```

### Request Example

```typescript
// services/users-management.ts -> createOrganizerOwnerUser()
const { data, error } = await supabase.rpc('create_user_with_organizer_owner', {
	p_auth_user_id: '550e8400-e29b-41d4-a716-446655440000',
	p_first_name: 'Bob',
	p_last_name: 'Johnson',
	p_organization_id: '880h1733-h51e-74g7-d049-779988773333'
});
```

### Response Example

```json
"abc123def4"
```

**Type**: `string` (UUID) - The created/updated user's `public.users.id`

### Error Response

```json
{
	"error": {
		"message": "Organization not found",
		"code": "P0002"
	}
}
```

### Flow Diagram

```
┌──────────────────────────┐
│  Admin creates new       │
│  organization with owner │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  routes/admin/           │
│  organizations/new/      │
│  +page.server.ts         │
│  (form action)           │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  1. createOrganization() │
│  (state: WAITING_OWNER)  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  2. createAuthUserForInvitation()│
│  Supabase Admin API              │
│  - email: owner@example.com      │
│  - user_metadata:                │
│    { skip_auto_create: true,     │
│      organizationId: orgId }     │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  3. createOrganizerOwnerUser()   │
│  services/users-management.ts    │
└──────────┬───────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  supabase                           │
│  .rpc('create_user_with_organizer_  │
│    owner', {                        │
│      p_auth_user_id,                │
│      p_first_name,                  │
│      p_last_name,                   │
│      p_organization_id              │
│    })                               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Database Function (ATOMIC)         │
│  1. Get organizer_owner role        │
│  2. Create/update public.users      │
│     (role = organizer_owner)        │
│  3. Delete auto-created cyclist     │
│     profile (if exists)             │
│  4. Create organizers record        │
│     (links user to organization)    │
│  5. Return user.id                  │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  4. createInvitation()              │
│  5. generateInvitationLink()        │
│  6. sendInvitationEmail()           │
└─────────────────────────────────────┘
```

---

## 5. complete_organizer_owner_setup

**Purpose**: Atomically completes organizer owner invitation setup (most complex RPC)

**Definition**: `supabase/migrations/20250115000003_invitation_enhancements.sql:131-215`

**Security**: `SECURITY DEFINER` (can bypass RLS for multi-step operations)

**Critical Design**: This is the most complex RPC function. It performs 6 database operations in a single atomic transaction.

### Parameters

```typescript
{
  p_auth_user_id: string,      // UUID - Supabase auth user ID
  p_first_name: string,        // First name
  p_last_name: string,         // Last name
  p_invitation_email: string   // Email to validate invitation
}
```

### Request Example

```typescript
// routes/auth/complete-setup/+page.server.ts (form action)

// 1. First update password (separate - Auth API cannot be in transaction)
await supabase.auth.updateUser({ password: 'newPassword123' });

// 2. Then complete database operations atomically
const { data, error } = await supabase.rpc('complete_organizer_owner_setup', {
	p_auth_user_id: '550e8400-e29b-41d4-a716-446655440000',
	p_first_name: 'Bob',
	p_last_name: 'Johnson',
	p_invitation_email: 'bob.johnson@example.com'
});
```

### Response Example

```json
{
	"success": true,
	"organization_id": "org123abc45",
	"user_id": "abc123def4",
	"organization_id": "990i2844-i62f-85h8-e150-880099884444"
}
```

### Error Responses

**No pending invitation found:**

```json
{
	"error": {
		"message": "No pending invitation found for this email",
		"code": "P0002"
	}
}
```

**Organization not found:**

```json
{
	"error": {
		"message": "Organization not found for invitation",
		"code": "P0002"
	}
}
```

### Flow Diagram

```
┌─────────────────────────────────┐
│  Owner clicks invitation link   │
│  from email                     │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  /auth/callback                 │
│  - Exchanges code for session   │
│  - Detects organizationId       │
│    in user metadata             │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Redirect to                    │
│  /auth/complete-setup           │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  routes/auth/complete-setup/    │
│  +page.svelte                   │
│  - Form: firstName, lastName,   │
│    password                     │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  routes/auth/complete-setup/    │
│  +page.server.ts                │
│  (form action)                  │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  1. Update password             │
│  supabase.auth.updateUser()     │
│  (SEPARATE - Auth API)          │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  2. Complete setup atomically        │
│  supabase                            │
│  .rpc('complete_organizer_owner_     │
│    setup', {                         │
│      p_auth_user_id,                 │
│      p_first_name,                   │
│      p_last_name,                    │
│      p_invitation_email              │
│    })                                │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Database Function (ATOMIC)          │
│                                      │
│  Step 1: Validate                    │
│    - Find pending invitation         │
│    - Verify email matches            │
│    - Verify organization exists      │
│                                      │
│  Step 2: Update User Profile         │
│    - UPDATE public.users             │
│      SET first_name, last_name       │
│                                      │
│  Step 3: Link to Organization        │
│    - Call create_user_with_          │
│      organizer_owner()               │
│      (sets role + creates organizer) │
│                                      │
│  Step 4: Accept Invitation           │
│    - UPDATE organization_invitations │
│      SET status = 'accepted'         │
│                                      │
│  Step 5: Activate Organization       │
│    - UPDATE organizations            │
│      SET state = 'ACTIVE'            │
│                                      │
│  Step 6: Return Response             │
│    - Return JSONB with               │
│      organization_id           │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  3. Redirect to organization page    │
│  /admin/organizations/               │
│    {organization_id}           │
└──────────────────────────────────────┘
```

### Atomicity Guarantee

All 5 database operations succeed together or fail together:

1. ✅ Update user profile (first_name, last_name)
2. ✅ Set role to organizer_owner
3. ✅ Create organizers link
4. ✅ Accept invitation (status = 'accepted')
5. ✅ Activate organization (state = 'ACTIVE')

If any step fails, the entire transaction is rolled back.

---

## Performance Optimizations

### 1. Parallel Fetching Pattern

**Problem**: Fetching cyclist + race results sequentially would require 2 round-trips

**Solution**: Separate RPC functions enable parallel fetching:

```typescript
// ✅ OPTIMIZED - Parallel (2 queries, 1 round-trip)
const [cyclist, raceResults] = await Promise.all([
	getCyclistById(id), // get_cyclist_by_user_id
	getRaceResultsByUserId(id) // get_race_results_by_user_id
]);

// ❌ SLOW - Sequential (2 queries, 2 round-trips)
const cyclist = await getCyclistById(id);
const raceResults = await getRaceResultsByUserId(id);
```

### 2. Single Query Instead of N+1

**Problem**: Fetching race results + events + categories would require N+1 queries

**Solution**: RPC function uses JOINs to return everything in one query:

```sql
-- Single query returns race_results + races + events + categories + rankings
SELECT
  rr.*,
  r.*,
  e.*,
  rc.*,
  rr_sys.*
FROM race_results rr
JOIN races r ON rr.race_id = r.id
JOIN events e ON r.event_id = e.id
JOIN race_categories rc ON r.category_id = rc.id
JOIN race_rankings rr_sys ON rc.ranking_id = rr_sys.id
WHERE rr.user_id = (SELECT id FROM users WHERE id = p_user_id)
```

### 3. Conditional Joins

**Problem**: Not all users need cyclist or organizer data

**Solution**: `get_auth_user` only joins relevant tables based on role:

```sql
-- Only join cyclists if role is CYCLIST
cyclist_data := (
  SELECT jsonb_build_object(...)
  FROM cyclists c
  WHERE c.user_id = v_user_id
) WHEN v_role_name = 'CYCLIST'::role_name_enum ELSE NULL;

-- Only join organizers if role is ORGANIZER_*
organizer_data := (
  SELECT jsonb_build_object(...)
  FROM organizers o
  WHERE o.user_id = v_user_id
) WHEN v_role_name IN ('ORGANIZER_OWNER', 'ORGANIZER_STAFF') ELSE NULL;
```

### 4. Pre-sorted Results

**Problem**: Sorting race results in application code is inefficient

**Solution**: RPC function returns pre-sorted results:

```sql
ORDER BY e.date DESC  -- Most recent races first
```

### 5. Indexed Lookups

All RPC functions use indexed columns for fast lookups:

- `short_id` - Unique index on all public-facing tables
- `auth_user_id` - Unique index on `users` table
- Foreign key columns automatically indexed

---

## Security Considerations

### 1. SECURITY DEFINER Functions

Functions marked `SECURITY DEFINER` run with elevated privileges:

- `get_auth_user` - Can access `auth.users` schema
- `create_user_with_organizer_owner` - Can bypass RLS for user creation
- `create_user_with_organizer_staff` - Can bypass RLS for user creation
- `create_user_with_cyclist` - Can bypass RLS for user creation
- `complete_organizer_owner_setup` - Can bypass RLS for multi-step operations

**Important**: These functions still validate permissions internally (e.g., checking session, validating invitations).

### 2. Session Validation

`get_auth_user` validates active session before returning data:

```sql
-- Check if user is authenticated
SELECT auth.uid() INTO v_auth_user_id;
IF v_auth_user_id IS NULL THEN
  RAISE EXCEPTION 'No active session found'
    USING ERRCODE = '28000';  -- invalid_authorization_specification
END IF;
```

Application handles code `28000` as "not authenticated".

### 3. Email Verification

Helper functions use `SECURITY DEFINER` to safely access `auth.users`:

```sql
CREATE FUNCTION current_user_email_matches(check_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER  -- Can access auth.users
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND email = check_email
  );
$$;
```

RLS policies use these helpers to verify email ownership without exposing `auth.users`.

### 4. Atomic Operations

Critical flows use transactions to prevent partial updates:

```sql
BEGIN
  -- Step 1: Validate
  -- Step 2: Update
  -- Step 3: Link
  -- Step 4: Accept
  -- Step 5: Activate
  RETURN jsonb_build_object(...);
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback on any error
    RAISE;
END;
```

### 5. Input Validation

All RPC functions validate inputs before processing:

```sql
-- Example: complete_organizer_owner_setup validates invitation exists
SELECT id, organization_id INTO v_invitation_id, v_organization_id
FROM organization_invitations
WHERE email = p_invitation_email
  AND status = 'pending';

IF v_invitation_id IS NULL THEN
  RAISE EXCEPTION 'No pending invitation found for this email'
    USING ERRCODE = 'P0002';
END IF;
```

---

## Error Codes Reference

| Code       | Meaning                            | RPC Functions                                          |
| ---------- | ---------------------------------- | ------------------------------------------------------ |
| `28000`    | Invalid authorization (no session) | `get_auth_user`                                        |
| `P0002`    | No data found                      | `complete_organizer_owner_setup`, `create_user_with_*` |
| `PGRST116` | No rows returned                   | All read-only RPCs (graceful handling)                 |
| `23505`    | Unique violation                   | User creation RPCs (email already exists)              |
| `23503`    | Foreign key violation              | All RPCs with relationships                            |

---

## Migration History

| Migration File                                  | RPC Functions Added/Modified                                         |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `20250115000001_core_foundation.sql`            | `get_race_results_by_user_id`, `get_cyclist_by_user_id`  |
| `20250115000002_organization_invitations.sql`   | Organization state management (no RPC changes)                       |
| `20250115000003_invitation_enhancements.sql`    | `create_user_with_organizer_owner`, `complete_organizer_owner_setup` |
| `20250115000004_session_email_improvements.sql` | `get_auth_user` (new session-aware version)                          |

---

## Best Practices

### 1. Always Use Adapters

Never use RPC responses directly - always transform with adapters:

```typescript
// ✅ CORRECT - Use adapter
const { data } = await supabase.rpc('get_auth_user');
const user = data ? adaptAuthUserFromRpc(data) : null;

// ❌ WRONG - Use raw response
const { data } = await supabase.rpc('get_auth_user');
const user = data; // snake_case fields, wrong types
```

### 2. Type Cast JSONB Returns

TypeScript cannot infer JSONB structure - always type cast:

```typescript
// ✅ CORRECT - Type cast JSONB
const { data } = await supabase.rpc('complete_organizer_owner_setup', { ... });
const result = data as {
  success: boolean;
  organization_id: string;
};

// ❌ WRONG - No type cast
const { data } = await supabase.rpc('complete_organizer_owner_setup', { ... });
// data is 'unknown' type
```

### 3. Handle Errors Gracefully

Not all errors are exceptional - handle expected cases:

```typescript
// ✅ CORRECT - Distinguish expected vs unexpected errors
const { data, error } = await supabase.rpc('get_auth_user');

if (error) {
	// Expected: No session (code 28000)
	if (error.code === '28000') {
		return null;
	}

	// Unexpected: Database error
	console.error('Unexpected error:', error);
	throw error;
}
```

### 4. Use Parallel Fetching

When fetching independent data, use `Promise.all`:

```typescript
// ✅ OPTIMIZED - Parallel fetching (1 round-trip)
const [cyclist, raceResults] = await Promise.all([getCyclistById(id), getRaceResultsByUserId(id)]);

// ❌ SLOW - Sequential (2 round-trips)
const cyclist = await getCyclistById(id);
const raceResults = await getRaceResultsByUserId(id);
```

### 5. Separate Auth API from Database Operations

Auth API operations cannot be in database transactions:

```typescript
// ✅ CORRECT - Password update separate
await supabase.auth.updateUser({ password });  // Auth API
await supabase.rpc('complete_organizer_owner_setup', { ... });  // Database

// ❌ WRONG - Cannot combine in single transaction
await supabase.rpc('complete_setup_with_password', { password, ... });
// Password update via Auth API cannot be rolled back!
```

---

## TypeScript Type Definitions

### RPC Request Types

```typescript
// get_auth_user
type GetUserParams = {
	user_id?: string; // Optional
};

// get_cyclist_by_user_id / get_race_results_by_user_id
type GetByIdParams = {
	p_user_id: string; // Required
};

// create_user_with_organizer_owner
type CreateOrganizerOwnerUserParams = {
	p_auth_user_id: string; // UUID
	p_first_name: string;
	p_last_name: string;
	p_organization_id: string; // UUID
};

// complete_organizer_owner_setup
type CompleteSetupParams = {
	p_auth_user_id: string; // UUID
	p_first_name: string;
	p_last_name: string;
	p_invitation_email: string;
};
```

### RPC Response Types

```typescript
// get_auth_user (returns User union type after adapter)
type User = AdminUser | OrganizerUser | CyclistUser;

// get_cyclist_by_user_id (returns Cyclist after adapter)
type Cyclist = {
	id: string;
	authUserId: string;
	firstName: string;
	lastName: string;
	roleType: RoleTypeEnum;
	role: Role;
	cyclist: CyclistProfile;
	createdAt: string;
	updatedAt: string;
};

// get_race_results_by_user_id (returns RaceResultWithRelations[] after adapter)
type RaceResultWithRelations = {
	id: number;
	raceId: string;
	userId: string;
	position: number;
	points: number;
	race: Race;
	createdAt: string;
	updatedAt: string;
};

// create_user_with_organizer_owner (returns UUID string)
type CreateUserResponse = string; // user.id

// complete_organizer_owner_setup (returns JSONB object)
type CompleteSetupResponse = {
	success: boolean;
	organization_id: string;
	user_id: string;
	organization_id: string;
};
```

---

## Troubleshooting

### RPC Not Found Error

```typescript
// Error: "function public.get_auth_user() does not exist"
```

**Cause**: Migration not applied or function dropped

**Solution**:

```bash
supabase db reset  # Reapply all migrations
```

### Invalid Session Error (28000)

```typescript
// Error: code "28000" - No active session found
```

**Cause**: User not authenticated or session expired

**Solution**:

```typescript
// Handle gracefully
if (error?.code === '28000') {
	return null; // Not authenticated
}
```

### No Pending Invitation Error

```typescript
// Error: "No pending invitation found for this email"
```

**Cause**: Invitation already accepted or expired

**Solution**: Check `organization_invitations` table status

### Organization Not Found Error

```typescript
// Error: "Organization not found for invitation"
```

**Cause**: Organization deleted or invitation corrupted

**Solution**: Verify organization exists and state is `WAITING_OWNER`

---

## Summary

The application uses **5 RPC functions** to handle:

1. ✅ **Session Management** - `get_auth_user` (1 call per request)
2. ✅ **User Data Fetching** - `get_cyclist_by_user_id`
3. ✅ **Race Results** - `get_race_results_by_user_id`
4. ✅ **User Creation** - `create_user_with_organizer_owner`
5. ✅ **Invitation Flow** - `complete_organizer_owner_setup`

**Key Benefits**:

- 🚀 **Performance** - Single round-trip for complex queries
- 🔒 **Security** - Centralized validation and RLS enforcement
- ⚛️ **Atomicity** - Multi-step operations succeed or fail together
- 🎯 **Type Safety** - Explicit response types with adapters
- 📊 **Optimized** - Parallel fetching, conditional joins, pre-sorted results

All RPC functions follow the **Atomic Operations Pattern** and use **JSONB** for flexible return types with proper type casting in the application layer.
