
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { ArrowRight, Target, Users, BarChart, Award, ChartBar } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-background to-muted/50 overflow-hidden flex-grow flex items-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              Sales Career Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              Elevate Your <span className="text-primary font-normal">Sales Career</span> & Performance
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              The complete sales growth platform connecting talented salespeople with companies that value performance and providing tools for both to succeed.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border/40 hover:shadow-md transition">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h2 className="text-2xl font-medium">For Sales Professionals</h2>
                <p className="text-muted-foreground">
                  Elevate your sales career and increase your earning potential with matched opportunities and skill development.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link to="/candidates">
                    Explore Opportunities
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border/40 hover:shadow-md transition">
                <Target className="h-8 w-8 text-primary mb-2" />
                <h2 className="text-2xl font-medium">For Employers</h2>
                <p className="text-muted-foreground">
                  Build a high-performing sales team with skill-based hiring, performance tracking, and long-term retention.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link to="/employers">
                    Find Top Talent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-light mb-4">Comprehensive Sales Platform</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need for sales excellence in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 max-w-6xl mx-auto">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Performance Tracking</h3>
              <p className="text-muted-foreground">
                Real-time analytics and performance monitoring for both salespeople and managers.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Skill-Based Matching</h3>
              <p className="text-muted-foreground">
                AI-powered matching between sales talent and companies based on skills and culture fit.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Career Growth</h3>
              <p className="text-muted-foreground">
                Clear advancement paths and skill development opportunities for long-term career success.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-primary-foreground">
            <h2 className="text-3xl font-light">Ready to Transform Your Sales Career or Team?</h2>
            <p className="text-xl opacity-90 font-light">
              Join thousands of professionals already growing with SalesMan
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" asChild className="px-6 py-6 font-medium rounded-md">
                <Link to="/signup">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
