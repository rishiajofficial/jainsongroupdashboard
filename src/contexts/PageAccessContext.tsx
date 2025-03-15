
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageAccessRule, CONFIGURABLE_PAGES } from "@/types/pageAccess";
import { UserRole } from "@/pages/DashboardPage";
import { toast } from "sonner";

interface PageAccessContextType {
  accessRules: PageAccessRule[];
  isLoading: boolean;
  isPageVisible: (path: string, role: UserRole) => boolean;
  refreshRules: () => Promise<void>;
  updateRule: (ruleId: string, updates: Partial<PageAccessRule>) => Promise<void>;
  createDefaultRulesIfNeeded: () => Promise<void>;
  bulkUpdateRolesAccess: (role: UserRole, enabled: boolean) => Promise<void>;
}

const PageAccessContext = createContext<PageAccessContextType | undefined>(undefined);

export function PageAccessProvider({ children }: { children: ReactNode }) {
  const [accessRules, setAccessRules] = useState<PageAccessRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching page access rules...");
      
      const { data, error } = await supabase
        .from('page_access_rules')
        .select('*');

      if (error) {
        throw error;
      }

      const typedRules = data?.map(rule => ({
        ...rule,
        allowed_roles: rule.allowed_roles as UserRole[]
      })) || [];

      console.log("Fetched rules:", typedRules.length);
      setAccessRules(typedRules);
    } catch (error) {
      console.error('Error fetching page access rules:', error);
      toast.error('Failed to load page access settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDefaultRulesIfNeeded = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('page_access_rules')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      if (count === 0) {
        const defaultRules = CONFIGURABLE_PAGES.map(page => ({
          page_path: page.path,
          page_name: page.name,
          allowed_roles: page.defaultRoles,
          is_enabled: true
        }));

        const { error: insertError } = await supabase
          .from('page_access_rules')
          .insert(defaultRules);

        if (insertError) {
          throw insertError;
        }

        await fetchRules();
      }
    } catch (error) {
      console.error('Error creating default page access rules:', error);
      toast.error('Failed to initialize page access settings');
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<PageAccessRule>) => {
    try {
      // If we're updating allowed_roles and it's empty, don't block the update
      // This allows removing access from all roles
      const { error } = await supabase
        .from('page_access_rules')
        .update(updates)
        .eq('id', ruleId);

      if (error) {
        throw error;
      }

      setAccessRules(accessRules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ));
      
      // Provide more specific toast messages based on what was updated
      if (updates.is_enabled !== undefined) {
        const rule = accessRules.find(r => r.id === ruleId);
        const action = updates.is_enabled ? 'enabled' : 'disabled';
        toast.success(`${rule?.page_name} page ${action}. Navigation will be updated.`);
      } else if (updates.allowed_roles !== undefined) {
        const rule = accessRules.find(r => r.id === ruleId);
        const roleChanges = updates.allowed_roles.length > 0 
          ? `Updated roles with access to ${rule?.page_name}` 
          : `Removed all role access from ${rule?.page_name}`;
        toast.success(roleChanges);
      } else {
        toast.success('Page access rule updated successfully');
      }
    } catch (error) {
      console.error('Error updating page access rule:', error);
      toast.error('Failed to update page access settings');
      throw error;
    }
  };

  const bulkUpdateRolesAccess = async (role: UserRole, enabled: boolean) => {
    try {
      const rulesToUpdate = accessRules.filter(rule => 
        CONFIGURABLE_PAGES.find(page => page.path === rule.page_path && page.defaultRoles.includes(role))
      );
      
      const updates = rulesToUpdate.map(rule => {
        const hasRole = rule.allowed_roles.includes(role);
        const newAllowedRoles = enabled
          ? hasRole ? rule.allowed_roles : [...rule.allowed_roles, role]
          : rule.allowed_roles.filter(r => r !== role);
        
        return {
          id: rule.id,
          allowed_roles: newAllowedRoles
        };
      });
      
      // Process updates in batches to avoid timeouts
      const batchSize = 10;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        for (const update of batch) {
          await supabase
            .from('page_access_rules')
            .update({ allowed_roles: update.allowed_roles })
            .eq('id', update.id);
        }
      }
      
      await fetchRules();
      toast.success(`${enabled ? 'Enabled' : 'Disabled'} all pages for ${role} role. Navigation will update accordingly.`);
    } catch (error) {
      console.error('Error bulk updating access rules:', error);
      toast.error('Failed to update multiple page access settings');
    }
  };

  const isPageVisible = useCallback((path: string, role: UserRole): boolean => {
    // Admin always has access to all pages
    if (role === 'admin') return true;
    
    if (isLoading) return true;
    
    // Some paths should always be accessible
    if (path === '/dashboard' || path === '/profile' || path === '/settings') {
      return true;
    }
    
    const rule = accessRules.find(r => r.page_path === path);
    
    // If no rule exists or the page is disabled, it's not visible
    if (!rule || !rule.is_enabled) return false;
    
    // Check if the user's role is in the allowed roles
    return rule.allowed_roles.includes(role);
  }, [accessRules, isLoading]);

  // Initial fetch of rules
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return (
    <PageAccessContext.Provider value={{
      accessRules,
      isLoading,
      isPageVisible,
      refreshRules: fetchRules,
      updateRule,
      createDefaultRulesIfNeeded,
      bulkUpdateRolesAccess
    }}>
      {children}
    </PageAccessContext.Provider>
  );
}

export function usePageAccess() {
  const context = useContext(PageAccessContext);
  if (context === undefined) {
    throw new Error('usePageAccess must be used within a PageAccessProvider');
  }
  return context;
}
