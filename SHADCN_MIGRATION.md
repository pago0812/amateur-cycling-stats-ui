# shadcn-svelte Component Migration Roadmap

This document tracks the migration of custom UI components to shadcn-svelte components.

**Last Updated:** 2025-11-17
**Status:** Phase 1 Complete ✅

---

## ✅ Phase 1: Completed (2025-11-17)

### Button Component Migration

**Status:** ✅ Complete
**Files Modified:** 14 files
**Components Installed:** `button`

#### What Was Done:
- ✅ Installed shadcn-svelte `button` component
- ✅ Replaced all instances of custom `Button.svelte` with shadcn Button
- ✅ Updated 6 components: Header, MenuToolbar, ConfirmModal
- ✅ Updated 8 pages across admin/auth routes
- ✅ Deleted old `src/lib/components/Button.svelte`
- ✅ Fixed MenuToolbar to use dynamic variants instead of hardcoded `outline`

#### Variant Mapping Applied:
| Old Props | New Props |
|-----------|-----------|
| `variant="filled" color="primary"` | `variant="default"` |
| `variant="filled" color="secondary"` | `variant="secondary"` |
| `variant="filled" color="danger"` | `variant="destructive"` |
| `variant="outlined"` | `variant="outline"` |
| `variant="text"` | `variant="ghost"` |
| `size="md"` | `size="default"` (or omit) |
| `fullWidth` | `class="w-full"` |
| `ariaLabel` | `aria-label` |
| `ariaExpanded` | `aria-expanded` |

---

## 🔄 Phase 2: Medium Priority (Pending)

### 1. GlobalAlert → Toast/Sonner Component

**Status:** ⏳ Pending
**Priority:** Medium
**Effort:** Medium
**Impact:** Better UX, modern notification system

#### Current Implementation:
- **File:** `src/lib/components/GlobalAlert.svelte`
- **Pattern:** Fixed top-center alerts with auto-dismiss
- **Store:** `src/lib/stores/alert-store.ts`
- **Features:**
  - 4 types: success, warning, info, error
  - Auto-close after 5 seconds
  - Manual close button
  - Type-specific icons

#### Migration Plan:
1. **Install shadcn-svelte toast component:**
   ```bash
   npx shadcn-svelte@latest add toast
   # OR
   npx shadcn-svelte@latest add sonner  # Alternative: Better animations
   ```

2. **Refactor alert store** (`src/lib/stores/alert-store.ts`):
   - Update to work with toast API
   - Keep the same public interface: `alertStore.openAlert(message, type)`
   - Internally call toast functions

3. **Update root layout** (`src/routes/+layout.svelte`):
   - Remove `<GlobalAlert />` component
   - Add `<Toaster />` component from shadcn-svelte

4. **Test all alert usages:**
   - Login/signup error messages
   - Admin action confirmations
   - Form submission feedback
   - Organization invitation flows

#### Files to Update:
- `src/lib/stores/alert-store.ts` (refactor)
- `src/routes/+layout.svelte` (replace GlobalAlert with Toaster)
- `src/lib/components/GlobalAlert.svelte` (delete after migration)

#### Benefits:
- ✅ Better animations and transitions
- ✅ Stack multiple toasts
- ✅ Better mobile experience
- ✅ Portal-based rendering
- ✅ Standard shadcn ecosystem pattern

---

### 2. SelectQueryParam → Select Component

**Status:** ⏳ Pending
**Priority:** Medium
**Effort:** Medium
**Impact:** Enhanced UX, consistent design

#### Current Implementation:
- **File:** `src/lib/components/SelectQueryParam.svelte`
- **Pattern:** Native `<select>` with URL query parameter binding
- **Used in:** Results page, race filters

#### Migration Plan:
1. **Install shadcn-svelte select component:**
   ```bash
   npx shadcn-svelte@latest add select
   ```

2. **Create enhanced SelectQueryParam wrapper:**
   - Keep the same props interface for backward compatibility
   - Use shadcn Select internally
   - Maintain URL sync functionality
   - Preserve current behavior

3. **Alternative: Keep native select:**
   - shadcn Select uses popover (more complex)
   - Native select has better mobile UX
   - Consider keeping for mobile, using shadcn for desktop
   - **Decision needed:** Discuss with team

#### Files to Update:
- `src/lib/components/SelectQueryParam.svelte` (refactor or keep native)

#### Considerations:
- Native `<select>` works better on mobile
- shadcn Select provides richer desktop experience
- May want responsive implementation (native on mobile, shadcn on desktop)

---

### 3. RaceFilterSelect → Select Components

**Status:** ⏳ Pending
**Priority:** Low
**Effort:** Low
**Impact:** Visual consistency (optional enhancement)

#### Current Implementation:
- **File:** `src/lib/components/RaceFilterSelect.svelte`
- **Pattern:** 3 native `<select>` dropdowns (Category, Gender, Distance)
- **Used in:** Race results filtering

#### Migration Plan:
1. Use shadcn Select components installed in Phase 2.2
2. Replace native selects with shadcn Select
3. Maintain dual-mode navigation logic
4. Test filter state management

#### Files to Update:
- `src/lib/components/RaceFilterSelect.svelte`

#### Note:
This is an **optional enhancement**. Current native selects work well. Only migrate if you want visual consistency with other selects.

---

### 4. MenuToolbar Enhancement

**Status:** ⏳ Pending
**Priority:** Low
**Effort:** Medium
**Impact:** Component consistency

#### Current Implementation:
- **File:** `src/lib/components/MenuToolbar.svelte`
- **Pattern:** Custom breadcrumbs + tabs + action buttons
- **Status:** Partially migrated (uses shadcn Button now)

#### Migration Plan:
1. **Install shadcn breadcrumb component:**
   ```bash
   npx shadcn-svelte@latest add breadcrumb
   ```

2. **Install shadcn tabs component:**
   ```bash
   npx shadcn-svelte@latest add tabs
   ```

3. **Refactor MenuToolbar:**
   - Replace custom breadcrumb HTML with shadcn Breadcrumb
   - Replace custom tabs HTML with shadcn Tabs
   - Keep action buttons (already using shadcn Button)

#### Files to Update:
- `src/lib/components/MenuToolbar.svelte`

#### Considerations:
- Current implementation works well
- shadcn Tabs has different API (may require adaptation)
- Test tab active state detection
- Ensure breadcrumb separator styling matches design

---

## 🚀 Phase 3: Optional Enhancements (Future)

### Form Components Enhancement

**Status:** ⏳ Pending
**Priority:** Low
**Effort:** High
**Impact:** Consistent form styling

#### Potential Additions:
1. **Input Component**
   - Replace native inputs in login/signup forms
   - `npx shadcn-svelte@latest add input`

2. **Label Component**
   - Consistent label styling
   - `npx shadcn-svelte@latest add label`

3. **Form Component**
   - Form validation wrapper
   - `npx shadcn-svelte@latest add form`

4. **Textarea Component**
   - For organization descriptions
   - `npx shadcn-svelte@latest add textarea`

#### Forms to Consider:
- Login form (`src/routes/login/+page.svelte`)
- Signup form (`src/routes/signin/+page.svelte`)
- Organization form (`src/lib/components/OrganizationForm.svelte`)

#### Note:
This is a **large effort** with **minimal functional benefit**. Current forms work well. Only consider if you want complete design system consistency.

---

## 📋 Migration Checklist Template

Use this checklist when migrating each component:

```markdown
### Component: [Name]

- [ ] Install shadcn-svelte component(s)
- [ ] Create new component or update existing
- [ ] Find all usage locations
- [ ] Update imports in all files
- [ ] Test all variants/props
- [ ] Verify TypeScript types
- [ ] Run type checking: `npm run check`
- [ ] Test in development: `npm run dev`
- [ ] Delete old component (if fully replaced)
- [ ] Update this document
- [ ] Commit changes
```

---

## 🎨 Theme Customization

### Current Theme:
- **Base Color:** Slate
- **Location:** `src/app.css`
- **Theme System:** CSS custom properties (supports dark mode)

### Customization Tools:
- **shadcn-svelte Themes:** https://www.shadcn-svelte.com/themes
- **shadcn/ui Themes:** https://ui.shadcn.com/themes
- **UI Colors Generator:** https://uicolors.app/create

### How to Update Theme:
1. Visit https://www.shadcn-svelte.com/themes
2. Choose or customize colors
3. Copy generated CSS
4. Replace `:root` and `.dark` sections in `src/app.css`

---

## 📊 Migration Progress

| Phase | Component | Status | Priority | Files Affected |
|-------|-----------|--------|----------|----------------|
| 1 | Button | ✅ Complete | High | 14 |
| 2 | GlobalAlert → Toast | ⏳ Pending | Medium | 3 |
| 2 | SelectQueryParam → Select | ⏳ Pending | Medium | 1 |
| 2 | RaceFilterSelect → Select | ⏳ Pending | Low | 1 |
| 2 | MenuToolbar → Breadcrumb + Tabs | ⏳ Pending | Low | 1 |
| 3 | Form Components | ⏳ Pending | Low | 5+ |

**Overall Progress:** 1/6 phases complete (Phase 1)

---

## 🚫 Components NOT to Migrate

These components are **domain-specific** and should remain custom:

### Domain Tables:
- ❌ `EventResultsTable.svelte` - Event-specific layout
- ❌ `ResultsTable.svelte` - Race results format
- ❌ `CyclistResultsTable.svelte` - Cyclist history display
- ❌ `OrganizationsTable.svelte` - Admin table with state badges
- ❌ `MembersTable.svelte` - Organization members table

### Profile Components:
- ❌ `CyclistProfile.svelte` - Cyclist entity display
- ❌ `OrganizationProfile.svelte` - Organization entity display

### Navigation:
- ❌ `Header.svelte` - Site-specific navigation and auth logic

### Forms:
- ❌ `OrganizationForm.svelte` - Domain-specific form logic

**Reason:** These components contain business logic and domain-specific layouts that don't benefit from shadcn migration. They may *use* shadcn components internally (like Button), but the overall component structure should remain custom.

---

## 💡 Tips & Best Practices

### When Migrating Components:

1. **Always read files before editing:**
   - Use Read tool to check current implementation
   - Understand all props and features before replacing

2. **Test thoroughly:**
   - Run `npm run check` for type errors
   - Test in development server
   - Verify all variants and states
   - Check mobile responsiveness

3. **Maintain backward compatibility:**
   - Keep existing prop interfaces when possible
   - Add new props, don't break old ones
   - Update TypeScript types

4. **Update documentation:**
   - Mark tasks complete in this file
   - Update CLAUDE.md if needed
   - Document any breaking changes

5. **Commit atomically:**
   - One component migration per commit
   - Clear commit messages
   - Reference this document in commits

### shadcn-svelte Commands:

```bash
# Install a specific component
npx shadcn-svelte@latest add [component-name]

# Install multiple components at once
npx shadcn-svelte@latest add button dialog alert

# Browse available components
# Visit: https://www.shadcn-svelte.com/docs/components

# Update components (when shadcn-svelte releases updates)
npx shadcn-svelte@latest add [component-name]  # Re-run to update
```

---

## 📚 References

- **shadcn-svelte Docs:** https://www.shadcn-svelte.com/docs
- **Component Library:** https://www.shadcn-svelte.com/docs/components
- **Theme Customization:** https://www.shadcn-svelte.com/themes
- **GitHub Repository:** https://github.com/huntabyte/shadcn-svelte
- **Svelte 5 Runes Docs:** https://svelte.dev/docs/svelte/what-are-runes

---

## 🎯 Next Steps

To continue the migration:

1. **Choose a component** from Phase 2
2. **Follow the migration plan** outlined above
3. **Use the checklist template** to track progress
4. **Test thoroughly** before moving to the next component
5. **Update this document** when complete

**Recommended Next Migration:** GlobalAlert → Toast (High impact, clear improvement)

---

**Document Maintained By:** Development Team
**Questions?** Refer to shadcn-svelte documentation or CLAUDE.md project instructions.
