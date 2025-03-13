
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "@/pages/DashboardPage";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("candidate");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              company: company || null,
              position: position || null
            },
          },
        });

        if (error) throw error;
        
        // For manager or salesperson, create approval request
        if (role === "manager" || role === "salesperson") {
          // First get the user ID that was just created
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData && userData.user) {
            if (role === "manager") {
              // Create a manager approval request
              const { error: approvalError } = await supabase
                .from('manager_approvals')
                .insert({
                  manager_id: userData.user.id,
                  status: 'pending'
                });
                
              if (approvalError) {
                console.error("Error creating manager approval:", approvalError);
              }
            }
            
            toast.success("Account created successfully! Your account needs to be approved by an administrator.");
          }
        } else {
          toast.success("Account created successfully! You can now log in.");
        }
        
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      toast.success("Password reset email sent! Check your inbox.");
      setForgotPassword(false);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Card className="w-full max-w-md mx-auto glass-card animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {forgotPassword ? "Reset Password" : 
            mode === "login" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {forgotPassword ? "Enter your email to receive a password reset link" :
            mode === "login" 
              ? "Enter your credentials to access your account" 
              : "Enter your information to create an account"}
        </CardDescription>
      </CardHeader>
      {forgotPassword ? (
        <form onSubmit={handleForgotPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                <>Send Reset Link</>
              )}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full"
              onClick={() => setForgotPassword(false)}
            >
              Back to Login
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <RadioGroup 
                    value={role} 
                    onValueChange={(value) => setRole(value as UserRole)}
                    className="flex flex-col space-y-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="candidate" id="candidate" />
                      <Label htmlFor="candidate" className="cursor-pointer">Candidate / Job Seeker</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="salesperson" id="salesperson" />
                      <Label htmlFor="salesperson" className="cursor-pointer">Salesperson</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manager" id="manager" />
                      <Label htmlFor="manager" className="cursor-pointer">Sales Manager</Label>
                    </div>
                  </RadioGroup>
                </div>

                {(role === "manager" || role === "salesperson") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        placeholder="Company Name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        placeholder="Your Position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </>
                )}
              </>
            )}
            
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
            {mode === "login" && (
              <Button 
                type="button" 
                variant="link" 
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setForgotPassword(true)}
              >
                Forgot your password?
              </Button>
            )}
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
      )}
    </Card>
  );
}
