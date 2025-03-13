
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/pages/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface PageAccessGuardProps {
  children: ReactNode;
}

export function PageAccessGuard({ children }: PageAccessGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
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
          setIsLoading(false);
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
          setIsLoading(false);
          return;
        }
        
        const role = profileData?.role as UserRole;
        setUserRole(role);
        
        // Public routes are always accessible
        if (location.pathname === '/' || 
            location.pathname === '/login' || 
            location.pathname === '/signup') {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // Admin has access to all pages
        if (role === 'admin') {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // Allow access to dashboard and basic pages regardless of role
        if (location.pathname === '/dashboard' || 
            location.pathname === '/profile' || 
            location.pathname === '/settings') {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // For now, just authorize all paths to debug the issue
        setIsAuthorized(true);
        setIsLoading(false);
        
        /* Temporarily bypass role-based access checks to debug navigation
        // Check role-based access for specific paths
        if (checkRoleAccess(location.pathname, role)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          // Only display toast for intentional navigation, not on initial load
          if (location.key !== 'default') {
            toast.error("You don't have permission to access this page");
          }
        }
        */
      } catch (error) {
        console.error("Access check error:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Helper function to check if a role has access to a page
    const checkRoleAccess = (path: string, role: UserRole | null): boolean => {
      if (!role) return false;
      
      // Based on role, define accessible paths
      const rolePaths: Record<UserRole, string[]> = {
        admin: [], // Admin has access to everything
        manager: [
          '/jobs/manage', '/applications/review', '/assessments/templates',
          '/assessments/assign', '/salesperson-dashboard', '/training/manage',
          '/training/performance'
        ],
        salesperson: [
          '/salesperson-tracker', '/salesperson-stats', '/training'
        ],
        candidate: [
          '/jobs', '/applications', '/assessments/candidate', '/salesperson-tracker'
        ]
      };
      
      // Check role-specific paths
      return rolePaths[role]?.some(allowedPath => path.startsWith(allowedPath)) || false;
    };
    
    checkUserAccess();
  }, [location.pathname, location.key, navigate]);
  
  const handleLogout = async () => {
    try {
      console.log("Logging out from PageAccessGuard...");
      
      // First clear all local storage related to authentication
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.includes('supabase')) {
          console.log(`Removing key: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      // Then sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Supabase signOut error:", error);
        throw error;
      }
      
      toast.success("Logged out successfully");
      
      // Force hard navigation to the login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
      
      // Even if there's an error, force navigation to login
      window.location.href = "/login";
    }
  };
  
  if (isLoading) {
    return <LoadingScreen />;
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
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full mt-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
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
