
/**
 * Utility functions for managing database schema selection
 */

// Schema options
export type SchemaType = 'public' | 'dev';

const SCHEMA_KEY = 'current_schema';

/**
 * Get the currently selected schema, default to 'public'
 */
export const getCurrentSchema = (): SchemaType => {
  if (typeof window === 'undefined') {
    return 'public';
  }
  const savedSchema = localStorage.getItem(SCHEMA_KEY);
  return (savedSchema as SchemaType) || 'public';
};

/**
 * Set the active schema
 */
export const setCurrentSchema = (schema: SchemaType): void => {
  localStorage.setItem(SCHEMA_KEY, schema);
  // Force reload to apply schema change across the app
  window.location.reload();
};

/**
 * Check if user is allowed to switch schemas (admin only)
 */
export const canSwitchSchema = (role: string | undefined): boolean => {
  return role === 'admin';
};
