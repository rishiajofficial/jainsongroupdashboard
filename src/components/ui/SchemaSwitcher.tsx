
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Database, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";
import { 
  getCurrentSchema, 
  setCurrentSchema, 
  SchemaType, 
  canSwitchSchema,
  forceResetToPublicSchema,
  verifySchemaAccess
} from "@/utils/schemaUtils";
import { UserRole } from "@/pages/DashboardPage";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SchemaSwitcherProps {
  userRole?: UserRole;
}

export function SchemaSwitcher({ userRole }: SchemaSwitcherProps) {
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
      if (schema !== 'public') {
        setIsCheckingSchema(true);
        const accessible = await verifySchemaAccess();
        setIsCheckingSchema(false);
        
        if (!accessible && schema !== 'public') {
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
  
  // Only show for admins
  if (!canSwitchSchema(userRole)) {
    return null;
  }

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
          userRole && ['admin', 'candidate', 'salesperson', 'manager'].includes(userRole) 
            ? userRole as UserRole 
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          <span className="hidden md:inline">Schema: </span>
          <span className="font-semibold">{currentSchema}</span>
          {isCheckingSchema && (
            <span className="animate-pulse">⋯</span>
          )}
          {previousErrors && <AlertTriangle className="h-4 w-4 ml-1 text-amber-500" />}
          {!previousErrors && !isCheckingSchema && currentSchema !== 'public' && (
            <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Database Schema</DropdownMenuLabel>
        
        {previousErrors && (
          <>
            <DropdownMenuItem className="text-amber-500 flex items-center gap-2 bg-amber-50">
              <AlertTriangle className="h-4 w-4" />
              <span>Schema access issues detected</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem 
          className={currentSchema === 'public' ? 'bg-muted' : ''} 
          onClick={() => handleSchemaChange('public')}
        >
          Production (public)
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={currentSchema === 'dev' ? 'bg-muted' : ''} 
          onClick={() => handleSchemaChange('dev')}
        >
          Development (dev)
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={currentSchema === 'dev2' ? 'bg-muted' : ''} 
          onClick={() => handleSchemaChange('dev2')}
        >
          Development 2 (dev2)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-500 flex items-center gap-2"
          onClick={handleReset}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Reset to Public Schema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
