
import { useState } from "react";
import { Upload, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentSchema } from "@/utils/schemaUtils";

interface ProfilePictureProps {
  avatarUrl: string | null;
  userInitial: string;
}

export const ProfilePicture = ({ avatarUrl, userInitial }: ProfilePictureProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const currentSchema = getCurrentSchema();
  
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
      const filePath = `${userId}-${currentSchema}.${fileExt}`; // Include schema in filename
      
      console.log(`Uploading file to path: ${filePath} in schema: ${currentSchema}`);
      
      // Upload the file to Supabase storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        console.error(`Upload error in schema ${currentSchema}:`, uploadError);
        throw uploadError;
      }
      
      console.log(`Upload successful in schema ${currentSchema}:`, uploadData);
      
      // Get the public URL
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      console.log(`Public URL in schema ${currentSchema}:`, data);
      
      // Update the profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: filePath 
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error(`Profile update error in schema ${currentSchema}:`, updateError);
        throw updateError;
      }
      
      toast.success(`Profile picture uploaded successfully to ${currentSchema} schema`);
      
      // Refresh the page to show the new avatar
      window.location.reload();
      
    } catch (error) {
      console.error(`Error uploading avatar in schema ${currentSchema}:`, error);
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
      a.download = `profile-picture-${currentSchema}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error downloading avatar from schema ${currentSchema}:`, error);
      toast.error("Failed to download profile picture");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || ""} alt="Profile picture" />
        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
          {userInitial}
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
        <p className="text-xs text-muted-foreground mt-1">
          Current schema: <span className="font-medium">{currentSchema}</span>
        </p>
      </div>
    </div>
  );
};
