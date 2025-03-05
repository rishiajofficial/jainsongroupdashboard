
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, Calendar, CreditCard, DollarSign, Users, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: "$45,231.89",
    subscriptions: "+2,350",
    sales: "+12,234",
    activeUsers: "+573",
  });

  // User profile state
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    company: "",
    position: "",
  });

  useEffect(() => {
    // Simulate data loading for stats
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Load user profile data from Supabase
    fetchUserProfile();

    return () => clearTimeout(timer);
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
        });
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
        .upsert({
          id: session.user.id,
          full_name: userProfile.fullName,
          email: userProfile.email,
          company: userProfile.company,
          position: userProfile.position,
          updated_at: new Date()
        });

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

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your dashboard overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={stats.totalRevenue}
          description="Last 30 days"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatsCard
          title="Subscriptions"
          value={stats.subscriptions}
          description="From previous month"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatsCard
          title="Sales"
          value={stats.sales}
          description="From previous month"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          description="From previous month"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter>
          <Button onClick={saveProfile} className="w-full sm:w-auto" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded-md">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <BarChart className="h-[200px] w-[200px] text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chart visualization would appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              You have {isLoading ? "..." : "14"} activities this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
                      <div className="h-4 w-[160px] bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-muted bg-muted/50">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Meeting with team</p>
                    <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-muted bg-muted/50">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">New user registered</p>
                    <p className="text-sm text-muted-foreground">Yesterday at 2:30 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-muted bg-muted/50">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">New subscription</p>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, description, icon, loading }: { 
  title: string, 
  value: string, 
  description: string, 
  icon: React.ReactNode,
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <div className="h-7 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded mt-1" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
