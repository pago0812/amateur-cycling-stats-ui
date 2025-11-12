# Row Level Security (RLS) Policies Documentation

## Overview

This document provides comprehensive documentation of all Row Level Security policies implemented in the Amateur Cycling Stats database. RLS ensures that users can only access data they're authorized to see based on their role and organizational membership.

## Role Hierarchy

The system implements a 5-level role hierarchy:

1. **`public`** - Anonymous/unauthenticated users
2. **`cyclist`** - Registered athletes (default role for new signups)
3. **`organizer_staff`** - Organization staff with limited permissions
4. **`organizer_owner`** - Organization owner/admin with full org permissions
5. **`admin`** - System administrator with unrestricted access

**Note:** The database previously used `organizer` for owners, but this is being renamed to `organizer_owner` for clarity.

---

## Helper Functions Reference

### Core Role Checks

#### `is_admin() → BOOLEAN`

```sql
-- Returns TRUE if current user has 'admin' role
SELECT public.is_admin();
```

#### `has_role(role_name TEXT) → BOOLEAN`

```sql
-- Returns TRUE if current user has specified role
SELECT public.has_role('cyclist');
```

#### `get_my_role() → TEXT`

```sql
-- Returns current user's role name ('admin', 'organizer_owner', 'organizer_staff', 'cyclist', 'public')
SELECT public.get_my_role();
```

### Organization Checks

#### `is_organizer() → BOOLEAN`

```sql
-- Returns TRUE if current user has an organizer profile (either owner or staff)
SELECT public.is_organizer();
```

#### `is_organizer_owner() → BOOLEAN`

```sql
-- Returns TRUE if current user is an organizer with 'organizer_owner' role
-- Note: Currently checks for 'organizer' - will be updated to 'organizer_owner'
SELECT public.is_organizer_owner();
```

#### `get_user_organization_id() → UUID`

```sql
-- Returns the organization_id for current user's organizer profile
-- Returns NULL if user is not an organizer
SELECT public.get_user_organization_id();
```

#### `is_in_event_organization(event_id UUID) → BOOLEAN`

```sql
-- Returns TRUE if current user belongs to the organization that owns the event
SELECT public.is_in_event_organization('event-uuid-here');
```

### Cyclist Checks

#### `is_cyclist_unlinked(cyclist_id UUID) → BOOLEAN`

```sql
-- Returns TRUE if cyclist has no auth_user_id (anonymous/unregistered cyclist)
-- Used for delete permissions: organizers can only delete unlinked cyclists
SELECT public.is_cyclist_unlinked('cyclist-uuid-here');
```

---

## Policy Matrix

### Legend

- ✅ **Allowed**
- ❌ **Denied**
- 🔒 **Conditional** (see notes)

---

## Reference Data Tables (Lookup Tables)

These tables contain system reference data that rarely changes.

### cyclist_genders

| Role                | SELECT | INSERT | UPDATE | DELETE |
| ------------------- | ------ | ------ | ------ | ------ |
| **admin**           | ✅     | ✅     | ✅     | ✅     |
| **organizer_owner** | ✅     | ❌     | ❌     | ❌     |
| **organizer_staff** | ✅     | ❌     | ❌     | ❌     |
| **cyclist**         | ✅     | ❌     | ❌     | ❌     |
| **public**          | ✅     | ❌     | ❌     | ❌     |

**Policies:**

```sql
-- Everyone can view genders
CREATE POLICY "Everyone can view cyclist genders"
  ON cyclist_genders FOR SELECT TO public USING (true);

-- Only admins can manage
CREATE POLICY "Only admins can manage cyclist genders"
  ON cyclist_genders FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

### race_categories, race_category_genders, race_category_lengths, race_rankings

Same permissions as `cyclist_genders` - all lookup tables follow the same pattern:

- **Public read access** (everyone can view reference data)
- **Admin-only write access** (only admins can manage system data)

---

### roles

| Role                | SELECT | INSERT | UPDATE | DELETE |
| ------------------- | ------ | ------ | ------ | ------ |
| **admin**           | ✅     | ✅     | ✅     | ✅     |
| **organizer_owner** | ✅     | ❌     | ❌     | ❌     |
| **organizer_staff** | ✅     | ❌     | ❌     | ❌     |
| **cyclist**         | ✅     | ❌     | ❌     | ❌     |
| **public**          | ❌     | ❌     | ❌     | ❌     |

**Rationale:** Roles are reference data that authenticated users need to see for their own user profiles and in nested queries (e.g., viewing organizer profiles with role information). Only admins can modify roles.

**Policies:**

```sql
-- Authenticated users can view roles
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT TO authenticated
  USING (true);

-- Only admins can manage roles
CREATE POLICY "Only admins can manage roles"
  ON roles FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

**Current Status:** ✅ **CORRECT** - Authenticated users can read, only admins can modify

---

### ranking_points

| Role                | SELECT | INSERT | UPDATE | DELETE |
| ------------------- | ------ | ------ | ------ | ------ |
| **admin**           | ✅     | ✅     | ✅     | ✅     |
| **organizer_owner** | ✅     | ❌     | ❌     | ❌     |
| **organizer_staff** | ✅     | ❌     | ❌     | ❌     |
| **cyclist**         | ✅     | ❌     | ❌     | ❌     |
| **public**          | ✅     | ❌     | ❌     | ❌     |

**Policies:**

```sql
-- Everyone can view ranking points
CREATE POLICY "Ranking points are viewable by everyone"
  ON ranking_points FOR SELECT TO public USING (true);

-- Only admins can manage ranking points
CREATE POLICY "Only admins can manage ranking points"
  ON ranking_points FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

---

## Core Entity Tables

### users

| Role                | SELECT | INSERT               | UPDATE                  | DELETE                  |
| ------------------- | ------ | -------------------- | ----------------------- | ----------------------- |
| **admin**           | ✅     | ✅                   | ✅ All                  | ✅ All                  |
| **organizer_owner** | ✅     | 🔒 Unlinked only     | 🔒 Org's unlinked users | 🔒 Org's unlinked users |
| **organizer_staff** | ✅     | 🔒 Unlinked only     | 🔒 Org's unlinked users | 🔒 Org's unlinked users |
| **cyclist**         | ✅     | 🔒 Self only         | 🔒 Self only            | ❌                      |
| **public**          | ✅     | 🔒 Cyclist role only | ❌                      | ❌                      |

**Notes:**

- **Unlinked users:** Users with `auth_user_id IS NULL` (created by organizers for race results)
- **Org's unlinked users:** Unlinked users created by someone in the same organization
- **Self only:** Users can only manage their own profile (`auth_user_id = auth.uid()`)
- **Public insert:** During registration, public users can create user records with cyclist role

**Policies:**

```sql
-- Everyone can view user profiles (needed for race results with cyclist names)
CREATE POLICY "Everyone can view user profiles"
  ON users FOR SELECT TO public USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Admins can manage all users
CREATE POLICY "Admins can manage all users"
  ON users FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Organizers can insert unlinked users
CREATE POLICY "Organizers can create unlinked users"
  ON users FOR INSERT TO authenticated
  WITH CHECK (
    public.is_organizer()
    AND auth_user_id IS NULL
  );

-- Organizers can update unlinked users created by their organization
CREATE POLICY "Organizers can update org unlinked users"
  ON users FOR UPDATE TO authenticated
  USING (
    auth_user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM cyclists c
      JOIN race_results rr ON c.id = rr.cyclist_id
      JOIN races r ON rr.race_id = r.id
      WHERE c.user_id = users.id
        AND public.is_in_event_organization(r.event_id)
    )
  );

-- Organizers can delete unlinked users created by their organization
CREATE POLICY "Organizers can delete org unlinked users"
  ON users FOR DELETE TO authenticated
  USING (
    auth_user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM cyclists c
      JOIN race_results rr ON c.id = rr.cyclist_id
      JOIN races r ON rr.race_id = r.id
      WHERE c.user_id = users.id
        AND public.is_in_event_organization(r.event_id)
    )
  );
```

**Current Status:** ⚠️ **NEEDS FIX** - Organizer policies need implementation

---

### cyclists

| Role                | SELECT | INSERT       | UPDATE          | DELETE           |
| ------------------- | ------ | ------------ | --------------- | ---------------- |
| **admin**           | ✅     | ✅           | ✅ All          | ✅ All           |
| **organizer_owner** | ✅     | ✅           | 🔒 Org cyclists | 🔒 Unlinked only |
| **organizer_staff** | ✅     | ✅           | 🔒 Org cyclists | 🔒 Unlinked only |
| **cyclist**         | ✅     | 🔒 Self only | 🔒 Self only    | ❌               |
| **public**          | ✅     | ❌           | ❌              | ❌               |

**Notes:**

- **Org cyclists:** Cyclists created by anyone in the organizer's organization (tracked via `created_by` in events)
- **Unlinked only:** Can only delete cyclists with `user.auth_user_id IS NULL`
- **Self only:** Cyclists can only manage their own profile (`user_id = auth.uid()`)

**Rationale:** Organizers create cyclist profiles for race results. They can manage cyclists they've created but cannot delete verified (linked) accounts.

**Policies:**

```sql
-- Everyone can view all cyclist profiles
CREATE POLICY "Cyclists are viewable by everyone"
  ON cyclists FOR SELECT TO public USING (true);

-- Cyclists can insert their own profile (via trigger)
CREATE POLICY "Users can insert own cyclist profile"
  ON cyclists FOR INSERT TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Organizers can create any cyclist
CREATE POLICY "Organizers can insert cyclist profiles"
  ON cyclists FOR INSERT TO authenticated
  WITH CHECK (
    public.is_organizer()
    OR public.is_admin()
  );

-- Cyclists can update their own profile
CREATE POLICY "Cyclists can update own profile"
  ON cyclists FOR UPDATE TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Organizers can update cyclists created by their organization
CREATE POLICY "Organizers can update org cyclists"
  ON cyclists FOR UPDATE TO authenticated
  USING (
    public.is_organizer()
    AND EXISTS (
      SELECT 1 FROM race_results rr
      JOIN races r ON rr.race_id = r.id
      WHERE rr.cyclist_id = cyclists.id
        AND public.is_in_event_organization(r.event_id)
    )
  );

-- Admins can update any cyclist
CREATE POLICY "Admins can update any cyclist"
  ON cyclists FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete any cyclist
CREATE POLICY "Admins can delete any cyclist"
  ON cyclists FOR DELETE TO authenticated
  USING (public.is_admin());

-- Organizers can delete only unlinked cyclists
CREATE POLICY "Organizers can delete unlinked cyclists"
  ON cyclists FOR DELETE TO authenticated
  USING (
    public.is_organizer()
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = cyclists.user_id
        AND u.auth_user_id IS NULL
        AND EXISTS (
          SELECT 1 FROM race_results rr
          JOIN races r ON rr.race_id = r.id
          WHERE rr.cyclist_id = cyclists.id
            AND public.is_in_event_organization(r.event_id)
        )
    )
  );
```

**Current Status:** ⚠️ **NEEDS FIX** - Currently allows organizers to update ANY cyclist

---

### organizations

| Role                | SELECT                      | INSERT | UPDATE     | DELETE                   |
| ------------------- | --------------------------- | ------ | ---------- | ------------------------ |
| **admin**           | ✅ All (including inactive) | ✅     | ✅ All     | ❌ (soft delete only)    |
| **organizer_owner** | ✅ Active only              | ❌     | 🔒 Own org | 🔒 Own org (soft delete) |
| **organizer_staff** | ✅ Active only              | ❌     | 🔒 Own org | ❌                       |
| **cyclist**         | ✅ Active only              | ❌     | ❌         | ❌                       |
| **public**          | ✅ Active only              | ❌     | ❌         | ❌                       |

**Notes:**

- **Active only:** Can only see organizations where `is_active = true`
- **Own org:** Can only modify their own organization (`organization_id = get_user_organization_id()`)
- **Soft delete:** Delete means setting `is_active = false`, not hard deletion

**Policies:**

```sql
-- Public can view active organizations
CREATE POLICY "Public can view active organizations"
  ON organizations FOR SELECT TO public
  USING (is_active = true);

-- Admins can view all organizations (including inactive)
CREATE POLICY "Admins can view all organizations"
  ON organizations FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admins can insert organizations
CREATE POLICY "Admins can insert organizations"
  ON organizations FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update any organization
CREATE POLICY "Admins can update organizations"
  ON organizations FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Organizer owners can update their own organization
CREATE POLICY "Organizer owners can update own organization"
  ON organizations FOR UPDATE TO authenticated
  USING (
    public.is_organizer_owner()
    AND id = public.get_user_organization_id()
  )
  WITH CHECK (
    public.is_organizer_owner()
    AND id = public.get_user_organization_id()
  );

-- Organizer owners can soft delete their own organization
CREATE POLICY "Organizer owners can soft delete own organization"
  ON organizations FOR UPDATE TO authenticated
  USING (
    public.is_organizer_owner()
    AND id = public.get_user_organization_id()
  )
  WITH CHECK (
    public.is_organizer_owner()
    AND id = public.get_user_organization_id()
    AND is_active = false  -- Ensure this is a soft delete
  );

-- Note: Hard deletes are prevented to preserve data integrity
```

**Current Status:** ⚠️ **NEEDS FIX** - Organizers cannot currently manage their own org

---

### organizers

| Role                | SELECT | INSERT     | UPDATE       | DELETE     |
| ------------------- | ------ | ---------- | ------------ | ---------- |
| **admin**           | ✅ All | ✅         | ✅ All       | ✅ All     |
| **organizer_owner** | ✅ All | 🔒 Own org | 🔒 Own org   | 🔒 Own org |
| **organizer_staff** | ✅ All | ❌         | 🔒 Self only | ❌         |
| **cyclist**         | ❌     | ❌         | ❌           | ❌         |
| **public**          | ❌     | ❌         | ❌           | ❌         |

**Notes:**

- **Own org:** Can only manage organizers in their organization
- **Self only:** Staff can only update their own organizer profile

**Rationale:** Organizer owners need to manage their team members. Staff can update their own info but cannot add/remove team members.

**Policies:**

```sql
-- Users can view own organizer profile
CREATE POLICY "Users can view own organizer profile"
  ON organizers FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Admins can view all organizer profiles
CREATE POLICY "Admins can view all organizers"
  ON organizers FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admins can manage all organizers
CREATE POLICY "Admins can manage all organizers"
  ON organizers FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Organizer owners can insert organizers to their organization
CREATE POLICY "Organizer owners can add organizers to their org"
  ON organizers FOR INSERT TO authenticated
  WITH CHECK (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

-- Organizer owners can update organizers in their organization
CREATE POLICY "Organizer owners can update org organizers"
  ON organizers FOR UPDATE TO authenticated
  USING (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  )
  WITH CHECK (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

-- Organizer owners can delete organizers from their organization
CREATE POLICY "Organizer owners can remove org organizers"
  ON organizers FOR DELETE TO authenticated
  USING (
    public.is_organizer_owner()
    AND organization_id = public.get_user_organization_id()
  );

-- Organizer staff can update their own profile
CREATE POLICY "Organizer staff can update own profile"
  ON organizers FOR UPDATE TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );
```

**Current Status:** ⚠️ **NEEDS FIX** - Organizers cannot currently manage their team

---

### events

| Role                | SELECT                 | INSERT     | UPDATE     | DELETE     |
| ------------------- | ---------------------- | ---------- | ---------- | ---------- |
| **admin**           | ✅ All                 | ✅         | ✅ All     | ✅ All     |
| **organizer_owner** | 🔒 Org events + Public | 🔒 Own org | 🔒 Own org | 🔒 Own org |
| **organizer_staff** | 🔒 Org events + Public | 🔒 Own org | 🔒 Own org | 🔒 Own org |
| **cyclist**         | 🔒 Public only         | ❌         | ❌         | ❌         |
| **public**          | 🔒 Public only         | ❌         | ❌         | ❌         |

**Notes:**

- **Public only:** Can only see events where `is_public_visible = true`
- **Org events:** Can see all events owned by their organization
- **Own org:** Can only manage events where `organization_id = get_user_organization_id()`

**Policies:**

```sql
-- Public can see public events, org members see org events, admins see all
CREATE POLICY "Events are viewable based on visibility and organization"
  ON events FOR SELECT TO public
  USING (
    is_public_visible = true
    OR public.is_in_event_organization(id)
    OR public.is_admin()
  );

-- Organizers can create events for their organization
CREATE POLICY "Organizers can create events for their organization"
  ON events FOR INSERT TO authenticated
  WITH CHECK (
    (
      public.is_organizer()
      AND organization_id = public.get_user_organization_id()
    )
    OR public.is_admin()
  );

-- Organization members can update their org's events
CREATE POLICY "Organization members can update events"
  ON events FOR UPDATE TO authenticated
  USING (
    public.is_in_event_organization(id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_in_event_organization(id)
    OR public.is_admin()
  );

-- Organization members (both owner and staff) can delete their org's events
CREATE POLICY "Organization members can delete events"
  ON events FOR DELETE TO authenticated
  USING (
    public.is_in_event_organization(id)
    OR public.is_admin()
  );
```

**Current Status:** ⚠️ **NEEDS FIX** - Currently only organizer_owner can delete (should allow staff too)

---

### races

| Role                | SELECT                | INSERT        | UPDATE       | DELETE       |
| ------------------- | --------------------- | ------------- | ------------ | ------------ |
| **admin**           | ✅ All                | ✅            | ✅ All       | ✅ All       |
| **organizer_owner** | 🔒 Org races + Public | 🔒 Org events | 🔒 Org races | 🔒 Org races |
| **organizer_staff** | 🔒 Org races + Public | 🔒 Org events | 🔒 Org races | 🔒 Org races |
| **cyclist**         | 🔒 Public only        | ❌            | ❌           | ❌           |
| **public**          | 🔒 Public only        | ❌            | ❌           | ❌           |

**Notes:**

- **Public only:** Can only see races where both `race.is_public_visible = true` AND `event.is_public_visible = true`
- **Org races:** Races belonging to events owned by their organization
- **Org events:** Can create races for events owned by their organization

**Rationale:** Staff can fully manage races (including delete) for their organization's events.

**Policies:**

```sql
-- Public sees public races, org members see org races, admins see all
CREATE POLICY "Races are viewable based on visibility"
  ON races FOR SELECT TO public
  USING (
    is_public_visible = true
    OR public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- Event organization members can create races
CREATE POLICY "Event organization members can create races"
  ON races FOR INSERT TO authenticated
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- Event organization members can update races
CREATE POLICY "Event organization members can update races"
  ON races FOR UPDATE TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );

-- Event organization members (both owner and staff) can delete races
CREATE POLICY "Event organization members can delete races"
  ON races FOR DELETE TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );
```

**Current Status:** ✅ **CORRECT** - Staff can already delete races (policy allows all org members)

---

### race_results

| Role                | SELECT                  | INSERT       | UPDATE         | DELETE         |
| ------------------- | ----------------------- | ------------ | -------------- | -------------- |
| **admin**           | ✅ All                  | ✅           | ✅ All         | ✅ All         |
| **organizer_owner** | 🔒 Org results + Public | 🔒 Org races | 🔒 Org results | 🔒 Org results |
| **organizer_staff** | 🔒 Org results + Public | 🔒 Org races | 🔒 Org results | 🔒 Org results |
| **cyclist**         | 🔒 Public only          | ❌           | ❌             | ❌             |
| **public**          | 🔒 Public only          | ❌           | ❌             | ❌             |

**Notes:**

- **Public only:** Can only see results where both `race.is_public_visible = true` AND `event.is_public_visible = true`
- **Org results:** Results for races belonging to their organization's events
- **Org races:** Can create results for races in their organization's events

**Rationale:** Staff need full CRUD access to manage race results (including fixing mistakes by deleting).

**Policies:**

```sql
-- Public sees results if race and event are public, org members see org results, admins see all
CREATE POLICY "Race results are viewable based on visibility"
  ON race_results FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM races
      JOIN events ON races.event_id = events.id
      WHERE races.id = race_results.race_id
        AND races.is_public_visible = true
        AND events.is_public_visible = true
    )
    OR EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_results.race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  );

-- Org members (including staff) can create results
CREATE POLICY "Event organization members can create race results"
  ON race_results FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  );

-- Org members (including staff) can update results
CREATE POLICY "Event organization members can update race results"
  ON race_results FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_results.race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_results.race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  );

-- Org members (including staff) can delete results
CREATE POLICY "Event organization members can delete race results"
  ON race_results FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM races
      WHERE races.id = race_results.race_id
        AND public.is_in_event_organization(races.event_id)
    )
    OR public.is_admin()
  );
```

**Current Status:** ⚠️ **NEEDS FIX** - Currently only organizer_owner can delete (should allow staff too)

---

## Junction Tables

These tables link events to their supported categories, genders, and lengths.

### event_supported_categories

| Role                | SELECT                 | INSERT        | UPDATE        | DELETE        |
| ------------------- | ---------------------- | ------------- | ------------- | ------------- |
| **admin**           | ✅                     | ✅            | ✅            | ✅            |
| **organizer_owner** | 🔒 Org events + Public | 🔒 Org events | 🔒 Org events | 🔒 Org events |
| **organizer_staff** | 🔒 Org events + Public | 🔒 Org events | 🔒 Org events | 🔒 Org events |
| **cyclist**         | 🔒 Public only         | ❌            | ❌            | ❌            |
| **public**          | 🔒 Public only         | ❌            | ❌            | ❌            |

**Notes:**

- Visibility follows parent event's `is_public_visible` flag
- Organization members can fully manage their event's configurations

**Policies:**

```sql
-- Viewable if parent event is viewable
CREATE POLICY "Event supported categories viewable with event"
  ON event_supported_categories FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
        AND (
          events.is_public_visible = true
          OR public.is_in_event_organization(events.id)
          OR public.is_admin()
        )
    )
  );

-- Event organization can manage supported categories
CREATE POLICY "Event organization can manage supported categories"
  ON event_supported_categories FOR ALL TO authenticated
  USING (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_in_event_organization(event_id)
    OR public.is_admin()
  );
```

### event_supported_genders, event_supported_lengths

Same policies as `event_supported_categories` - all junction tables follow the same pattern.

---

## Visibility Rules Summary

### Public Visibility Logic

```
EVENT.is_public_visible = true
  ↓ Visible to public
  └─> EVENT details

RACE.is_public_visible = true  AND  EVENT.is_public_visible = true
  ↓ Visible to public
  └─> RACE details

RACE_RESULT viewable when BOTH race AND event are public
  ↓ Visible to public
  └─> RACE_RESULT details (with cyclist name from users table)
```

### Organization Member Access

Organization members (both owner and staff) bypass public visibility checks:

- See **all events** owned by their organization
- See **all races** in their organization's events
- See **all race results** for their organization's races
- Can manage all content for their organization's events

### Admin Access

Admins have **unrestricted access** to all data, regardless of visibility flags or organization membership.

---

## Security Considerations

### Authentication Context

All policies use `auth.uid()` to identify the current user:

```sql
-- Check if user is viewing their own profile
WHERE auth_user_id = auth.uid()

-- Check if user belongs to organization
WHERE user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
```

### Performance Optimizations

1. **Indexes:** All foreign keys and commonly filtered columns have indexes
2. **Helper Functions:** Use `SECURITY DEFINER` for consistent privilege elevation
3. **EXISTS vs JOIN:** Use `EXISTS` subqueries for better performance in RLS policies

### Common Pitfalls

1. **Recursive RLS:** Avoid circular dependencies (e.g., events checking races checking events)
2. **NULL Handling:** Always consider NULL cases (e.g., `auth_user_id IS NULL` for unlinked users)
3. **Soft Deletes:** Remember `is_active` flag for organizations (not hard deleted)

---

## Testing RLS Policies

### Test as Anonymous User

```sql
SET ROLE anon;
SELECT * FROM events;  -- Should only see public events
RESET ROLE;
```

### Test as Specific User

```sql
-- Set session to specific user
SELECT auth.uid();  -- Should return user's UUID
SELECT * FROM events;  -- Should see user's org events + public
```

### Test Policy Coverage

```sql
-- Ensure all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
-- Should return empty result
```

---

## Migration Strategy

When updating RLS policies:

1. **Document current behavior** (this file)
2. **Write new policies** in migration
3. **Test with seed data** using different roles
4. **Verify with `supabase db reset`**
5. **Update this documentation**

---

## Changelog

### 2025-01-11

- Created comprehensive RLS policy documentation
- Documented all current policies and helper functions
- Identified discrepancies between desired and current state
- Added role renaming: `organizer` → `organizer_owner`
- Documented visibility logic and security considerations

---

## See Also

- `CLAUDE.md` - Project overview and architecture
- `supabase/migrations/` - Database migration files
- `supabase/seed.sql` - Reference data seeding
- `supabase/seed-users.ts` - Test user seeding
