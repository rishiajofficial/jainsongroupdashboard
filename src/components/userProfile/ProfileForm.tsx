
import { useState } from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentSchema } from "@/utils/schemaUtils";

interface UserProfileData {
  fullName: string;
  email: string;
  company: string;
  position: string;
}

export const ProfileForm = ({ initialData }: { initialData: UserProfileData }) => {
  const [userProfile, setUserProfile] = useState<UserProfileData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

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
    const currentSchema = getCurrentSchema();
    console.log(`Saving profile data in schema: ${currentSchema}`);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No active session found");
        return;
      }

      // Debug information to track the request
      console.log(`Updating profile for user ID: ${session.user.id} in schema: ${currentSchema}`);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: userProfile.fullName,
          email: userProfile.email,
          company: userProfile.company,
          position: userProfile.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select();

      if (error) {
        console.error(`Error saving profile in schema ${currentSchema}:`, error);
        toast.error("Failed to save profile data");
        return;
      }

      console.log(`Profile updated successfully in schema ${currentSchema}:`, data);
      toast.success(`Profile data saved successfully in ${currentSchema} schema`);
    } catch (error) {
      console.error(`Error in save profile in schema ${currentSchema}:`, error);
      toast.error("Failed to save profile data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
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
      <div className="flex flex-col space-y-2 pt-4">
        <Button onClick={saveProfile} className="w-full sm:w-auto" disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
        <div className="text-xs text-muted-foreground">
          Saving to schema: <span className="font-medium">{getCurrentSchema()}</span>
        </div>
      </div>
    </>
  );
};
