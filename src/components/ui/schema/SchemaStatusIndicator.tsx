
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SchemaType } from "@/utils/schemaUtils";

interface SchemaStatusIndicatorProps {
  currentSchema: SchemaType;
  previousErrors: boolean;
  isCheckingSchema: boolean;
}

export function SchemaStatusIndicator({
  currentSchema,
  previousErrors,
  isCheckingSchema
}: SchemaStatusIndicatorProps) {
  if (isCheckingSchema) {
    return <span className="animate-pulse">⋯</span>;
  }
  
  if (previousErrors) {
    return <AlertTriangle className="h-4 w-4 ml-1 text-amber-500" />;
  }
  
  if (currentSchema !== 'public') {
    return <CheckCircle className="h-4 w-4 ml-1 text-green-500" />;
  }
  
  return null;
}
