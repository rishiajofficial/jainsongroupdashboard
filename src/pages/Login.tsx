
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { Header } from "@/components/ui/Header";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any potentially stale auth data on page load
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // If there was an auth error in the URL, clear local storage
        if (window.location.href.includes('?error=')) {
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          setIsLoading(false);
          return;
        }
        
        if (data.session) {
          navigate("/dashboard");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed in Login:", event, session);
        if (event === 'SIGNED_IN' && session) {
          navigate("/dashboard");
        }
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-up">
          <AuthForm mode="login" />
        </div>
      </main>
    </div>
  );
};

export default Login;
