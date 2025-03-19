
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Database } from "lucide-react";
import { canSwitchSchema } from "@/utils/schemaUtils";
import { UserRole } from "@/pages/DashboardPage";
import { useSchemaState } from "@/hooks/useSchemaState";
import { SchemaStatusIndicator } from "./schema/SchemaStatusIndicator";
import { SchemaDropdownContent } from "./schema/SchemaDropdownContent";

interface SchemaSwitcherProps {
  userRole?: UserRole;
}

export function SchemaSwitcher({ userRole }: SchemaSwitcherProps) {
  const {
    currentSchema,
    previousErrors,
    isCheckingSchema,
    handleSchemaChange,
    handleReset
  } = useSchemaState();
  
  // Only show for admins
  if (!canSwitchSchema(userRole)) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          <span className="hidden md:inline">Schema: </span>
          <span className="font-semibold">{currentSchema}</span>
          <SchemaStatusIndicator 
            currentSchema={currentSchema}
            previousErrors={previousErrors}
            isCheckingSchema={isCheckingSchema}
          />
        </Button>
      </DropdownMenuTrigger>
      <SchemaDropdownContent
        currentSchema={currentSchema}
        previousErrors={previousErrors}
        onSchemaChange={handleSchemaChange}
        onReset={handleReset}
      />
    </DropdownMenu>
  );
}
