
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { ArrowRight, Target, Star, Award, TrendingUp, Users, LineChart, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary-foreground to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              The Complete <span className="text-primary">Sales Performance</span> Platform
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Hire, train, and optimize your sales team with AI-powered assessments and insights
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button asChild size="lg" className="hover:scale-105 transition-transform">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="hover:scale-105 transition-transform">
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Key Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Complete Sales Team Optimization</h2>
            <p className="text-muted-foreground text-lg">Our platform addresses the entire sales team lifecycle</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1: Hiring & Onboarding */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-6">
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Right Hiring & Onboarding</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <CardDescription className="text-base text-muted-foreground">
                  Evaluate candidates' skills with precision to find the perfect fit for your sales positions and provide targeted training from day one.
                </CardDescription>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">AI-powered skill assessments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Custom interview scenarios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Personalized onboarding paths</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 2: Performance */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-6">
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  <LineChart className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Good Performance</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <CardDescription className="text-base text-muted-foreground">
                  Set the right KPIs and provide timely coaching to ensure your sales team consistently hits and exceeds their targets.
                </CardDescription>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Intelligent KPI tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Real-time coaching suggestions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Automated performance nudges</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 3: Retention */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-6">
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Retention Strategies</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <CardDescription className="text-base text-muted-foreground">
                  Keep your top performers motivated with the right incentives and a clear career development path within your organization.
                </CardDescription>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Personalized incentives</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Skill development tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">Career progression roadmaps</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground text-lg">Data-driven insights to transform your sales organization</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Increased Sales Performance</h3>
                <p className="text-muted-foreground">Our customers report an average 27% increase in sales performance within the first 6 months of implementation.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Reduced Turnover</h3>
                <p className="text-muted-foreground">Better hiring decisions and targeted development lead to 35% lower turnover rates among sales professionals.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Faster Onboarding</h3>
                <p className="text-muted-foreground">New sales hires reach full productivity 40% faster with our personalized onboarding and training tools.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Better Talent Identification</h3>
                <p className="text-muted-foreground">Our AI-powered assessments help you identify top performers with 85% accuracy before you make a hiring decision.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Transform Your Sales Organization?</h2>
            <p className="text-xl opacity-90">Join hundreds of companies using our platform to hire, train, and retain the best sales talent.</p>
            <div className="pt-4">
              <Button size="lg" variant="secondary" asChild className="hover:scale-105 transition-transform">
                <Link to="/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SalesPerformAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
