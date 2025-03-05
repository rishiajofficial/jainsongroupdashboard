
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/Header";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="space-y-4 animate-fade-up">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Brand new dashboard
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Experience the future of data management
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A cutting-edge dashboard with clean design, intuitive navigation, and real-time analytics. Sign up today and unlock your data potential.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link to="/signup">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-muted/50 glass-card p-4 animate-scale-in">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center rounded-full p-2 bg-muted">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium">Dashboard Preview</h3>
                      <p className="text-sm text-muted-foreground">Sign in to access your dashboard</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Everything you need
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Our dashboard comes with everything you need to get started with data visualization and management.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8 md:pt-12">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-4 glass-card animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    title: "Real-time Analytics",
    description: "Get insights instantly with our real-time data processing",
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
  },
  {
    title: "Secure Authentication",
    description: "Your data is protected with our enterprise-grade security",
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
  },
  {
    title: "Intuitive Interface",
    description: "Our clean design makes data management a breeze",
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
  },
];

export default Index;
