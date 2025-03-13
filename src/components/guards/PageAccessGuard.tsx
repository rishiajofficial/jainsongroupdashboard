
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { usePageAccess } from "@/contexts/PageAccessContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/pages/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageAccessGuardProps {
  children: ReactNode;
}

export function PageAccessGuard({ children }: PageAccessGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAccess } = usePageAccess();
  
  useEffect(() => {
    const checkUserAccess = async () => {
      setIsLoading(true);
      
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If not authenticated and trying to access protected route, redirect to login
          if (location.pathname !== '/' && 
              location.pathname !== '/login' && 
              location.pathname !== '/signup') {
            toast.error("Please log in to access this page");
            navigate("/login", { state: { from: location.pathname } });
          } else {
            // For public routes, allow access
            setIsAuthorized(true);
          }
          return;
        }
        
        // Get user profile to determine role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setIsAuthorized(false);
          return;
        }
        
        const role = profileData?.role as UserRole;
        setUserRole(role);
        
        // Public routes are always accessible
        if (location.pathname === '/' || 
            location.pathname === '/login' || 
            location.pathname === '/signup') {
          setIsAuthorized(true);
          return;
        }
        
        // Always allow admins access to all pages
        if (role === 'admin') {
          setIsAuthorized(true);
          return;
        }
        
        // For non-admins, check if they have access to this page
        const canAccess = hasAccess(location.pathname, role);
        setIsAuthorized(canAccess);
        
        if (!canAccess) {
          toast.error("You don't have permission to access this page");
        }
      } catch (error) {
        console.error("Access check error:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAccess();
  }, [location.pathname, navigate, hasAccess]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthorized && userRole) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access this page.
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
                <Button 
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <>{children}</>;
}
