
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For demonstration purposes, we're simulating authentication
      // In a real app, this would connect to your backend/Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Using localStorage to simulate auth state
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({ email }));
      
      toast.success(`Successfully ${mode === "login" ? "logged in" : "signed up"}!`);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Card className="w-full max-w-md mx-auto glass-card animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Enter your credentials to access your account" 
            : "Enter your information to create an account"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" ? "Logging in..." : "Signing up..."}
              </>
            ) : (
              <>{mode === "login" ? "Log in" : "Sign up"}</>
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-primary hover:underline transition-all"
                >
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-primary hover:underline transition-all"
                >
                  Log in
                </a>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
