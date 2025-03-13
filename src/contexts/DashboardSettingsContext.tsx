
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/pages/DashboardPage";

interface DashboardWidgetSettings {
  id?: string;
  widget_key: string;
  widget_name: string;
  is_visible: boolean;
  allowed_roles: UserRole[];
  description: string;
  widget_type: 'stats' | 'actions' | 'info';
  order: number;
}

interface DashboardSettingsContextType {
  widgetSettings: DashboardWidgetSettings[];
  isLoading: boolean;
  isWidgetVisible: (widgetKey: string, role: UserRole) => boolean;
  refreshSettings: () => Promise<void>;
  updateWidgetSetting: (settingId: string, updates: Partial<DashboardWidgetSettings>) => Promise<void>;
  createDefaultSettingsIfNeeded: () => Promise<void>;
  getWidgetsByRole: (role: UserRole) => DashboardWidgetSettings[];
  toggleWidgetForRole: (widgetKey: string, role: UserRole, enabled: boolean) => Promise<void>;
}

// Define default dashboard widgets
export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetSettings[] = [
  // Stats widgets
  {
    widget_key: 'jobs_overview',
    widget_name: 'Jobs Overview',
    is_visible: true,
    allowed_roles: ['admin', 'manager', 'candidate'],
    description: 'Shows statistics about job postings and applications',
    widget_type: 'stats',
    order: 10,
  },
  {
    widget_key: 'applications_stats',
    widget_name: 'Applications Statistics',
    is_visible: true,
    allowed_roles: ['admin', 'manager', 'candidate'],
    description: 'Displays application counts and status breakdowns',
    widget_type: 'stats',
    order: 20,
  },
  {
    widget_key: 'assessment_stats',
    widget_name: 'Assessment Metrics',
    is_visible: true,
    allowed_roles: ['admin', 'manager', 'candidate'],
    description: 'Shows assessment completion rates and scores',
    widget_type: 'stats',
    order: 30,
  },
  {
    widget_key: 'visits_stats',
    widget_name: 'Shop Visits Statistics',
    is_visible: true,
    allowed_roles: ['admin', 'manager', 'salesperson'],
    description: 'Displays shop visit counts and completion rates',
    widget_type: 'stats',
    order: 40,
  },
  {
    widget_key: 'training_stats',
    widget_name: 'Training Progress',
    is_visible: true,
    allowed_roles: ['admin', 'manager', 'salesperson'],
    description: 'Shows training video completion and quiz scores',
    widget_type: 'stats',
    order: 50,
  },
  
  // Action widgets
  {
    widget_key: 'quick_actions',
    widget_name: 'Quick Actions',
    is_visible: true,
    allowed_roles: ['admin', 'manager', 'candidate', 'salesperson'],
    description: 'Common actions for the user role',
    widget_type: 'actions',
    order: 60,
  },
  
  // Info widgets
  {
    widget_key: 'recent_activities',
    widget_name: 'Recent Activities',
    is_visible: true,
    allowed_roles: ['admin', 'manager'],
    description: 'Shows recent system activities relevant to the user',
    widget_type: 'info',
    order: 70,
  },
  {
    widget_key: 'pending_approvals',
    widget_name: 'Pending Approvals',
    is_visible: true,
    allowed_roles: ['admin', 'manager'],
    description: 'Displays items requiring approval',
    widget_type: 'info',
    order: 80,
  }
];

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export function DashboardSettingsProvider({ children }: { children: ReactNode }) {
  const [widgetSettings, setWidgetSettings] = useState<DashboardWidgetSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching dashboard widget settings...");
      
      const { data, error } = await supabase
        .from('dashboard_widget_settings')
        .select('*')
        .order('order_number', { ascending: true });

      if (error) {
        throw error;
      }

      const typedSettings: DashboardWidgetSettings[] = data?.map(setting => ({
        id: setting.id,
        widget_key: setting.widget_key,
        widget_name: setting.widget_name,
        is_visible: setting.is_visible,
        allowed_roles: setting.allowed_roles as UserRole[],
        description: setting.description || '',
        widget_type: setting.widget_type as 'stats' | 'actions' | 'info',
        order: setting.order_number
      })) || [];

      console.log("Fetched dashboard settings:", typedSettings.length);
      setWidgetSettings(typedSettings);
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      toast.error('Failed to load dashboard settings');
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultSettingsIfNeeded = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('dashboard_widget_settings')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      if (count === 0) {
        // Convert to database format
        const dbWidgets = DEFAULT_DASHBOARD_WIDGETS.map(widget => ({
          widget_key: widget.widget_key,
          widget_name: widget.widget_name,
          is_visible: widget.is_visible,
          allowed_roles: widget.allowed_roles,
          description: widget.description,
          widget_type: widget.widget_type,
          order_number: widget.order
        }));

        const { error: insertError } = await supabase
          .from('dashboard_widget_settings')
          .insert(dbWidgets);

        if (insertError) {
          throw insertError;
        }

        await fetchSettings();
        toast.success('Default dashboard settings initialized');
      }
    } catch (error) {
      console.error('Error creating default dashboard settings:', error);
      toast.error('Failed to initialize dashboard settings');
    }
  };

  const updateWidgetSetting = async (settingId: string, updates: Partial<DashboardWidgetSettings>) => {
    try {
      // Convert from our app model to the database model
      const dbUpdates: any = {};
      
      if (updates.widget_name !== undefined) dbUpdates.widget_name = updates.widget_name;
      if (updates.is_visible !== undefined) dbUpdates.is_visible = updates.is_visible;
      if (updates.allowed_roles !== undefined) dbUpdates.allowed_roles = updates.allowed_roles;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.widget_type !== undefined) dbUpdates.widget_type = updates.widget_type;
      if (updates.order !== undefined) dbUpdates.order_number = updates.order;

      const { error } = await supabase
        .from('dashboard_widget_settings')
        .update(dbUpdates)
        .eq('id', settingId);

      if (error) {
        throw error;
      }

      setWidgetSettings(settings => 
        settings.map(setting => 
          setting.id === settingId ? { ...setting, ...updates } : setting
        )
      );
      
      toast.success('Dashboard widget setting updated');
    } catch (error) {
      console.error('Error updating dashboard widget setting:', error);
      toast.error('Failed to update dashboard setting');
      throw error;
    }
  };

  const isWidgetVisible = (widgetKey: string, role: UserRole): boolean => {
    if (role === 'admin') return true;
    
    if (isLoading) return true;
    
    const setting = widgetSettings.find(s => s.widget_key === widgetKey);
    
    if (!setting || !setting.is_visible) return false;
    
    return setting.allowed_roles.includes(role);
  };

  const getWidgetsByRole = (role: UserRole): DashboardWidgetSettings[] => {
    if (role === 'admin') return widgetSettings;
    
    return widgetSettings.filter(widget => 
      widget.is_visible && widget.allowed_roles.includes(role)
    );
  };

  const toggleWidgetForRole = async (widgetKey: string, role: UserRole, enabled: boolean) => {
    try {
      const setting = widgetSettings.find(s => s.widget_key === widgetKey);
      
      if (!setting) {
        throw new Error(`Widget with key ${widgetKey} not found`);
      }
      
      const newAllowedRoles = enabled
        ? [...new Set([...setting.allowed_roles, role])]
        : setting.allowed_roles.filter(r => r !== role);
      
      await updateWidgetSetting(setting.id!, { allowed_roles: newAllowedRoles });
      
      toast.success(`Widget ${enabled ? 'enabled' : 'disabled'} for ${role} role`);
    } catch (error) {
      console.error('Error toggling widget for role:', error);
      toast.error('Failed to update widget settings');
    }
  };

  // Initial fetch of settings
  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <DashboardSettingsContext.Provider value={{
      widgetSettings,
      isLoading,
      isWidgetVisible,
      refreshSettings: fetchSettings,
      updateWidgetSetting,
      createDefaultSettingsIfNeeded,
      getWidgetsByRole,
      toggleWidgetForRole
    }}>
      {children}
    </DashboardSettingsContext.Provider>
  );
}

export function useDashboardSettings() {
  const context = useContext(DashboardSettingsContext);
  if (context === undefined) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
}
