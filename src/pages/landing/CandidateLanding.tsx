
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { ArrowRight, Medal, TrendingUp, Sparkles, DollarSign, Target, ChartBar, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CandidateLanding = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-background to-muted/50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                For Sales Professionals
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
                Elevate Your <span className="text-primary font-normal">Income Potential</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light">
                SalesMan isn't just a job board - it's your path to higher earnings, skill development, and long-term career growth.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg" className="px-6 py-6 font-medium rounded-md">
                  <Link to="/signup">
                    Start Earning More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="px-6 py-6 font-medium rounded-md">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" 
                  alt="Successful sales professional" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Value Proposition */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-light mb-4">Your Path to Sales Excellence</h2>
            <p className="text-muted-foreground text-lg">
              We empower you to maximize your earnings and build a rewarding long-term career
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <Card className="border border-border/40 shadow-sm bg-background relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-bl-full"></div>
              <CardHeader className="p-6">
                <div className="mb-4 text-primary">
                  <DollarSign className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-medium">Earn More, Faster</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Access high-paying sales roles matched to your specific skills and strengths
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="mt-4 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <Medal className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Verified Performance History</p>
                      <p className="text-sm text-muted-foreground">Showcase your track record to get paid what you're worth</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Clear Growth Path</p>
                      <p className="text-sm text-muted-foreground">See exactly what skills and performance metrics you need to advance your income</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Personalized Coaching</p>
                      <p className="text-sm text-muted-foreground">Get AI-powered coaching that targets your specific skill gaps to boost earnings potential</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Stats/Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-light mb-4">Real Results for Sales Professionals</h2>
            <p className="text-muted-foreground text-lg">
              Our platform delivers measurable income growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-background rounded-xl shadow-sm">
              <div className="text-4xl font-light text-primary mb-2">+32%</div>
              <p className="text-lg">Average increase in annual income</p>
            </div>
            
            <div className="text-center p-8 bg-background rounded-xl shadow-sm">
              <div className="text-4xl font-light text-primary mb-2">87%</div>
              <p className="text-lg">Find better opportunities within 60 days</p>
            </div>
            
            <div className="text-center p-8 bg-background rounded-xl shadow-sm">
              <div className="text-4xl font-light text-primary mb-2">3.5x</div>
              <p className="text-lg">Faster career advancement rate</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-primary-foreground">
            <h2 className="text-3xl font-light">Ready to Increase Your Income?</h2>
            <p className="text-xl opacity-90 font-light">
              Join hundreds of sales professionals already earning more with SalesMan
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" asChild className="px-6 py-6 font-medium rounded-md">
                <Link to="/signup">
                  Start Your Journey
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

export default CandidateLanding;
