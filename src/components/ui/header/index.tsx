
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { HeaderLogo } from "./HeaderLogo";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileMenu } from "./MobileMenu";

type UserRole = 'candidate' | 'manager' | 'admin';

interface UserData {
  email?: string;
  avatarUrl?: string;
  role?: UserRole;
}

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, avatar_url, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
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
          avatarUrl: avatarUrl,
          role: data.role as UserRole
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser({ email: "" });
    }
  };

  const handleLogout = async () => {
    try {
      // First check if we have a session to prevent "Auth session missing" error
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session, just clear state and redirect
        setIsAuthenticated(false);
        setUser(null);
        toast.success("Logged out successfully");
        navigate("/");
        return;
      }
      
      // If we have a session, sign out properly
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setIsAuthenticated(false);
      setUser(null);
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      // Even if there's an error, we should still reset the client state
      setIsAuthenticated(false);
      setUser(null);
      toast.error(error.message || "Error logging out, but you've been logged out locally");
      navigate("/");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <HeaderLogo />
        </div>

        {/* Desktop navigation */}
        <DesktopNavigation 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onLogout={handleLogout} 
        />

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={toggleMobileMenu}>
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
