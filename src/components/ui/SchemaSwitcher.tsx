
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Database } from "lucide-react";
import { getCurrentSchema, setCurrentSchema, SchemaType, canSwitchSchema } from "@/utils/schemaUtils";
import { UserRole } from "@/pages/DashboardPage";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SchemaSwitcherProps {
  userRole?: UserRole;
}

export function SchemaSwitcher({ userRole }: SchemaSwitcherProps) {
  const [currentSchema, setSchema] = useState<SchemaType>(getCurrentSchema());
  const { toast } = useToast();
  
  // Update state when schema changes
  useEffect(() => {
    setSchema(getCurrentSchema());
  }, []);
  
  // Only show for admins
  if (!canSwitchSchema(userRole)) {
    return null;
  }

  const handleSchemaChange = async (schema: SchemaType) => {
    if (schema === currentSchema) return;
    
    toast({
      title: "Changing Database Schema",
      description: `Switching to ${schema} schema. The page will reload.`,
    });
    
    try {
      // Get the current session to ensure it persists across schema switch
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Store user information in localStorage to help maintain state across schema switch
        localStorage.setItem('schema_switch_user_id', session.user.id);
        localStorage.setItem('schema_switch_user_role', userRole || 'candidate');
        
        // Log information about the current session to help with debugging
        console.log("Preserving session during schema switch:", {
          userId: session.user.id,
          userRole: userRole
        });
      }
      
      // Short delay to let the toast appear before reload
      setTimeout(() => {
        setCurrentSchema(schema);
      }, 1000);
    } catch (error) {
      console.error("Error preserving session during schema switch:", error);
      // Continue with schema switch even if session preservation fails
      setTimeout(() => {
        setCurrentSchema(schema);
      }, 1000);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          <span className="hidden md:inline">Schema: </span>
          <span className="font-semibold">{currentSchema}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Database Schema</DropdownMenuLabel>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
