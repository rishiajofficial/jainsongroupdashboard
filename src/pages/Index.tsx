
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/ui/Footer";
import { 
  Users, 
  GraduationCap, 
  BarChart3, 
  Building, 
  Briefcase, 
  ClipboardCheck, 
  ShieldCheck,
  Brain,
  LineChart,
  PieChart,
  Target,
  Bot,
  Zap
} from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with Animation */}
        <section className="relative py-12 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Animated circles in background */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center max-w-7xl mx-auto">
              <div className="md:w-1/2 mb-12 md:mb-0 md:pr-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>AI-Powered Management</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    Jainson Group's Administration Dashboard
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                    A comprehensive platform integrating AI for hiring, training, managing, and supervising your sales team - from candidate selection to performance insights.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {isLoggedIn ? (
                      <Button size="lg" className="animate-fade-in" asChild>
                        <Link to="/dashboard">Go to Dashboard</Link>
                      </Button>
                    ) : (
                      <>
                        <Button size="lg" className="animate-fade-in" asChild>
                          <Link to="/signup">Get Started</Link>
                        </Button>
                        <Button variant="outline" size="lg" className="animate-fade-in" asChild>
                          <Link to="/login">Sign In</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Feature badges */}
                <div className="mt-12 grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-background/80 border border-border rounded-lg animate-fade-up" style={{ animationDelay: "0.1s" }}>
                    <div className="mr-3 bg-primary/10 p-2 rounded-full">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">AI Recruiting</span>
                  </div>
                  
                  <div className="flex items-center p-3 bg-background/80 border border-border rounded-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
                    <div className="mr-3 bg-primary/10 p-2 rounded-full">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Performance Tracking</span>
                  </div>
                  
                  <div className="flex items-center p-3 bg-background/80 border border-border rounded-lg animate-fade-up" style={{ animationDelay: "0.3s" }}>
                    <div className="mr-3 bg-primary/10 p-2 rounded-full">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Smart Training</span>
                  </div>
                  
                  <div className="flex items-center p-3 bg-background/80 border border-border rounded-lg animate-fade-up" style={{ animationDelay: "0.4s" }}>
                    <div className="mr-3 bg-primary/10 p-2 rounded-full">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">AI Insights</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 relative">
                <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl border border-border/50 animate-scale-in">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" 
                    alt="Jainson Group Dashboard" 
                    className="w-full object-cover"
                    width={700}
                    height={500}
                  />
                  
                  {/* Floating UI elements for visual appeal */}
                  <div className="absolute top-5 right-5 p-3 bg-background/90 border border-border rounded-lg shadow-lg backdrop-blur-sm animate-fade-up" style={{ animationDelay: "0.5s" }}>
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">AI Analysis Active</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-5 left-5 p-3 bg-background/90 border border-border rounded-lg shadow-lg backdrop-blur-sm animate-fade-up" style={{ animationDelay: "0.6s" }}>
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium">Sales Trend: +24%</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full"></div>
                <div className="absolute -left-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Dashboard Features */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Bot className="h-4 w-4 mr-2" />
                <span>AI-Powered Workforce Management</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Complete Workforce Management</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our comprehensive platform covers the entire employee lifecycle, from recruitment to performance management.
              </p>
            </div>
            
            {/* User Roles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">For Candidates</h3>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Apply to job listings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Track application status</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Complete AI-evaluated assessments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Receive AI-matched job recommendations</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/candidates">Learn More</Link>
                </Button>
              </div>
              
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">For Salespeople</h3>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Track daily shop visits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Record sales pitches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Get AI-powered performance insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Access personalized training</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/salesperson-tracker">Track Visits</Link>
                </Button>
              </div>
              
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">For Managers</h3>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>AI-optimized job listings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Automated application screening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Create AI assessment templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Monitor real-time team analytics</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/employers">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Field Sales Tracking */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 flex items-center justify-center relative">
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full filter blur-xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" 
                  alt="Sales Tracking" 
                  className="rounded-lg shadow-lg max-w-md w-full relative z-10 animate-fade-up"
                />
                
                {/* Floating elements */}
                <div className="absolute -bottom-4 -right-4 p-3 bg-background border border-border rounded-lg shadow-lg z-20 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">AI analyzing visit data</span>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <LineChart className="h-4 w-4 mr-2" />
                  <span>Real-time Analytics</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                  Advanced Field Sales Tracking
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Monitor your sales team's activities, track shop visits, and analyze performance metrics in real-time with AI-powered insights.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">AI-Powered Performance Analytics</h3>
                      <p className="text-muted-foreground">
                        Get predictive insights and anomaly detection for sales activities with comprehensive dashboards.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Intelligent Shop Visit Tracking</h3>
                      <p className="text-muted-foreground">
                        Track field visits with location verification, auto-analysis of photos, and AI feedback on sales pitches.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Smart Team Management</h3>
                      <p className="text-muted-foreground">
                        Optimize territory assignments, set AI-recommended goals, and provide automated coaching to your team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-20 bg-primary/5 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="container px-4 mx-auto text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-pulse">
                <Zap className="h-4 w-4 mr-2" />
                <span>AI-Powered Efficiency</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Transform Your Workforce Management Today
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join Jainson Group's platform and experience the full suite of AI-enhanced tools to hire, train, and manage your sales team effectively.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="animate-fade-up" asChild>
                  <Link to="/signup">Get Started Today</Link>
                </Button>
                <Button variant="outline" size="lg" className="animate-fade-up" style={{ animationDelay: "0.1s" }} asChild>
                  <Link to="/login">Sign In to Your Account</Link>
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
