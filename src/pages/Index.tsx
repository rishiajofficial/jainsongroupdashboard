
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-background to-muted/50 overflow-hidden flex-grow flex items-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              Welcome to <span className="text-primary font-normal">SalesMan</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              The Sales Career Growth Platform connecting talented salespeople with companies that value performance and growth.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border/40 hover:shadow-md transition">
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

      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-medium tracking-tight">SalesMan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SalesMan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
