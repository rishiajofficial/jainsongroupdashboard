
/**
 * Utility functions for managing database schema selection
 */

// Schema options
export type SchemaType = 'public' | 'dev' | 'dev2';

const SCHEMA_KEY = 'current_schema';

/**
 * Get the currently selected schema, default to 'public'
 */
export const getCurrentSchema = (): SchemaType => {
  if (typeof window === 'undefined') {
    return 'public';
  }
  
  try {
    const savedSchema = localStorage.getItem(SCHEMA_KEY);
    // Validate that the schema is a valid SchemaType
    if (savedSchema && ['public', 'dev', 'dev2'].includes(savedSchema)) {
      return savedSchema as SchemaType;
    }
    // If not valid, reset to public
    localStorage.setItem(SCHEMA_KEY, 'public');
    return 'public';
  } catch (error) {
    console.error("Error getting schema, defaulting to public:", error);
    return 'public';
  }
};

/**
 * Set the active schema
 */
export const setCurrentSchema = (schema: SchemaType): void => {
  // Don't do anything if we're already on this schema
  if (getCurrentSchema() === schema) {
    console.log(`Already on ${schema} schema, no change needed`);
    return;
  }
  
  try {
    // Store the current schema
    localStorage.setItem(SCHEMA_KEY, schema);
    
    // Store the current URL to return to after reload
    const currentPath = window.location.pathname;
    localStorage.setItem('schema_switch_return_path', currentPath);
    
    console.log(`Switching schema to ${schema}, current path stored: ${currentPath}`);
    
    // Force reload to apply schema change across the app
    window.location.reload();
  } catch (error) {
    console.error("Error setting schema:", error);
    alert(`Failed to switch to ${schema} schema. Please try again or use the reset button.`);
  }
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
  console.log("Forcing reset to public schema...");
  
  try {
    // Clear ALL schema related data
    localStorage.setItem(SCHEMA_KEY, 'public');
    
    // Clear any schema switch related data
    localStorage.removeItem('schema_switch_return_path');
    localStorage.removeItem('schema_switch_user_id');
    localStorage.removeItem('schema_switch_user_role');
    
    // Clear any Supabase session data to force a fresh login
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    // Add a flag to indicate we just performed a reset
    localStorage.setItem('schema_reset_performed', 'true');
    
    // Show success message to user
    import("sonner").then(({ toast }) => {
      toast.success("Successfully reset to public schema. Please log in again.", {
        duration: 5000,
      });
    }).catch(() => {
      alert("Successfully reset to public schema. Please log in again.");
    });
    
    console.log("Schema reset complete. Redirecting to login page...");
    
    // Short delay to allow toast to be seen
    setTimeout(() => {
      // Redirect to login page after clearing everything
      window.location.href = "/login";
    }, 1000);
  } catch (error) {
    console.error("Error during schema reset:", error);
    alert("Error during schema reset. Please try clearing your browser storage manually and reload the page.");
  }
};

/**
 * Add schema reset buttons to the page
 * This is an emergency mechanism to get back to public schema
 */
export const addSchemaResetButton = (): void => {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Check if reset button is already added
  if (document.getElementById('schema-reset-button')) return;
  
  // Get current schema to determine if emergency button is needed
  const currentSchema = getCurrentSchema();
  
  // Create reset button - small and subtle in footer
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
  resetButton.style.opacity = '0.5';
  
  // Add click handler
  resetButton.addEventListener('click', () => {
    if (confirm('Reset to public schema? This will clear schema-related data and log you out.')) {
      forceResetToPublicSchema();
    }
  });
  
  // Add to body
  document.body.appendChild(resetButton);
  
  // Only add emergency button if we're not on public schema
  if (currentSchema !== 'public') {
    // Create a more visible reset button for users who are stuck
    const emergencyButton = document.createElement('button');
    emergencyButton.id = 'emergency-reset-button';
    emergencyButton.innerText = 'Emergency: Reset to Public Schema';
    emergencyButton.style.position = 'fixed';
    emergencyButton.style.top = '10px';
    emergencyButton.style.right = '10px';
    emergencyButton.style.zIndex = '10000';
    emergencyButton.style.padding = '8px 12px';
    emergencyButton.style.fontSize = '12px';
    emergencyButton.style.backgroundColor = '#ff4b4b';
    emergencyButton.style.color = '#fff';
    emergencyButton.style.border = 'none';
    emergencyButton.style.borderRadius = '4px';
    emergencyButton.style.cursor = 'pointer';
    emergencyButton.style.fontWeight = 'bold';
    
    // Add click handler
    emergencyButton.addEventListener('click', () => {
      forceResetToPublicSchema();
    });
    
    // Add to body
    document.body.appendChild(emergencyButton);
  }
};

/**
 * Verify schema access by testing a simple query
 * Returns true if schema is accessible, false otherwise
 */
export const verifySchemaAccess = async (): Promise<boolean> => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Try a simple query - just fetch a single row from profiles with limit 1
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Schema access verification failed:", error);
      return false;
    }
    
    // If no error, schema is accessible
    return true;
  } catch (error) {
    console.error("Error during schema access verification:", error);
    return false;
  }
};

/**
 * Import toast for notifications
 */
import { toast } from "sonner";
