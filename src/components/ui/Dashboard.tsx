
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // User profile state
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    company: "",
    position: "",
  });

  useEffect(() => {
    // Load user profile data from Supabase
    fetchUserProfile();
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No active session found");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
        return;
      }

      if (data) {
        setUserProfile({
          fullName: data.full_name || "",
          email: data.email || "",
          company: data.company || "",
          position: data.position || "",
        });
      }
    } catch (error) {
      console.error("Error in profile fetch:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile data to Supabase
  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No active session found");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: userProfile.fullName,
          email: userProfile.email,
          company: userProfile.company,
          position: userProfile.position,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving profile:", error);
        toast.error("Failed to save profile data");
        return;
      }

      toast.success("Profile data saved successfully");
    } catch (error) {
      console.error("Error in save profile:", error);
      toast.error("Failed to save profile data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome to Your Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your profile and settings
        </p>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  placeholder="John Doe" 
                  value={userProfile.fullName} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={userProfile.email} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  name="company" 
                  placeholder="Acme Inc." 
                  value={userProfile.company} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input 
                  id="position" 
                  name="position" 
                  placeholder="Software Engineer" 
                  value={userProfile.position} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={saveProfile} className="w-full sm:w-auto" disabled={isSaving || isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
