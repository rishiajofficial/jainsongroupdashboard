
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Users, Award, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TrainingPerformance() {
  const [role, setRole] = useState('manager');
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    sortBy: 'name',
    sortDirection: 'asc'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Check user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          toast({
            description: "Please log in to view training performance",
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
        
        // Fetch salespeople
        const { data: peopleData, error: peopleError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('role', 'salesperson');
          
        if (peopleError) throw peopleError;
        setSalespeople(peopleData || []);
        
        // Fetch training videos
        const { data: videosData, error: videosError } = await supabase
          .from('training_videos')
          .select('id, title')
          .order('created_at', { ascending: false });
          
        if (videosError) throw videosError;
        setVideos(videosData || []);
        
        // Fetch training progress for all salespeople
        const { data: progressData, error: progressError } = await supabase
          .from('training_progress')
          .select(`
            id,
            user_id,
            video_id,
            watched_percentage,
            completed,
            quiz_completed,
            quiz_score,
            completed_at
          `);
          
        if (progressError) throw progressError;
        
        // Process data for display
        const performanceMap: Record<string, any> = {};
        
        // Initialize data structure for each salesperson
        peopleData?.forEach(person => {
          performanceMap[person.id] = {
            userId: person.id,
            name: person.full_name || person.email,
            email: person.email,
            avatarUrl: person.avatar_url,
            completedVideos: 0,
            totalVideos: videosData?.length || 0,
            averageScore: 0,
            totalScore: 0,
            totalQuizzes: 0,
            videosProgress: {}
          };
          
          // Initialize progress for each video
          videosData?.forEach(video => {
            performanceMap[person.id].videosProgress[video.id] = {
              watched: false,
              watchedPercentage: 0,
              quizCompleted: false,
              quizScore: 0
            };
          });
        });
        
        // Fill in actual progress data
        progressData?.forEach(progress => {
          if (performanceMap[progress.user_id]) {
            const person = performanceMap[progress.user_id];
            
            // Update video specific progress
            if (person.videosProgress[progress.video_id]) {
              person.videosProgress[progress.video_id] = {
                watched: progress.completed,
                watchedPercentage: progress.watched_percentage,
                quizCompleted: progress.quiz_completed,
                quizScore: progress.quiz_score
              };
              
              // Update overall stats
              if (progress.completed) {
                person.completedVideos++;
              }
              
              if (progress.quiz_completed) {
                person.totalScore += progress.quiz_score;
                person.totalQuizzes++;
              }
            }
          }
        });
        
        // Calculate average scores
        Object.values(performanceMap).forEach((person: any) => {
          person.averageScore = person.totalQuizzes > 0 
            ? Math.round(person.totalScore / person.totalQuizzes) 
            : 0;
          
          person.completionPercentage = person.totalVideos > 0
            ? Math.round((person.completedVideos / person.totalVideos) * 100)
            : 0;
        });
        
        setPerformanceData(Object.values(performanceMap) as any[]);
      } catch (error) {
        console.error('Error fetching training performance:', error);
        toast({
          description: "Failed to load training performance data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  const calculateTotalProgress = () => {
    if (performanceData.length === 0 || videos.length === 0) return 0;
    
    const totalCompleted = performanceData.reduce((sum, person) => 
      sum + person.completedVideos, 0);
    const totalPossible = performanceData.length * videos.length;
    
    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  };
  
  const calculateAverageScore = () => {
    if (performanceData.length === 0) return 0;
    
    const validScores = performanceData.filter(person => person.totalQuizzes > 0);
    if (validScores.length === 0) return 0;
    
    return Math.round(
      validScores.reduce((sum, person) => sum + person.averageScore, 0) / validScores.length
    );
  };
  
  // Sort data based on filters
  const sortedData = [...performanceData].sort((a, b) => {
    const { sortBy, sortDirection } = filters;
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * multiplier;
    } else if (sortBy === 'completion') {
      return (a.completionPercentage - b.completionPercentage) * multiplier;
    } else if (sortBy === 'score') {
      return (a.averageScore - b.averageScore) * multiplier;
    }
    
    return 0;
  });
  
  const handleSort = (column: string) => {
    setFilters(prev => ({
      sortBy: column,
      sortDirection: 
        prev.sortBy === column 
          ? (prev.sortDirection === 'asc' ? 'desc' : 'asc') 
          : 'asc'
    }));
  };
  
  const renderSortIcon = (column: string) => {
    if (filters.sortBy !== column) return null;
    
    return filters.sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Training Performance</h1>
              <p className="text-muted-foreground">
                Monitor employee training progress and quiz scores
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-5 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Total Salespeople
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{salespeople.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Overall Completion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{calculateTotalProgress()}%</div>
                      <Progress value={calculateTotalProgress()} className="mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Average Quiz Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{calculateAverageScore()}%</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Detailed Performance Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Salesperson Training Progress</CardTitle>
                    <CardDescription>
                      Detailed view of training completion and quiz scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sortedData.length === 0 ? (
                      <div className="text-center py-6">
                        <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No performance data available</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleSort('name')}
                            >
                              Salesperson {renderSortIcon('name')}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted text-right"
                              onClick={() => handleSort('completion')}
                            >
                              Completion {renderSortIcon('completion')}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted text-right"
                              onClick={() => handleSort('score')}
                            >
                              Average Score {renderSortIcon('score')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedData.map(person => (
                            <TableRow key={person.userId}>
                              <TableCell>
                                <div className="font-medium">
                                  {person.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {person.email}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <span className="font-medium">
                                    {person.completedVideos} of {person.totalVideos} videos
                                  </span>
                                  <div className="w-32">
                                    <Progress value={person.completionPercentage} className="h-2" />
                                  </div>
                                  <Badge 
                                    variant={
                                      person.completionPercentage === 100 
                                        ? "default" 
                                        : person.completionPercentage > 50 
                                        ? "secondary" 
                                        : "outline"
                                    }
                                    className={
                                      person.completionPercentage === 100 
                                        ? "bg-green-500" 
                                        : ""
                                    }
                                  >
                                    {person.completionPercentage}% Complete
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="font-medium text-lg">
                                  {person.averageScore > 0 
                                    ? `${person.averageScore}%` 
                                    : '-'
                                  }
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {person.totalQuizzes > 0 
                                    ? `From ${person.totalQuizzes} quiz${person.totalQuizzes > 1 ? 'zes' : ''}` 
                                    : 'No quizzes taken'
                                  }
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
