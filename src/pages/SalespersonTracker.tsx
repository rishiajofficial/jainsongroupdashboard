import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layouts/MobileLayout";
import { Header } from "@/components/ui/header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  MapPin, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  StopCircle,
  Save
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Json } from "@/integrations/supabase/types";

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

const convertSupabaseVisit = (visit: SupabaseShopVisit): ShopVisit => {
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

export default function SalespersonTracker() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [shopName, setShopName] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    handleGeolocation();

    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  }, []);

  const handleGeolocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation(prev => ({ 
              ...prev,
              address: data.display_name
            }));
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            setLocationError("Error getting address");
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Error getting location");
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      );
    } else {
      setLocationError("Geolocation is not supported");
      setLocationLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setIsRecording(false);
        if (audioRef.current) {
          audioRef.current.src = url;
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        description: "Please allow microphone access",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const saveShopVisit = async () => {
    setIsSubmitting(true);
    try {
      if (!location) {
        toast({
          description: "Please enable location services",
          variant: "destructive",
        });
        return;
      }

      if (!shopName) {
        toast({
          description: "Please enter the shop name",
          variant: "destructive",
        });
        return;
      }

      let audio_url = null;
      if (audioURL) {
        const response = await fetch(audioURL);
        const blob = await response.blob();
        const audioFile = new File([blob], "sales_pitch.webm", { type: "audio/webm" });

        const { data, error } = await supabase.storage
          .from('shop_visit_recordings')
          .upload(`audio/${Date.now()}_${audioFile.name}`, audioFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;
        audio_url = supabase.storage.from('shop_visit_recordings').getPublicUrl(data.path).data.publicUrl;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          description: "Please log in to save the shop visit",
          variant: "destructive",
        });
        return;
      }

      const { error: insertError } = await supabase
        .from('shop_visits')
        .insert([
          {
            location: location,
            shop_name: shopName,
            notes: notes,
            audio_url: audio_url,
            salesperson_id: sessionData.session.user.id,
            status: 'completed'
          }
        ]);

      if (insertError) throw insertError;

      toast({
        description: "Your shop visit has been saved successfully",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving shop visit:", error);
      toast({
        description: "Could not save shop visit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return isMobile ? (
    <MobileLayout title="Track Shop Visit" backLink="/dashboard">
      <div className="space-y-6">
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Current Location</CardTitle>
            <CardDescription>
              {locationLoading && "Detecting location..."}
              {locationError && <AlertCircle className="mr-2 h-4 w-4 inline" />}
              {locationError && locationError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {location ? (
              <div className="space-y-1">
                <p className="text-sm">
                  <strong>Latitude:</strong> {location.latitude.toFixed(6)}
                </p>
                <p className="text-sm">
                  <strong>Longitude:</strong> {location.longitude.toFixed(6)}
                </p>
                {location.address && (
                  <p className="text-sm">
                    <strong>Address:</strong> {location.address}
                  </p>
                )}
                <Badge variant="secondary">
                  <MapPin className="mr-2 h-4 w-4" /> Detected
                </Badge>
              </div>
            ) : (
              <Button
                variant="outline"
                disabled={locationLoading}
                onClick={handleGeolocation}
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detect Location
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Detect Location
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
            <CardDescription>Enter details about the shop you are visiting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Shop Name</Label>
              <Input
                id="shop-name"
                placeholder="Enter shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any notes about the visit"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle>Sales Pitch Recording</CardTitle>
            <CardDescription>Record your sales pitch for quality assurance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audioURL ? (
                <div className="flex flex-col items-center space-y-2">
                  <audio controls src={audioURL} ref={audioRef} className="w-full" />
                  <Badge variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4" /> Recording saved
                  </Badge>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={locationError !== null}
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="mr-2 h-4 w-4 animate-pulse" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full mt-4" 
          size="lg"
          onClick={saveShopVisit}
          disabled={isSubmitting || !shopName || !location}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Shop Visit
            </>
          )}
        </Button>
      </div>
    </MobileLayout>
  ) : (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Track Shop Visit</h1>
            <p className="text-muted-foreground">Record your shop visits and sales pitches</p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Location</CardTitle>
                <CardDescription>
                  {locationLoading && "Detecting location..."}
                  {locationError && <AlertCircle className="mr-2 h-4 w-4 inline" />}
                  {locationError && locationError}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {location ? (
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Latitude:</strong> {location.latitude.toFixed(6)}
                    </p>
                    <p className="text-sm">
                      <strong>Longitude:</strong> {location.longitude.toFixed(6)}
                    </p>
                    {location.address && (
                      <p className="text-sm">
                        <strong>Address:</strong> {location.address}
                      </p>
                    )}
                    <Badge variant="secondary">
                      <MapPin className="mr-2 h-4 w-4" /> Detected
                    </Badge>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    disabled={locationLoading}
                    onClick={handleGeolocation}
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Detect Location
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Detect Location
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>Enter details about the shop you are visiting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-name">Shop Name</Label>
                  <Input
                    id="shop-name"
                    placeholder="Enter shop name"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any notes about the visit"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales Pitch Recording</CardTitle>
                <CardDescription>Record your sales pitch for quality assurance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audioURL ? (
                    <div className="flex flex-col items-center space-y-2">
                      <audio controls src={audioURL} ref={audioRef} className="w-full" />
                      <Badge variant="outline">
                        <CheckCircle className="mr-2 h-4 w-4" /> Recording saved
                      </Badge>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={locationError !== null}
                    >
                      {isRecording ? (
                        <>
                          <StopCircle className="mr-2 h-4 w-4 animate-pulse" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                onClick={saveShopVisit}
                disabled={isSubmitting || !shopName || !location}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Shop Visit
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
