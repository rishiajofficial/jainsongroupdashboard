
/**
 * Utility functions for managing database schema selection
 */

// Schema options
export type SchemaType = 'public' | 'dev' | 'dev2';

const SCHEMA_KEY = 'current_schema';
const USER_AUTH_KEY = 'supabase.auth.token'; // This is where Supabase stores the auth token

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
  // Store the current schema
  localStorage.setItem(SCHEMA_KEY, schema);
  
  // Store the current URL to return to after reload
  const currentPath = window.location.pathname;
  localStorage.setItem('schema_switch_return_path', currentPath);
  
  // Force reload to apply schema change across the app
  window.location.reload();
};

/**
 * Check if user is allowed to switch schemas (admin only)
 */
export const canSwitchSchema = (role: string | undefined): boolean => {
  return role === 'admin';
};
