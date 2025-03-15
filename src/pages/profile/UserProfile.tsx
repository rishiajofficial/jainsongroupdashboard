import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function UserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedFullName, setUpdatedFullName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [role, setRole] = useState('salesperson');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);

        // Get user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast({
            description: "Please log in to view your profile",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const userId = sessionData.session.user.id;

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile(profileData);
          setUpdatedFullName(profileData.full_name || "");
          setUpdatedEmail(profileData.email || "");
          setRole(profileData.role || 'salesperson');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [navigate, toast]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedFullName(profile?.full_name || "");
    setUpdatedEmail(profile?.email || "");
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);

      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          description: "Please log in to update your profile",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const userId = sessionData.session.user.id;

      // Update profile data
      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedFullName,
          email: updatedEmail,
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (updatedData) {
        setProfile(updatedData);
        toast({
          description: "Profile updated successfully",
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and manage your profile details.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={updatedFullName}
                          onChange={(e) => setUpdatedFullName(e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-600">{profile?.full_name || "Not provided"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={updatedEmail}
                          onChange={(e) => setUpdatedEmail(e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-600">{profile?.email || "Not provided"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <p className="text-gray-600">{profile?.role || "Not provided"}</p>
                    </div>
                    <div className="flex justify-end">
                      {isEditing ? (
                        <div className="space-x-2">
                          <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile}>Save</Button>
                        </div>
                      ) : (
                        <Button onClick={handleEditProfile}>Edit Profile</Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
