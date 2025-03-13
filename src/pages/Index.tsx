
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/ui/Footer";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      setIsLoggedIn(isAuthenticated);
      
      // Redirect to dashboard if logged in
      if (isAuthenticated) {
        navigate("/dashboard");
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isAuthenticated = !!session;
      setIsLoggedIn(isAuthenticated);
      
      // Redirect to dashboard if logged in
      if (isAuthenticated) {
        navigate("/dashboard");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  // Only render the landing page if not logged in
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-background/80 pt-20 pb-32">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-12 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  The Ultimate Hiring Platform for Sales Teams
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                  Streamline your sales hiring process, track salesperson performance, and find the perfect candidates for your team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isLoggedIn ? (
                    <Button size="lg" asChild>
                      <Link to="/dashboard">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" asChild>
                        <Link to="/signup">Get Started</Link>
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <Link to="/login">Sign In</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img 
                  src="/placeholder.svg" 
                  alt="Sales Hiring Platform" 
                  className="w-full max-w-lg rounded-lg shadow-lg"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">One Platform, Multiple Solutions</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Whether you're a candidate looking for a job, a salesperson in the field, or a manager hiring your team—we've got you covered.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-semibold mb-4">For Candidates</h3>
                <p className="text-muted-foreground mb-6">
                  Find your next opportunity, apply for positions, and showcase your skills through our assessment platform.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/candidates">Learn More</Link>
                </Button>
              </div>
              
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-semibold mb-4">For Salespeople</h3>
                <p className="text-muted-foreground mb-6">
                  Track your shop visits, record sales pitches, and demonstrate your performance to managers.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/salesperson-tracker">Track Visits</Link>
                </Button>
              </div>
              
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-semibold mb-4">For Employers</h3>
                <p className="text-muted-foreground mb-6">
                  Post job listings, review applications, and manage your sales team's performance all in one place.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/employers">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
