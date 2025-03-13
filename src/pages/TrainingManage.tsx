
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Plus, Trash, Edit, Video, Upload, Check, X } from "lucide-react";

export default function TrainingManage() {
  const [role, setRole] = useState('manager');
  const [isLoading, setIsLoading] = useState(true);
  const [trainingVideos, setTrainingVideos] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openQuizDialog, setOpenQuizDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Check session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast({
            description: "Please log in to manage training videos",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        // Check role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (!profileData || (profileData.role !== 'manager' && profileData.role !== 'admin')) {
          toast({
            description: "Only managers can access this page",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
        
        setRole(profileData.role);
        
        // Fetch videos
        const { data: videos, error } = await supabase
          .from('training_videos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setTrainingVideos(videos || []);
      } catch (error) {
        console.error('Error fetching training videos:', error);
        toast({
          description: "Failed to load training videos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };
  
  const handleCreateVideo = async () => {
    if (!newVideo.title || !videoFile) {
      toast({
        description: "Please provide a title and upload a video file",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("User not authenticated");
      }
      
      // Upload video file
      const videoFileName = `${Date.now()}-${videoFile.name}`;
      const { data: videoData, error: videoError } = await supabase.storage
        .from('training_videos')
        .upload(videoFileName, videoFile);
        
      if (videoError) throw videoError;
      
      const videoUrl = supabase.storage
        .from('training_videos')
        .getPublicUrl(videoFileName).data.publicUrl;
      
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailFileName = `${Date.now()}-${thumbnailFile.name}`;
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('training_thumbnails')
          .upload(thumbnailFileName, thumbnailFile);
          
        if (thumbnailError) throw thumbnailError;
        
        thumbnailUrl = supabase.storage
          .from('training_thumbnails')
          .getPublicUrl(thumbnailFileName).data.publicUrl;
      }
      
      // Create video record
      const { data: videoRecord, error: recordError } = await supabase
        .from('training_videos')
        .insert({
          title: newVideo.title,
          description: newVideo.description,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          created_by: sessionData.session.user.id
        })
        .select()
        .single();
        
      if (recordError) throw recordError;
      
      setTrainingVideos([videoRecord, ...trainingVideos]);
      setNewVideo({ title: '', description: '' });
      setVideoFile(null);
      setThumbnailFile(null);
      setOpenDialog(false);
      
      toast({
        description: "Training video created successfully",
      });
    } catch (error) {
      console.error('Error creating training video:', error);
      toast({
        description: "Failed to create training video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training video? This will also delete all associated quizzes and user progress.")) {
      return;
    }
    
    try {
      // Delete video record
      const { error } = await supabase
        .from('training_videos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTrainingVideos(trainingVideos.filter(video => video.id !== id));
      
      toast({
        description: "Training video deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting training video:', error);
      toast({
        description: "Failed to delete training video",
        variant: "destructive",
      });
    }
  };
  
  const handleEditQuiz = async (videoId: string) => {
    try {
      // Get current questions
      const { data: questions, error } = await supabase
        .from('training_quiz_questions')
        .select(`
          id,
          question,
          training_quiz_options (
            id,
            option_text,
            is_correct
          )
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setCurrentQuestions(questions || []);
      
      // Find the video being edited
      const video = trainingVideos.find(v => v.id === videoId);
      setEditingVideo(video);
      
      setOpenQuizDialog(true);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      toast({
        description: "Failed to load quiz questions",
        variant: "destructive",
      });
    }
  };
  
  const handleAddQuestion = async () => {
    if (!editingVideo) return;
    
    // Validate question
    if (!newQuestion.question) {
      toast({
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }
    
    // Validate options
    if (newQuestion.options.some(opt => !opt.option_text)) {
      toast({
        description: "Please fill in all options",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure at least one option is marked as correct
    if (!newQuestion.options.some(opt => opt.is_correct)) {
      toast({
        description: "Please mark at least one option as correct",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Add question
      const { data: questionData, error: questionError } = await supabase
        .from('training_quiz_questions')
        .insert({
          video_id: editingVideo.id,
          question: newQuestion.question
        })
        .select()
        .single();
        
      if (questionError) throw questionError;
      
      // Add options
      const optionsToInsert = newQuestion.options.map((opt, index) => ({
        question_id: questionData.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        order_number: index + 1
      }));
      
      const { error: optionsError } = await supabase
        .from('training_quiz_options')
        .insert(optionsToInsert);
        
      if (optionsError) throw optionsError;
      
      // Refresh questions
      const { data: updatedQuestions, error: fetchError } = await supabase
        .from('training_quiz_questions')
        .select(`
          id,
          question,
          training_quiz_options (
            id,
            option_text,
            is_correct
          )
        `)
        .eq('video_id', editingVideo.id)
        .order('created_at', { ascending: true });
        
      if (fetchError) throw fetchError;
      
      setCurrentQuestions(updatedQuestions || []);
      
      // Reset form
      setNewQuestion({
        question: '',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ]
      });
      
      toast({
        description: "Question added successfully",
      });
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('training_quiz_questions')
        .delete()
        .eq('id', questionId);
        
      if (error) throw error;
      
      setCurrentQuestions(currentQuestions.filter(q => q.id !== questionId));
      
      toast({
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index].option_text = value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };
  
  const handleCorrectChange = (index: number, checked: boolean) => {
    const updatedOptions = [...newQuestion.options].map((opt, i) => ({
      ...opt,
      is_correct: i === index ? checked : opt.is_correct
    }));
    
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Training Management</h1>
                <p className="text-muted-foreground">
                  Create and manage training videos and quizzes
                </p>
              </div>
              
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Training Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Add New Training Video</DialogTitle>
                    <DialogDescription>
                      Upload a video and create a quiz to test knowledge
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <Input
                        id="title"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                        placeholder="Enter video title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        value={newVideo.description}
                        onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                        placeholder="Enter video description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="video" className="text-sm font-medium">
                        Video File
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="video"
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <span className="text-sm text-muted-foreground">
                          {videoFile ? videoFile.name : "No file chosen"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="thumbnail" className="text-sm font-medium">
                        Thumbnail (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => thumbnailInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </Button>
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          id="thumbnail"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailChange}
                        />
                        <span className="text-sm text-muted-foreground">
                          {thumbnailFile ? thumbnailFile.name : "No file chosen"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setOpenDialog(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateVideo}
                      disabled={isUploading || !newVideo.title || !videoFile}
                    >
                      {isUploading ? "Uploading..." : "Create Video"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
            ) : trainingVideos.length === 0 ? (
              <Card className="p-8 text-center">
                <CardHeader>
                  <CardTitle className="flex justify-center">
                    <GraduationCap className="h-10 w-10 mb-2" />
                  </CardTitle>
                  <CardTitle>No Training Videos Available</CardTitle>
                  <CardDescription>
                    Create your first training video by clicking the "Add Training Video" button
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: '40%' }}>Title</TableHead>
                      <TableHead style={{ width: '20%' }}>Created</TableHead>
                      <TableHead style={{ width: '20%' }}>Quiz Status</TableHead>
                      <TableHead style={{ width: '20%' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingVideos.map(video => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            {video.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(video.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {video.has_quiz ? (
                            <Badge variant="default" className="bg-green-500">
                              <Check className="h-3 w-3 mr-1" /> Quiz Available
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              No Quiz
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditQuiz(video.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Quiz
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDelete(video.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Quiz Dialog */}
            <Dialog open={openQuizDialog} onOpenChange={setOpenQuizDialog}>
              <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Manage Quiz Questions</DialogTitle>
                  <DialogDescription>
                    {editingVideo ? `Create quiz questions for "${editingVideo.title}"` : ''}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Current Questions */}
                  {currentQuestions.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Existing Questions</h3>
                      {currentQuestions.map((q, idx) => (
                        <Card key={q.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">
                                Question {idx + 1}: {q.question}
                              </CardTitle>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleDeleteQuestion(q.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-2">
                              {q.training_quiz_options.map((opt: any) => (
                                <div 
                                  key={opt.id} 
                                  className={`p-2 rounded-md ${opt.is_correct ? 'bg-green-100 dark:bg-green-900/20' : ''}`}
                                >
                                  <div className="flex items-center">
                                    {opt.is_correct && <Check className="h-4 w-4 text-green-500 mr-2" />}
                                    {opt.option_text}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Add New Question */}
                  <div className="border p-4 rounded-md space-y-4">
                    <h3 className="text-lg font-semibold">Add New Question</h3>
                    
                    <div className="space-y-2">
                      <label htmlFor="question" className="text-sm font-medium">
                        Question
                      </label>
                      <Input
                        id="question"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                        placeholder="Enter your question"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">
                          Options
                        </label>
                        <label className="text-sm font-medium">
                          Correct?
                        </label>
                      </div>
                      
                      {newQuestion.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Input
                            value={opt.option_text}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1"
                          />
                          <Checkbox
                            checked={opt.is_correct}
                            onCheckedChange={(checked) => {
                              if (typeof checked === 'boolean') {
                                handleCorrectChange(idx, checked);
                              }
                            }}
                            id={`correct-${idx}`}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={handleAddQuestion} 
                      className="w-full"
                    >
                      Add Question
                    </Button>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setOpenQuizDialog(false)}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
