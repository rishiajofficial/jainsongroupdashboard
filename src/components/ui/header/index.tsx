
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { HeaderLogo } from "./HeaderLogo";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { PublicNavigation } from "@/components/navigation/PublicNavigation";
import { UserRole } from "@/pages/DashboardPage";
import { addSchemaResetButton } from "@/utils/schemaUtils";

interface UserData {
  email?: string;
  avatarUrl?: string;
  fullName?: string;
  role?: UserRole;
}

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get the initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    };
    
    checkSession();

    // Add emergency schema reset button - this will always be available as a failsafe
    addSchemaResetButton();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      
      // Only update state if the event is meaningful
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    // Check if we just switched schemas and should navigate to a saved path
    const returnPath = localStorage.getItem('schema_switch_return_path');
    if (returnPath) {
      localStorage.removeItem('schema_switch_return_path');
      // Only navigate if we're not already on that path
      if (window.location.pathname !== returnPath) {
        window.location.pathname = returnPath;
      }
    }

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // First try to fetch profile from the current schema
      const { data, error } = await supabase
        .from('profiles')
        .select('email, avatar_url, role, full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        
        // If there was a schema switch, check if we stored user info
        const schemaUserRole = localStorage.getItem('schema_switch_user_role');
        if (schemaUserRole) {
          console.log("Using stored user role from schema switch:", schemaUserRole);
          // Use the stored user role until the profile is properly created in the new schema
          setUser({ 
            email: "",
            role: schemaUserRole as UserRole
          });
          
          // Clear the stored info to prevent reuse on non-schema switches
          localStorage.removeItem('schema_switch_user_id');
          localStorage.removeItem('schema_switch_user_role');
          
          return;
        }
        
        setUser({ email: "" });
        return;
      }

      if (data) {
        let avatarUrl;
        if (data.avatar_url) {
          try {
            const { data: avatarData } = await supabase.storage
              .from('avatars')
              .getPublicUrl(data.avatar_url);
              
            if (avatarData) {
              avatarUrl = avatarData.publicUrl;
            }
          } catch (error) {
            console.error("Error getting avatar URL:", error);
          }
        }
        
        setUser({ 
          email: data.email || "",
          fullName: data.full_name,
          avatarUrl: avatarUrl,
          role: data.role as UserRole
        });
        
        // Clear any schema switch user info if present
        localStorage.removeItem('schema_switch_user_id');
        localStorage.removeItem('schema_switch_user_role');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser({ email: "" });
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      
      // First clear all local storage related to authentication
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      // Then sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // Update local state
      setIsAuthenticated(false);
      setUser(null);
      toast.success("Successfully logged out");
      
      // Force hard navigation to login page
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Error logging out");
      
      // Even if there's an error, we should still reset the client state and force navigation
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = "/login";
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="flex items-center gap-2">
          <HeaderLogo />
        </div>

        {/* Desktop navigation - Now simplified to just auth controls */}
        <div className="hidden md:flex items-center justify-end flex-1">
          {!isAuthenticated ? (
            <PublicNavigation variant="desktop" />
          ) : (
            <UserMenu user={user} onLogout={handleLogout} />
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden ml-auto p-2" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      <MobileMenu 
        isAuthenticated={isAuthenticated}
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
    </header>
  );
}
