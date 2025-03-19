
import { 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { SchemaType } from "@/utils/schemaUtils";

interface SchemaDropdownContentProps {
  currentSchema: SchemaType;
  previousErrors: boolean;
  onSchemaChange: (schema: SchemaType) => void;
  onReset: (e: React.MouseEvent) => void;
}

export function SchemaDropdownContent({
  currentSchema,
  previousErrors,
  onSchemaChange,
  onReset
}: SchemaDropdownContentProps) {
  return (
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
        onClick={() => onSchemaChange('public')}
      >
        Production (public)
      </DropdownMenuItem>
      <DropdownMenuItem 
        className={currentSchema === 'dev' ? 'bg-muted' : ''} 
        onClick={() => onSchemaChange('dev')}
      >
        Development (dev)
      </DropdownMenuItem>
      <DropdownMenuItem 
        className={currentSchema === 'dev2' ? 'bg-muted' : ''} 
        onClick={() => onSchemaChange('dev2')}
      >
        Development 2 (dev2)
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        className="text-red-500 flex items-center gap-2"
        onClick={onReset}
      >
        <ShieldAlert className="h-4 w-4" />
        <span>Reset to Public Schema</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
