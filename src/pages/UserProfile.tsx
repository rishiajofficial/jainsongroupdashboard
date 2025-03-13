import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "@/components/userProfile/ProfileHeader";
import { ProfilePicture } from "@/components/userProfile/ProfilePicture";
import { ProfileForm } from "@/components/userProfile/ProfileForm";
import { UserRole } from "@/pages/DashboardPage";

const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // User profile state
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    company: "",
    position: "",
    role: "" as UserRole
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
          role: data.role as UserRole || "candidate"
        });

        // Get avatar URL if it exists
        if (data.avatar_url) {
          try {
            const { data: avatarData } = await supabase.storage
              .from('avatars')
              .getPublicUrl(data.avatar_url);
              
            if (avatarData) {
              setAvatarUrl(avatarData.publicUrl);
              console.log("Avatar URL loaded:", avatarData.publicUrl);
            }
          } catch (error) {
            console.error("Error getting avatar URL:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error in profile fetch:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-8 animate-fade-up">
          <ProfileHeader userRole={userProfile.role} />

          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your profile details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <ProfilePicture 
                    avatarUrl={avatarUrl}
                    userInitial={
                      userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 
                      userProfile.email ? userProfile.email.charAt(0).toUpperCase() : "U"
                    }
                  />
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              {!isLoading && (
                <ProfileForm initialData={userProfile} />
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
