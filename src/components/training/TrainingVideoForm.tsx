
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link } from "lucide-react";

const TRAINING_CATEGORIES = [
  "Sales Techniques",
  "Product Knowledge",
  "Customer Service",
  "Compliance",
  "Leadership",
  "Technical Skills",
  "Onboarding",
  "General"
];

interface TrainingVideoFormProps {
  onComplete?: () => void;
}

export function TrainingVideoForm({ onComplete }: TrainingVideoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return null;
    
    const timestamp = Date.now();
    const fileExt = videoFile.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `training-videos/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, videoFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile) return null;
    
    const timestamp = Date.now();
    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, thumbnailFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        description: "Please provide a title for the video",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadMethod === "url" && !videoUrl) {
      toast({
        description: "Please provide a video URL",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadMethod === "file" && !videoFile) {
      toast({
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get current user session for user ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          description: "Please log in to upload training videos",
          variant: "destructive",
        });
        return;
      }
      
      let finalVideoUrl = videoUrl;
      let finalThumbnailUrl = thumbnailUrl;
      
      // Upload files if selected
      if (uploadMethod === "file") {
        try {
          finalVideoUrl = await uploadVideo() || "";
          
          if (thumbnailFile) {
            finalThumbnailUrl = await uploadThumbnail() || "";
          }
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          toast({
            description: "Failed to upload files. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Insert the new training video
      const { data, error } = await supabase
        .from('training_videos')
        .insert({
          title,
          description,
          video_url: finalVideoUrl,
          thumbnail_url: finalThumbnailUrl || null,
          created_by: sessionData.session.user.id,
          category
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        description: "Training video added successfully",
      });
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Navigate to the training videos page
        navigate("/training");
      }
    } catch (error) {
      console.error('Error adding training video:', error);
      toast({
        description: "Failed to add training video",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Training Video</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {TRAINING_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-4">
            <Label>Video Source</Label>
            <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "url" | "file")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">
                  <Link className="h-4 w-4 mr-2" />
                  URL Link
                </TabsTrigger>
                <TabsTrigger value="file">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="videoFile">Upload Video *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={videoInputRef}
                      id="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Video
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {videoFile ? videoFile.name : "No file selected"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnailFile">Upload Thumbnail (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={thumbnailInputRef}
                      id="thumbnailFile"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileChange}
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Thumbnail
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {thumbnailFile ? thumbnailFile.name : "No file selected"}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (onComplete) {
                  onComplete();
                } else {
                  navigate("/training");
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Video"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
