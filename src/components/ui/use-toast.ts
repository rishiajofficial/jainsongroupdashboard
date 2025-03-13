
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast";

// Re-export with the same names for backward compatibility
export const useToast = useToastHook;
export const toast = toastFunction;
