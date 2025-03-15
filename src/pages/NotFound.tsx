
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/button";
import { HomeIcon, RefreshCcw } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 animate-fade-up">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="text-xl text-muted-foreground">Page not found</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button asChild className="mt-4">
              <Link to="/">
                <HomeIcon className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-4">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
