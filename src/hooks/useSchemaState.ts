
import { useState, useEffect } from "react";
import { 
  getCurrentSchema, 
  setCurrentSchema, 
  SchemaType, 
  verifySchemaAccess,
  forceResetToPublicSchema
} from "@/utils/schemaUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/pages/DashboardPage";

export function useSchemaState() {
  const [currentSchema, setSchema] = useState<SchemaType>(getCurrentSchema());
  const [previousErrors, setPreviousErrors] = useState<boolean>(false);
  const [isCheckingSchema, setIsCheckingSchema] = useState(false);
  const { toast } = useToast();
  
  // Update state when schema changes and check for errors
  useEffect(() => {
    const updateSchemaStatus = async () => {
      const schema = getCurrentSchema();
      setSchema(schema);
      
      // Check for previous schema errors
      const hasSchemaError = localStorage.getItem('schema_access_error') === 'true';
      setPreviousErrors(hasSchemaError);
      
      // Check for schema reset
      const resetPerformed = localStorage.getItem('schema_reset_performed') === 'true';
      if (resetPerformed) {
        // Clear the flag so it only shows once
        localStorage.removeItem('schema_reset_performed');
        toast({
          title: "Schema Reset Successful",
          description: "You're now using the public schema",
        });
      }

      // Verify schema access in the background
      if (schema !== 'public' as SchemaType) {
        setIsCheckingSchema(true);
        const accessible = await verifySchemaAccess();
        setIsCheckingSchema(false);
        
        if (!accessible && schema !== 'public' as SchemaType) {
          toast({
            title: "Schema Connection Issue",
            description: `Cannot access ${schema} schema. You may need to reset to public schema.`,
            variant: "destructive"
          });
          setPreviousErrors(true);
        }
      }
    };
    
    updateSchemaStatus();
  }, [toast]);

  const handleSchemaChange = async (schema: SchemaType) => {
    if (schema === currentSchema) return;
    
    setIsCheckingSchema(true);
    
    // Clear any previous schema error flags
    localStorage.removeItem('schema_access_error');
    
    toast({
      title: "Changing Database Schema",
      description: `Switching to ${schema} schema. The page will reload.`,
    });
    
    try {
      // Get the current session to ensure it persists across schema switch
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Store user information in localStorage to help maintain state across schema switch
        localStorage.setItem('schema_switch_user_id', data.session.user.id);
        
        // Make sure the user role is valid before storing it
        const validRole: UserRole = 
          data.session.user.app_metadata?.role && 
          ['admin', 'candidate', 'salesperson', 'manager'].includes(data.session.user.app_metadata.role) 
            ? data.session.user.app_metadata.role as UserRole 
            : 'candidate';
            
        localStorage.setItem('schema_switch_user_role', validRole);
        
        // Log information about the current session to help with debugging
        console.log("Preserving session during schema switch:", {
          userId: data.session.user.id,
          userRole: validRole
        });
      }
      
      // Short delay to let the toast appear before reload
      setTimeout(() => {
        setCurrentSchema(schema);
      }, 1000);
    } catch (error) {
      console.error("Error preserving session during schema switch:", error);
      setIsCheckingSchema(false);
      
      toast({
        title: "Schema Switch Error",
        description: "Failed to prepare for schema switch. Try again or reset to public schema.",
        variant: "destructive"
      });
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing
    
    if (confirm("Reset to public schema? This will clear schema-related data and log you out.")) {
      forceResetToPublicSchema();
    }
  };

  return {
    currentSchema,
    previousErrors,
    isCheckingSchema,
    handleSchemaChange,
    handleReset
  };
}
