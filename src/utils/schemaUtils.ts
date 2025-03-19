
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

/**
 * Force reset to public schema
 * This can be used as an emergency escape hatch when stuck in a broken schema state
 */
export const forceResetToPublicSchema = (): void => {
  localStorage.setItem(SCHEMA_KEY, 'public');
  
  // Clear any schema switch related data
  localStorage.removeItem('schema_switch_return_path');
  localStorage.removeItem('schema_switch_user_id');
  localStorage.removeItem('schema_switch_user_role');
  
  console.log("Forcing reset to public schema. The page will reload.");
  window.location.href = "/dashboard"; // Force redirect to dashboard
};

/**
 * Add a small reset button to the page footer
 * This is an emergency mechanism to get back to public schema
 */
export const addSchemaResetButton = (): void => {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Check if reset button is already added
  if (document.getElementById('schema-reset-button')) return;
  
  // Create reset button
  const resetButton = document.createElement('button');
  resetButton.id = 'schema-reset-button';
  resetButton.innerText = 'Reset Schema';
  resetButton.style.position = 'fixed';
  resetButton.style.bottom = '5px';
  resetButton.style.right = '5px';
  resetButton.style.zIndex = '9999';
  resetButton.style.padding = '3px 5px';
  resetButton.style.fontSize = '10px';
  resetButton.style.backgroundColor = 'transparent';
  resetButton.style.color = '#666';
  resetButton.style.border = '1px solid #ddd';
  resetButton.style.borderRadius = '3px';
  resetButton.style.cursor = 'pointer';
  resetButton.style.opacity = '0.7';
  
  // Add click handler
  resetButton.addEventListener('click', () => {
    if (confirm('Reset to public schema? This will clear schema-related data.')) {
      forceResetToPublicSchema();
    }
  });
  
  // Add to body
  document.body.appendChild(resetButton);
};
