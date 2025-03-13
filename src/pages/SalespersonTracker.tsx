
import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MapPin, CheckCircle, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Geolocation } from '@capacitor/geolocation';
import { Json } from "@/integrations/supabase/types";

// Type that matches what's coming from Supabase
interface SupabaseShopVisit {
  id: string;
  location: Json;
  audio_url?: string | null;
  created_at: string;
  salesperson_id: string;
  shop_name: string;
  notes?: string | null;
  status: 'pending' | 'completed' | 'failed';
  updated_at: string;
}

// Type for our application's internal use
interface ShopVisit {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  audio_url?: string;
  created_at: string;
  salesperson_id: string;
  shop_name: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
}

// Function to convert from Supabase type to our type
const convertSupabaseVisit = (visit: SupabaseShopVisit): ShopVisit => {
  // Parse the JSON location data
  let locationObj = typeof visit.location === 'string' 
    ? JSON.parse(visit.location) 
    : visit.location;
  
  return {
    id: visit.id,
    location: {
      latitude: locationObj.latitude,
      longitude: locationObj.longitude,
      address: locationObj.address
    },
    audio_url: visit.audio_url || undefined,
    created_at: visit.created_at,
    salesperson_id: visit.salesperson_id,
    shop_name: visit.shop_name,
    notes: visit.notes || undefined,
    status: visit.status
  };
};

const SalespersonTracker = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentVisit, setCurrentVisit] = useState<Partial<ShopVisit> | null>(null);
  const [shopName, setShopName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [todayVisits, setTodayVisits] = useState<ShopVisit[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Fetch today's visits on component mount
  useEffect(() => {
    fetchTodayVisits();
  }, []);

  const fetchTodayVisits = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from('shop_visits')
        .select('*')
        .eq('salesperson_id', session.session.user.id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Convert the data to our application's format
      const convertedData = data ? data.map(item => convertSupabaseVisit(item as SupabaseShopVisit)) : [];
      setTodayVisits(convertedData);
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast({
        title: "Error",
        description: "Failed to load today's visits",
        variant: "destructive",
      });
    }
  };

  const startVisit = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to track visits",
          variant: "destructive",
        });
        return;
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({ 
        enableHighAccuracy: true 
      });

      // Create a new visit record
      const newVisit = {
        salesperson_id: session.session.user.id,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        status: 'pending' as const,
        shop_name: shopName || 'Unnamed Shop',
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('shop_visits')
        .insert([newVisit])
        .select();

      if (error) throw error;

      // Convert the data to our application's format
      if (data && data.length > 0) {
        const convertedVisit = convertSupabaseVisit(data[0] as SupabaseShopVisit);
        setCurrentVisit(convertedVisit);
        toast({
          title: "Visit started",
          description: "Your location has been recorded",
        });
      }
    } catch (error) {
      console.error('Error starting visit:', error);
      toast({
        title: "Error",
        description: "Failed to start visit. Please check location permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!currentVisit) {
        toast({
          title: "No active visit",
          description: "Please start a visit first",
          variant: "destructive",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Recording completed",
        description: "Your pitch has been recorded",
      });
    }
  };

  const completeVisit = async () => {
    if (!currentVisit || !currentVisit.id) return;
    
    setIsLoading(true);
    
    try {
      // If there's an audio recording, upload it
      let audioUrl = null;
      
      if (audioBlob) {
        const fileName = `visit_${currentVisit.id}_${Date.now()}.webm`;
        const { error: uploadError, data } = await supabase.storage
          .from('salesperson_recordings')
          .upload(fileName, audioBlob);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('salesperson_recordings')
          .getPublicUrl(fileName);
          
        audioUrl = publicUrl;
      }
      
      // Update the visit record
      const { error } = await supabase
        .from('shop_visits')
        .update({ 
          status: 'completed',
          audio_url: audioUrl
        })
        .eq('id', currentVisit.id);
        
      if (error) throw error;
      
      toast({
        title: "Visit completed",
        description: "Your visit has been recorded successfully",
      });
      
      // Reset the state
      setCurrentVisit(null);
      setAudioBlob(null);
      setShopName("");
      
      // Refresh the list
      fetchTodayVisits();
      
    } catch (error) {
      console.error('Error completing visit:', error);
      toast({
        title: "Error",
        description: "Failed to complete visit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelVisit = async () => {
    if (!currentVisit || !currentVisit.id) return;
    
    try {
      // Update the visit status to failed
      const { error } = await supabase
        .from('shop_visits')
        .update({ status: 'failed' })
        .eq('id', currentVisit.id);
        
      if (error) throw error;
      
      // Reset the state
      setCurrentVisit(null);
      setAudioBlob(null);
      setShopName("");
      
      // Stop recording if active
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }
      
      toast({
        title: "Visit cancelled",
        description: "Your visit has been cancelled",
      });
      
      // Refresh the list
      fetchTodayVisits();
    } catch (error) {
      console.error('Error cancelling visit:', error);
      toast({
        title: "Error",
        description: "Failed to cancel visit",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Salesperson Tracker</h1>
              <p className="text-muted-foreground">Record your shop visits and sales pitches</p>
            </div>

            {/* Active Visit Card */}
            <Card className={currentVisit ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>New Shop Visit</CardTitle>
                <CardDescription>
                  {currentVisit 
                    ? "Visit in progress - record your sales pitch" 
                    : "Start a new shop visit by entering the shop name and clicking 'Start Visit'"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!currentVisit ? (
                    <div className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <label htmlFor="shop-name" className="text-sm font-medium">
                          Shop Name
                        </label>
                        <input
                          id="shop-name"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Enter shop name"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          disabled={!!currentVisit || isLoading}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>
                          Location recorded for {currentVisit.shop_name}
                        </span>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium text-sm mb-2">Sales Pitch Recording</h3>
                        <div className="flex items-center gap-3">
                          <Button
                            variant={isRecording ? "destructive" : "default"}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                          >
                            <Mic className="h-4 w-4" />
                            {isRecording ? "Stop Recording" : audioBlob ? "Record Again" : "Record Pitch"}
                          </Button>
                          
                          {audioBlob && (
                            <div className="text-sm text-primary font-medium flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Recording saved
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {!currentVisit ? (
                  <Button 
                    onClick={startVisit} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Start Visit
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex w-full gap-3">
                    <Button 
                      variant="outline" 
                      onClick={cancelVisit}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={completeVisit}
                      disabled={isLoading || isRecording}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Complete Visit
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Today's Visits */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">Today's Visits ({todayVisits.length})</h2>
              
              {todayVisits.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No shop visits recorded today
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {todayVisits.map((visit) => (
                    <Card key={visit.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{visit.shop_name}</CardTitle>
                          <div className="flex items-center">
                            {visit.status === 'completed' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                Completed
                              </span>
                            )}
                            {visit.status === 'pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                                In Progress
                              </span>
                            )}
                            {visit.status === 'failed' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                                Cancelled
                              </span>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatTime(visit.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Lat: {visit.location.latitude.toFixed(6)}, 
                              Long: {visit.location.longitude.toFixed(6)}
                            </span>
                          </div>
                          
                          {visit.audio_url && (
                            <div className="mt-2">
                              <h4 className="text-sm font-medium mb-1">Sales Pitch Recording</h4>
                              <audio controls src={visit.audio_url} className="w-full h-8" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalespersonTracker;
