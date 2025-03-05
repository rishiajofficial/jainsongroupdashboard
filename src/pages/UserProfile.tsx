
import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Save, Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type UserRole = 'candidate' | 'manager' | 'admin';

const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Upload avatar image
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      // Check file size
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No active session found");
        return;
      }
      
      const userId = session.user.id;
      const filePath = `${userId}.${fileExt}`;
      
      console.log("Uploading file to path:", filePath);
      
      // Upload the file to Supabase storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful:", uploadData);
      
      // Get the public URL
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      console.log("Public URL:", data);
      setAvatarUrl(data.publicUrl);
      
      // Update the profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: filePath 
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }
      
      toast.success("Profile picture uploaded successfully");
      
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  // Download avatar image
  const downloadAvatar = async () => {
    if (!avatarUrl) {
      toast.error("No profile picture to download");
      return;
    }

    try {
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-picture.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading avatar:", error);
      toast.error("Failed to download profile picture");
    }
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
        .update({
          full_name: userProfile.fullName,
          email: userProfile.email,
          company: userProfile.company,
          position: userProfile.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

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

  // Helper function to get role badge color
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'candidate':
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-8 animate-fade-up">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
            <p className="text-muted-foreground">
              Manage your personal information
            </p>
          </div>

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
                {userProfile.role && (
                  <Badge variant={getRoleBadgeVariant(userProfile.role as UserRole)} className="capitalize">
                    {userProfile.role}
                  </Badge>
                )}
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
                  {/* Profile Picture Section */}
                  <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || ""} alt="Profile picture" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 
                         userProfile.email ? userProfile.email.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="picture" className="text-sm text-muted-foreground">
                        Profile Picture
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Label 
                          htmlFor="picture" 
                          className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {isUploading ? "Uploading..." : "Upload"}
                        </Label>
                        <Input 
                          id="picture" 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={uploadAvatar}
                          disabled={isUploading}
                        />
                        {avatarUrl && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={downloadAvatar}
                            title="Download profile picture"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended: Square JPG, PNG. Max 5MB.
                      </p>
                    </div>
                  </div>

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
                </>
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
      </main>
    </div>
  );
};

export default UserProfile;
