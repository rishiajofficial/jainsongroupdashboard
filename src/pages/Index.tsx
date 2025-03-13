
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
  ShieldCheck 
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-background/80 pt-20 pb-32">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-12 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  Jainson Group's Complete Workforce Management Solution
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                  A comprehensive platform for hiring, training, managing, and supervising your sales team - from candidate selection to performance tracking.
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
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" 
                  alt="Jainson Group Dashboard" 
                  className="w-full max-w-lg rounded-lg shadow-lg object-cover"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* About Jainson Group */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">About Jainson Group</h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Founded in 1977, Jainson Group is a pioneer in manufacturing superior quality padlocks, door locks, and architectural hardware. With a commitment to innovation and quality, we've expanded our operations to include a comprehensive workforce management solution.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <div className="md:w-1/3">
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" 
                  alt="Jainson Team" 
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="md:w-2/3 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Legacy of Excellence</h3>
                    <p className="text-muted-foreground">
                      With over four decades of manufacturing experience, Jainson Group has established itself as a trusted name in security solutions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Quality Assurance</h3>
                    <p className="text-muted-foreground">
                      Our products undergo rigorous quality tests to ensure durability, reliability, and security that meets international standards.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Exceptional Team</h3>
                    <p className="text-muted-foreground">
                      Our success is built on our dedicated workforce that's nurtured through our comprehensive management platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Dashboard Features */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Complete Workforce Management</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our comprehensive platform covers the entire employee lifecycle, from recruitment to performance management.
              </p>
            </div>
            
            {/* User Roles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
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
                    <span>Complete assessments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Showcase skills and experience</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/candidates">Learn More</Link>
                </Button>
              </div>
              
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
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
                    <span>Monitor performance metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Access training materials</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/salesperson-tracker">Track Visits</Link>
                </Button>
              </div>
              
              <div className="bg-background p-8 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">For Managers</h3>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Manage job listings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Review applications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Create assessment templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                    <span>Monitor salesperson performance</span>
                  </li>
                </ul>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/employers">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Dashboard Highlights */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                  Streamlined Hiring Process
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Our platform simplifies the entire hiring process, from posting job listings to interviewing candidates and making offers.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Job Management</h3>
                      <p className="text-muted-foreground">
                        Easily create, edit, and manage job postings with customizable templates.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Application Tracking</h3>
                      <p className="text-muted-foreground">
                        Review applications, track candidate status, and collaborate with your team.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Skills Assessment</h3>
                      <p className="text-muted-foreground">
                        Create custom assessments to evaluate candidate skills and qualifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" 
                  alt="Hiring Process" 
                  className="rounded-lg shadow-lg max-w-md w-full"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Field Sales Tracking */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="order-2 md:order-1 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80" 
                  alt="Sales Tracking" 
                  className="rounded-lg shadow-lg max-w-md w-full"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                  Advanced Field Sales Tracking
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Monitor your sales team's activities, track shop visits, and analyze performance metrics in real-time.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Performance Analytics</h3>
                      <p className="text-muted-foreground">
                        Visualize sales activities and performance with comprehensive dashboards.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Shop Visit Tracking</h3>
                      <p className="text-muted-foreground">
                        Track field visits with location data, photos, and sales pitch recordings.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Team Management</h3>
                      <p className="text-muted-foreground">
                        Assign territories, set goals, and monitor individual salesperson performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-20 bg-primary/5">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Ready to Transform Your Workforce Management?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join Jainson Group's platform and experience the full suite of tools to hire, train, and manage your sales team effectively.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started Today</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Sign In to Your Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
