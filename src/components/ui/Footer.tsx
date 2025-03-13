
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Don't render the footer when logged in
  if (isAuthenticated) {
    return null;
  }

  return (
    <footer className="bg-background border-t py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-medium text-lg mb-4">Jainson Group</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered workforce management platform for hiring, training, and supervising your team with data-driven insights.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">For Salespeople</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/candidates" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Salesperson Portal
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/salesperson-tracker" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Track Sales Activity
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/employers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Employer Portal
                </Link>
              </li>
              <li>
                <Link to="/jobs/manage" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link to="/applications/review" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Review Applications
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Jainson Group. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
