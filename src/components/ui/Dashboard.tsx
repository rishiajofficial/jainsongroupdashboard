
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{ email: string; fullName: string } | null>(null);

  useEffect(() => {
    // Load user data from Supabase
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (data) {
          setUserData({
            fullName: data.full_name || "",
            email: data.email || "",
          });
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome to HiringDash</h2>
        <p className="text-muted-foreground">
          Manage your hiring process efficiently
        </p>
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Home</CardTitle>
          <CardDescription>
            {isLoading 
              ? "Loading..." 
              : userData 
                ? `Welcome back, ${userData.fullName || userData.email}` 
                : "Welcome to your dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is your HiringDash dashboard home. You can manage your hiring process from here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
