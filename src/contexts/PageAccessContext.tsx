import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageAccessRule, CONFIGURABLE_PAGES } from "@/types/pageAccess";
import { UserRole } from "@/pages/DashboardPage";
import { toast } from "sonner";

interface PageAccessContextType {
  accessRules: PageAccessRule[];
  isLoading: boolean;
  hasAccess: (path: string, role: UserRole) => boolean;
  refreshRules: () => Promise<void>;
  updateRule: (ruleId: string, updates: Partial<PageAccessRule>) => Promise<void>;
  createDefaultRulesIfNeeded: () => Promise<void>;
}

const PageAccessContext = createContext<PageAccessContextType | undefined>(undefined);

export function PageAccessProvider({ children }: { children: ReactNode }) {
  const [accessRules, setAccessRules] = useState<PageAccessRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
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

      setAccessRules(typedRules);
    } catch (error) {
      console.error('Error fetching page access rules:', error);
      toast.error('Failed to load page access settings');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      toast.success('Page access rule updated successfully');
    } catch (error) {
      console.error('Error updating page access rule:', error);
      toast.error('Failed to update page access settings');
      throw error;
    }
  };

  const hasAccess = (path: string, role: UserRole): boolean => {
    if (role === 'admin') return true;
    
    if (isLoading) return true;
    
    const rule = accessRules.find(r => r.page_path === path);
    
    if (!rule || !rule.is_enabled) return false;
    
    return rule.allowed_roles.includes(role);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <PageAccessContext.Provider value={{
      accessRules,
      isLoading,
      hasAccess,
      refreshRules: fetchRules,
      updateRule,
      createDefaultRulesIfNeeded
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
