
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onBack: () => void;
}

export function JobApplicationForm({ jobId, jobTitle, onBack }: JobApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [workType, setWorkType] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to apply for jobs");
        navigate("/login");
        return;
      }

      const userId = session.user.id;

      // Upload resume if provided
      let resumeUrl = null;
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const filePath = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile);

        if (uploadError) {
          console.error("Error uploading resume:", uploadError);
          toast.error("Failed to upload resume");
          return;
        }

        resumeUrl = filePath;
      }

      // Prepare cover letter with additional application details
      const formattedCoverLetter = `
Full Name: ${fullName}
Email: ${email}
Phone: ${phone}
LinkedIn: ${linkedin}
GitHub: ${github}
Years of Experience: ${yearsOfExperience}
Current Company: ${currentCompany}
Skill Level: ${skillLevel}
Work Type Preference: ${workType}

Cover Letter:
${coverLetter}
      `.trim();

      // Create application record
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          candidate_id: userId,
          cover_letter: formattedCoverLetter,
          resume_url: resumeUrl,
          status: 'pending'
        });

      if (applicationError) {
        console.error("Error submitting application:", applicationError);
        toast.error("Failed to submit application");
        return;
      }

      toast.success("Application submitted successfully!");
      navigate("/applications");
    } catch (error) {
      console.error("Error in application submission:", error);
      toast.error("An error occurred while submitting your application");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Apply for: {jobTitle}</CardTitle>
            <CardDescription>
              Complete the form below to submit your application
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="Current or most recent employer"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="e.g., 3"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select required onValueChange={setSkillLevel} value={skillLevel}>
                  <SelectTrigger id="skillLevel">
                    <SelectValue placeholder="Select your skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workType">Work Type Preference</Label>
                <Select required onValueChange={setWorkType} value={workType}>
                  <SelectTrigger id="workType">
                    <SelectValue placeholder="Select work type preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Cover Letter & Resume */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Application Materials</h3>
            
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're a great fit for this position"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="resume">Resume</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="resume"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="max-w-md"
                />
                <div className="text-sm text-muted-foreground">
                  PDF, DOC, or DOCX (max 5MB)
                </div>
              </div>
              {resumeFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected file: {resumeFile.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
