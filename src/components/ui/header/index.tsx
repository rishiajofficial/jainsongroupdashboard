
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { HeaderLogo } from "./HeaderLogo";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import { PublicNavigation } from "@/components/navigation/PublicNavigation";

type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

interface UserData {
  email?: string;
  avatarUrl?: string;
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
      // Complete logout - clear all sessions and storage
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // Update local state
      setIsAuthenticated(false);
      setUser(null);
      toast.success("Successfully logged out");
      
      // Clear all Supabase-related data from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      // Force browser refresh to clear any cached authentication state
      window.location.href = "/";
    } catch (error: any) {
      console.error("Logout error:", error);
      // Even if there's an error, we should still reset the client state
      setIsAuthenticated(false);
      setUser(null);
      toast.error(error.message || "Error logging out, but you've been logged out locally");
      
      // Force browser refresh to clear any cached authentication state
      window.location.href = "/";
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
