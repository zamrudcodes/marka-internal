# Feature Access Control System

## Overview

The Marka Internal application now implements a granular, feature-based access control system that allows administrators to precisely control which features each user can access. This replaces the previous role-only based system with a more flexible approach.

## Key Features

### 1. **Granular Feature Control**
- Administrators can enable/disable specific features for individual users
- Features are organized hierarchically (parent features and sub-features)
- Sub-features automatically require their parent feature to be enabled

### 2. **Role Presets**
- Quick-apply role templates (Admin, Manager, Operations, Sales, Viewer)
- Presets populate default features but can be customized per user
- Roles serve as starting points, not rigid constraints

### 3. **Security Enforcement**
- **Middleware Level**: Blocks unauthorized route access at the server level
- **UI Level**: Hides navigation items for disabled features
- **Database Level**: Row Level Security (RLS) policies protect data access

### 4. **URL Protection**
- Users cannot access disabled features by typing URLs directly
- Attempts to access restricted pages redirect to dashboard
- All routes are validated against user's enabled features

## Architecture

### Database Schema

#### `features` Table
Stores all available features in the application:
- `key`: Unique identifier (e.g., 'dashboard', 'projects.heatmap')
- `name`: Display name for UI
- `description`: Optional description
- `parent_key`: For hierarchical features (sub-pages)

#### `user_feature_access` Table
Maps users to their enabled features:
- `user_id`: Reference to auth.users
- `feature_key`: Reference to features
- `is_enabled`: Boolean flag

### Available Features

| Feature Key | Name | Parent | Description |
|------------|------|--------|-------------|
| `dashboard` | Dashboard | - | Main dashboard |
| `employees` | Employees | - | Employee management |
| `departments` | Departments | - | Department management |
| `projects` | Projects | - | Project management |
| `projects.heatmap` | Project Health Heatmap | projects | Visual project health |
| `project_charters` | Project Charters | - | Charter management |
| `bonus_periods` | Bonus Periods | - | Bonus calculations |
| `payroll` | Payroll | - | Payroll processing |
| `ads_performance` | Ads Performance | - | Ad tracking |
| `users` | User Management | - | User administration |

## Admin Interface

### Managing User Access

1. **Navigate to User Management** (`/users`)
2. **Click "Manage Access"** on any user row
3. **Use Role Presets** (optional) to quick-fill features
4. **Toggle Individual Features** using checkboxes
5. **Save Changes** to apply new permissions

### Role Presets

**Admin** (Full Access):
- All features enabled

**Manager**:
- Dashboard, Employees, Departments, Projects, Project Charters, Bonus Periods, Payroll

**Operations**:
- Dashboard, Employees, Departments, Projects, Project Charters

**Sales**:
- Dashboard, Employees, Departments, Projects, Project Charters

**Viewer** (Read-Only):
- Dashboard, Employees, Departments, Projects, Project Charters, Bonus Periods, Payroll

## Security Implementation

### 1. Middleware Protection
```typescript
// src/middleware.ts
// Fetches user's enabled features and validates route access
// Redirects unauthorized users to dashboard
```

### 2. Sidebar Filtering
```typescript
// src/components/app-sidebar.tsx
// Dynamically filters navigation based on enabled features
// Sub-items are hidden if parent feature is disabled
```

### 3. Database Functions
```sql
-- get_user_enabled_features(user_id)
-- Returns list of enabled feature keys for a user

-- user_has_feature_access(user_id, feature_key)
-- Checks if user has access to a specific feature

-- update_user_features(user_id, feature_keys[])
-- Bulk updates user's feature access
```

## Migration Guide

### Applying the Migration

1. **Run the migration**:
   ```bash
   # Apply to your Supabase project
   supabase db push
   ```

2. **Verify backfill**:
   - Existing users will have features assigned based on their current role
   - Check `user_feature_access` table to confirm

3. **Test access**:
   - Log in as different users
   - Verify navigation items appear correctly
   - Test URL access protection

### Rollback (if needed)

If you need to revert to role-based access:
1. Restore previous versions of:
   - `src/lib/auth/permissions.ts`
   - `src/middleware.ts`
   - `src/components/app-sidebar.tsx`
2. Keep the database tables for future use

## Best Practices

### For Administrators

1. **Use Role Presets First**: Start with a preset, then customize
2. **Test Access**: Log in as the user to verify their access
3. **Document Changes**: Keep notes on custom access configurations
4. **Regular Audits**: Periodically review user access levels

### For Developers

1. **Add New Features**: Update `features` table when adding new pages
2. **Map Routes**: Add route-to-feature mappings in `ROUTE_TO_FEATURE`
3. **Check Access**: Use `canAccessRoute()` for conditional rendering
4. **Test Security**: Verify middleware blocks unauthorized access

## Adding New Features

### 1. Database
```sql
INSERT INTO features (key, name, description, parent_key) VALUES
  ('new_feature', 'New Feature', 'Description', NULL);
```

### 2. TypeScript Types
```typescript
// src/lib/auth/permissions.ts
export type FeatureKey = 
  | 'dashboard'
  | 'new_feature'  // Add here
  | ...
```

### 3. Route Mapping
```typescript
// src/lib/auth/permissions.ts
export const ROUTE_TO_FEATURE: Record<string, FeatureKey> = {
  '/new-feature': 'new_feature',  // Add here
  ...
};
```

### 4. Navigation
```typescript
// src/components/app-sidebar.tsx
const allNavItems: NavItem[] = [
  {
    title: "New Feature",
    url: "/new-feature",
    icon: IconName,
  },
  ...
];
```

## Troubleshooting

### User Can't Access a Feature

1. **Check feature assignment**: Verify in User Management dialog
2. **Check parent features**: Ensure parent feature is enabled for sub-features
3. **Check user status**: Ensure user account is active
4. **Clear cache**: Have user log out and back in

### Navigation Item Not Showing

1. **Verify feature key**: Check `ROUTE_TO_FEATURE` mapping
2. **Check sidebar filter**: Ensure `canAccessRoute()` logic is correct
3. **Inspect user features**: Log `userData.features` in layout

### URL Access Not Blocked

1. **Check middleware**: Verify middleware is running
2. **Check route mapping**: Ensure route has a feature key
3. **Test in incognito**: Rule out caching issues

## API Reference

### Server Actions

```typescript
// Get user's enabled features
getUserFeatures(userId: string): Promise<FeatureKey[]>

// Get all available features
getAllFeatures(): Promise<Feature[]>

// Update user's feature access
updateUserFeatures(userId: string, features: FeatureKey[]): Promise<Result>

// Get user with their features
getUserWithFeatures(userId: string): Promise<UserWithFeatures>
```

### Helper Functions

```typescript
// Check if user can access a route
canAccessRoute(userFeatures: FeatureKey[], route: string): boolean

// Get feature key from route path
getFeatureKeyFromRoute(route: string): FeatureKey | null

// Check if user has a specific feature
hasFeature(userFeatures: FeatureKey[], feature: FeatureKey): boolean
```

## Performance Considerations

- **Caching**: User features are fetched once per page load in layout
- **Middleware**: Feature checks happen on every route navigation
- **Database**: Indexed queries for fast feature lookups
- **RLS**: Policies ensure data security without performance impact

## Future Enhancements

Potential improvements for the system:

1. **Time-based Access**: Features enabled only during specific hours/dates
2. **Feature Usage Analytics**: Track which features are most used
3. **Bulk User Management**: Apply features to multiple users at once
4. **Feature Groups**: Create custom feature bundles
5. **Audit Logging**: Track all permission changes with timestamps
6. **Self-Service Requests**: Users can request access to features

## Support

For questions or issues with the feature access control system:
1. Check this documentation first
2. Review the implementation in the codebase
3. Contact the development team