
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export function TrainingVideoForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !videoUrl) {
      toast({
        description: "Please fill in the required fields (title and video URL)",
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
      
      // Insert the new training video
      const { data, error } = await supabase
        .from('training_videos')
        .insert({
          title,
          description,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl || null,
          created_by: sessionData.session.user.id,
          category
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        description: "Training video added successfully",
      });
      
      // Navigate to the training videos page
      navigate("/training");
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
          
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL *</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              required
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
            <p className="text-xs text-muted-foreground">
              If left blank, we'll try to generate a thumbnail from the video automatically
            </p>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/training")}
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
