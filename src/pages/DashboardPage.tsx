
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Dashboard } from "@/components/ui/Dashboard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated with Supabase
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Only show toast if we're not on initial load
          if (!isLoading) {
            toast.error("Please log in to access the dashboard");
          }
          navigate("/login");
          return;
        }
        
        // Fetch user profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error("Profile fetch error:", error);
        } else {
          setUserProfile(profile);
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Authentication error");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setIsAuthenticated(true);
          // Fetch profile on sign in
          const fetchProfile = async () => {
            if (session) {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              setUserProfile(data);
            }
          };
          fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserProfile(null);
          navigate("/login");
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        {isAuthenticated && userProfile && (
          <Dashboard userProfile={userProfile} />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
