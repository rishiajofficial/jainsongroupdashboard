
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DEFAULT_DASHBOARD_WIDGETS = [
  {
    widget_key: 'jobs_overview',
    widget_name: 'Jobs Overview',
    widget_type: 'stats',
    allowed_roles: ['admin', 'manager'],
    is_visible: true,
    order_number: 1,
    description: 'Shows statistics about job listings and applications'
  },
  {
    widget_key: 'applications_stats',
    widget_name: 'Applications Statistics',
    widget_type: 'stats',
    allowed_roles: ['admin', 'manager', 'candidate'],
    is_visible: true,
    order_number: 2,
    description: 'Displays statistics about job applications'
  },
  {
    widget_key: 'recent_activities',
    widget_name: 'Recent Activities',
    widget_type: 'info',
    allowed_roles: ['admin', 'manager', 'salesperson', 'candidate'],
    is_visible: true,
    order_number: 3,
    description: 'Shows recent activities like profile updates, applications submitted'
  },
  {
    widget_key: 'quick_actions',
    widget_name: 'Quick Actions',
    widget_type: 'actions',
    allowed_roles: ['admin', 'manager', 'salesperson', 'candidate'],
    is_visible: true,
    order_number: 4,
    description: 'Provides quick access to common actions based on user role'
  },
  {
    widget_key: 'training_progress',
    widget_name: 'Training Progress',
    widget_type: 'info',
    allowed_roles: ['manager', 'salesperson'],
    is_visible: true,
    order_number: 5,
    description: 'Shows training progress and outstanding trainings'
  },
  {
    widget_key: 'sales_tracker',
    widget_name: 'Sales Visits Tracker',
    widget_type: 'stats',
    allowed_roles: ['manager', 'salesperson'],
    is_visible: true,
    order_number: 6,
    description: 'Displays statistics and information about sales visits'
  },
  {
    widget_key: 'pending_approvals',
    widget_name: 'Pending Approvals',
    widget_type: 'actions',
    allowed_roles: ['admin'],
    is_visible: true,
    order_number: 7,
    description: 'Shows pending manager approval requests'
  }
];

interface DashboardSettingsContextType {
  widgetSettings: any[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  isWidgetVisible: (widgetKey: string, userRole: string) => boolean;
  updateWidgetSetting: (id: string, updates: any) => Promise<void>;
  createDefaultSettingsIfNeeded: () => Promise<void>;
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType>({
  widgetSettings: [],
  isLoading: true,
  refreshSettings: async () => {},
  isWidgetVisible: () => false,
  updateWidgetSetting: async () => {},
  createDefaultSettingsIfNeeded: async () => {}
});

export const useDashboardSettings = () => useContext(DashboardSettingsContext);

export const DashboardSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [widgetSettings, setWidgetSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('dashboard_widget_settings')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      console.info('Fetched dashboard settings:', data?.length || 0);
      setWidgetSettings(data || []);
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultSettingsIfNeeded = async () => {
    try {
      setIsLoading(true);
      
      // Check if settings already exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('dashboard_widget_settings')
        .select('id')
        .limit(1);
      
      if (checkError) {
        throw checkError;
      }
      
      // If no settings exist, create default ones
      if (!existingSettings || existingSettings.length === 0) {
        const { error: insertError } = await supabase
          .from('dashboard_widget_settings')
          .insert(DEFAULT_DASHBOARD_WIDGETS);
        
        if (insertError) {
          throw insertError;
        }
        
        console.info('Created default dashboard widget settings');
      }
      
      await refreshSettings();
    } catch (error) {
      console.error('Error creating default settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWidgetSetting = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('dashboard_widget_settings')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setWidgetSettings(prevSettings => 
        prevSettings.map(setting => 
          setting.id === id ? { ...setting, ...updates } : setting
        )
      );
    } catch (error) {
      console.error('Error updating widget setting:', error);
      throw error;
    }
  };

  const isWidgetVisible = (widgetKey: string, userRole: string) => {
    const widget = widgetSettings.find(w => w.widget_key === widgetKey);
    
    if (!widget) {
      return false;
    }
    
    return widget.is_visible && widget.allowed_roles.includes(userRole);
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <DashboardSettingsContext.Provider 
      value={{ 
        widgetSettings, 
        isLoading,
        refreshSettings,
        isWidgetVisible,
        updateWidgetSetting,
        createDefaultSettingsIfNeeded
      }}
    >
      {children}
    </DashboardSettingsContext.Provider>
  );
};
