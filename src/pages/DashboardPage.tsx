
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Dashboard } from "@/components/ui/Dashboard";
import { Header } from "@/components/ui/Header";
import { toast } from "sonner";
import { DashboardSettingsProvider } from "@/contexts/DashboardSettingsContext";
import { PageAccessProvider } from "@/contexts/PageAccessContext";
import { getCurrentSchema } from "@/utils/schemaUtils";

// This is the canonical UserRole type used throughout the application
// It matches the user_role enum in the Supabase database
export type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

const DashboardPage = () => {
  const [userRole, setUserRole] = useState<UserRole>('candidate');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }
        
        console.log("Current schema:", getCurrentSchema());
        
        // Check if we're coming from a schema switch and have user role info stored
        const schemaUserRole = localStorage.getItem('schema_switch_user_role');
        if (schemaUserRole) {
          console.log("Using stored user role from schema switch:", schemaUserRole);
          setUserRole(schemaUserRole as UserRole);
          
          // Now try to get or create the profile in the new schema
          try {
            // Check if profile exists
            const { data: existingProfile, error: profileError } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', session.user.id)
              .single();
            
            if (profileError || !existingProfile) {
              console.log("Profile not found in new schema. Creating profile...");
              // Create a profile in the new schema with the role from the previous schema
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  role: schemaUserRole as UserRole,
                  full_name: session.user.user_metadata?.full_name || ''
                });
                
              if (insertError) {
                console.error("Error creating profile in new schema:", insertError);
                toast.error("Failed to create profile in new schema. Using fallback role.");
              } else {
                console.log("Successfully created profile in new schema");
                // Now fetch the profile again to confirm it was created
                const { data: createdProfile } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('id', session.user.id)
                  .single();
                  
                if (createdProfile) {
                  console.log("Confirmed role in new schema:", createdProfile.role);
                }
              }
            } else {
              console.log("Found existing profile in schema with role:", existingProfile.role);
              
              // If the profile exists but has a different role than what we expect,
              // update it to match the stored role (this is to fix data inconsistency issues)
              if (existingProfile.role !== schemaUserRole) {
                console.log(`Role mismatch: profile has ${existingProfile.role} but stored role is ${schemaUserRole}. Updating...`);
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ role: schemaUserRole })
                  .eq('id', session.user.id);
                
                if (updateError) {
                  console.error("Error updating profile role:", updateError);
                }
              }
            }
          } catch (error) {
            console.error("Error handling profile after schema switch:", error);
          }
          
          // Clear the schema switch info
          localStorage.removeItem('schema_switch_user_id');
          localStorage.removeItem('schema_switch_user_role');
          
          setIsLoading(false);
          return;
        }
        
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          console.log("User ID:", session.user.id);
          toast.error("Failed to load profile data");
          return;
        }
        
        if (profileData?.role) {
          console.log("Setting user role from profile:", profileData.role);
          setUserRole(profileData.role || 'candidate');
        } else {
          console.log("No role found in profile, defaulting to candidate");
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  return (
    <PageAccessProvider>
      <DashboardSettingsProvider>
        <div className="min-h-screen flex">
          <SideNav role={userRole} />
          <div className="flex-1">
            <Header />
            <Dashboard />
          </div>
        </div>
      </DashboardSettingsProvider>
    </PageAccessProvider>
  );
};

export default DashboardPage;
