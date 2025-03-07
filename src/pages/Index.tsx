
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { ArrowRight, Target, ChartBar, Award, TrendingUp, LineChart, Briefcase, Star, DollarSign, Users, Medal, Sparkles, BarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
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
                Sales Career Growth Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
                Elevate Your <span className="text-primary font-normal">Sales Career</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light">
                Not just a job board. A complete career path with skill development, performance tracking, and transparent growth opportunities.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg" className="px-6 py-6 font-medium rounded-md">
                  <Link to="/signup">
                    Start Your Journey
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
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" 
                  alt="Sales professionals collaborating" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Two-sided Value Proposition Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-light mb-4">A Platform for Both Sides of Sales Success</h2>
            <p className="text-muted-foreground text-lg">
              Where salespeople grow their careers and companies build high-performing teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* For Sales Professionals */}
            <Card className="border border-border/40 shadow-sm bg-background relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-bl-full"></div>
              <CardHeader className="p-6">
                <div className="mb-4 text-primary">
                  <DollarSign className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-medium">For Sales Professionals</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Elevate your sales career and maximize your income potential
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="mt-4 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <Medal className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Earn More, Faster</p>
                      <p className="text-sm text-muted-foreground">Access high-paying sales roles matched to your specific skills and strengths</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Clear Growth Path</p>
                      <p className="text-sm text-muted-foreground">See exactly what skills and performance metrics you need to advance your career</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Personalized Development</p>
                      <p className="text-sm text-muted-foreground">Get AI-powered coaching that targets your specific skill gaps to boost your earning potential</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6">
                  <Button asChild className="w-full">
                    <Link to="/signup">Start Earning More</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* For Employers */}
            <Card className="border border-border/40 shadow-sm bg-background relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-bl-full"></div>
              <CardHeader className="p-6">
                <div className="mb-4 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-medium">For Employers</CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-2">
                  Build a high-performing sales team with lasting retention
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="mt-4 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Precision Hiring</p>
                      <p className="text-sm text-muted-foreground">Match candidates based on verified skills and performance data, not just resumes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <BarChart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Accelerated Performance</p>
                      <p className="text-sm text-muted-foreground">Drive quota attainment with targeted skill development and performance tracking</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Long-term Retention</p>
                      <p className="text-sm text-muted-foreground">Reduce costly turnover with clear growth paths that keep top performers engaged</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-6">
                  <Button asChild className="w-full">
                    <Link to="/signup">Build Your Team</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Three-Pillar Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-light mb-4">A Complete Sales Career Platform</h2>
            <p className="text-muted-foreground text-lg">
              We address the entire sales talent lifecycle, from hiring to long-term retention
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 max-w-6xl mx-auto">
            {/* Pillar 1: Hiring & Onboarding */}
            <div className="space-y-4">
              <div className="h-1 w-16 bg-primary"></div>
              <h3 className="text-2xl font-medium">Right Hiring & Onboarding</h3>
              <p className="text-muted-foreground">
                Find the perfect fit through skill-based assessment and targeted training from day one.
              </p>
              <ul className="space-y-3 mt-6">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">AI-powered skill matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Personalized onboarding journeys</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Cultural and skill fit indicators</span>
                </li>
              </ul>
            </div>
            
            {/* Pillar 2: Performance */}
            <div className="space-y-4">
              <div className="h-1 w-16 bg-primary"></div>
              <h3 className="text-2xl font-medium">Performance Optimization</h3>
              <p className="text-muted-foreground">
                Set meaningful KPIs and provide timely coaching to ensure consistent goal achievement.
              </p>
              <ul className="space-y-3 mt-6">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <ChartBar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Smart KPI tracking and analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <ChartBar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">AI-driven coaching recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <ChartBar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Behavioral nudges for improvement</span>
                </li>
              </ul>
            </div>
            
            {/* Pillar 3: Retention */}
            <div className="space-y-4">
              <div className="h-1 w-16 bg-primary"></div>
              <h3 className="text-2xl font-medium">Sustainable Retention</h3>
              <p className="text-muted-foreground">
                Keep top performers motivated with the right incentives and clear advancement paths.
              </p>
              <ul className="space-y-3 mt-6">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Personalized growth trajectories</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Skill development tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Data-backed advancement recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial/Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-light mb-4">Measured Success</h2>
            <p className="text-muted-foreground text-lg">
              Our platform delivers measurable improvements for sales professionals and organizations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-muted/30 rounded-xl">
              <div className="text-4xl font-light text-primary mb-2">+27%</div>
              <p className="text-lg">Average increase in sales performance</p>
            </div>
            
            <div className="text-center p-8 bg-muted/30 rounded-xl">
              <div className="text-4xl font-light text-primary mb-2">-35%</div>
              <p className="text-lg">Reduction in sales team turnover</p>
            </div>
            
            <div className="text-center p-8 bg-muted/30 rounded-xl">
              <div className="text-4xl font-light text-primary mb-2">40%</div>
              <p className="text-lg">Faster time to full productivity</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-primary-foreground">
            <h2 className="text-3xl font-light">Ready to Transform Your Sales Career?</h2>
            <p className="text-xl opacity-90 font-light">
              Join hundreds of sales professionals already growing with our platform
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" asChild className="px-6 py-6 font-medium rounded-md">
                <Link to="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent text-white border-white hover:bg-white/10 px-6 py-6 font-medium rounded-md">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
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
