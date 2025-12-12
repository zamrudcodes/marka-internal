// Feature-based access control utilities

export type UserRole = 'admin' | 'manager' | 'sales' | 'operations' | 'viewer';

export type Resource =
  | 'employees'
  | 'departments'
  | 'projects'
  | 'bonus_periods'
  | 'payroll'
  | 'project_charters'
  | 'users';

export type Permission = 'view' | 'create' | 'edit' | 'delete';

// Feature keys that map to application routes
export type FeatureKey =
  | 'dashboard'
  | 'employees'
  | 'departments'
  | 'projects'
  | 'projects.heatmap'
  | 'project_charters'
  | 'bonus_periods'
  | 'payroll'
  | 'ads_performance'
  | 'users'
  | 'commercial'
  | 'commercial.new_intake';

// Role hierarchy for quick checks
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  manager: 4,
  operations: 3,
  sales: 2,
  viewer: 1,
};

// Map routes to feature keys
export const ROUTE_TO_FEATURE: Record<string, FeatureKey> = {
  '/dashboard': 'dashboard',
  '/employees': 'employees',
  '/departments': 'departments',
  '/projects': 'projects',
  '/projects/heatmap': 'projects.heatmap',
  '/project-charters': 'project_charters',
  '/bonus-periods': 'bonus_periods',
  '/payroll': 'payroll',
  '/ads-performance': 'ads_performance',
  '/users': 'users',
  '/commercial': 'commercial',
  '/commercial/new-project-intake': 'commercial.new_intake',
};

// Default features per role (used as presets when assigning features)
export const ROLE_DEFAULT_FEATURES: Record<UserRole, FeatureKey[]> = {
  admin: [
    'dashboard',
    'employees',
    'departments',
    'projects',
    'projects.heatmap',
    'project_charters',
    'bonus_periods',
    'payroll',
    'ads_performance',
    'ads_performance',
    'users',
    'commercial',
    'commercial.new_intake',
  ],
  manager: [
    'dashboard',
    'employees',
    'departments',
    'projects',
    'projects.heatmap',
    'project_charters',
    'bonus_periods',
    'payroll',
    'commercial',
    'commercial.new_intake',
  ],
  operations: [
    'dashboard',
    'employees',
    'departments',
    'projects',
    'projects.heatmap',
    'project_charters',
    'commercial',
    'commercial.new_intake',
  ],
  sales: [
    'dashboard',
    'employees',
    'departments',
    'projects',
    'projects.heatmap',
    'project_charters',
    'commercial',
    'commercial.new_intake',
  ],
  viewer: [
    'dashboard',
    'employees',
    'departments',
    'projects',
    'projects.heatmap',
    'project_charters',
    'bonus_periods',
    'payroll',
  ],
};

// Get feature key from route path
export function getFeatureKeyFromRoute(route: string): FeatureKey | null {
  // Try exact match first
  if (route in ROUTE_TO_FEATURE) {
    return ROUTE_TO_FEATURE[route];
  }

  // Try to find parent route (e.g., /projects/123 -> /projects)
  const segments = route.split('/').filter(Boolean);
  for (let i = segments.length; i > 0; i--) {
    const testRoute = '/' + segments.slice(0, i).join('/');
    if (testRoute in ROUTE_TO_FEATURE) {
      return ROUTE_TO_FEATURE[testRoute];
    }
  }

  return null;
}

// Check if user has access to a route based on their enabled features
export function canAccessRoute(userFeatures: FeatureKey[], route: string): boolean {
  const featureKey = getFeatureKeyFromRoute(route);
  if (!featureKey) return false;

  // Check if user has this feature enabled
  if (userFeatures.includes(featureKey)) {
    return true;
  }

  // Check if it's a sub-feature and user has parent feature
  // e.g., projects.heatmap requires projects
  if (featureKey.includes('.')) {
    const parentKey = featureKey.split('.')[0] as FeatureKey;
    return userFeatures.includes(parentKey);
  }

  return false;
}

// Check if user has a specific feature enabled
export function hasFeature(userFeatures: FeatureKey[], feature: FeatureKey): boolean {
  return userFeatures.includes(feature);
}

// Check if a role has higher or equal privilege than another
export function hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Get user-friendly role name
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    sales: 'Sales',
    operations: 'Operations',
    viewer: 'Viewer',
  };
  return names[role];
}

// Get role badge color
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    sales: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    operations: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[role];
}