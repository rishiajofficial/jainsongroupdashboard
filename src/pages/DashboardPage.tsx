
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Dashboard } from "@/components/ui/Dashboard";
import { Header } from "@/components/ui/Header";
import { toast } from "sonner";
import { DashboardSettingsProvider } from "@/contexts/DashboardSettingsContext";
import { PageAccessProvider } from "@/contexts/PageAccessContext";
import { 
  getCurrentSchema, 
  forceResetToPublicSchema, 
  verifySchemaAccess 
} from "@/utils/schemaUtils";

// This is the canonical UserRole type used throughout the application
// It matches the user_role enum in the Supabase database
export type UserRole = 'candidate' | 'salesperson' | 'manager' | 'admin';

const DashboardPage = () => {
  const [userRole, setUserRole] = useState<UserRole>('candidate');
  const [isLoading, setIsLoading] = useState(true);
  const [schemaError, setSchemaError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // First check if we can access the current schema
        const schemaAccessible = await verifySchemaAccess();
        
        if (!schemaAccessible) {
          console.error("Schema not accessible, showing error screen");
          setSchemaError(true);
          setIsLoading(false);
          return;
        }
        
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }
        
        const currentSchema = getCurrentSchema();
        console.log("Current schema:", currentSchema);
        
        // Check if we're coming from a schema switch and have user role info stored
        const schemaUserRole = localStorage.getItem('schema_switch_user_role');
        if (schemaUserRole) {
          console.log("Using stored user role from schema switch:", schemaUserRole);
          
          // Validate that the stored role is a valid UserRole
          const validRoles: UserRole[] = ['admin', 'candidate', 'salesperson', 'manager'];
          const validRole: UserRole = validRoles.includes(schemaUserRole as UserRole) 
            ? (schemaUserRole as UserRole) 
            : 'candidate';
            
          setUserRole(validRole);
          
          // Now try to get or create the profile in the new schema
          try {
            // Check if profile exists
            const { data: existingProfile, error: profileError } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', data.session.user.id)
              .single();
            
            if (profileError || !existingProfile) {
              console.log("Profile not found in new schema. Creating profile...");
              // Create a profile in the new schema with the role from the previous schema
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.session.user.id,
                  email: data.session.user.email,
                  role: validRole,
                  full_name: data.session.user.user_metadata?.full_name || ''
                });
                
              if (insertError) {
                console.error("Error creating profile in new schema:", insertError);
                toast.error("Failed to create profile in new schema. Using fallback role.");
                
                // If there's an error creating a profile, set a schema error flag
                setSchemaError(true);
              } else {
                console.log("Successfully created profile in new schema");
                // Now fetch the profile again to confirm it was created
                const { data: createdProfile } = await supabase
                  .from('profiles')
                  .select('role')
                  .eq('id', data.session.user.id)
                  .single();
                  
                if (createdProfile && createdProfile.role) {
                  console.log("Confirmed role in new schema:", createdProfile.role);
                }
              }
            } else if (existingProfile && existingProfile.role) {
              console.log("Found existing profile in schema with role:", existingProfile.role);
              
              // If the profile exists but has a different role than what we expect,
              // update it to match the stored role (this is to fix data inconsistency issues)
              if (existingProfile.role !== validRole) {
                console.log(`Role mismatch: profile has ${existingProfile.role} but stored role is ${schemaUserRole}. Updating...`);
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ role: validRole })
                  .eq('id', data.session.user.id);
                
                if (updateError) {
                  console.error("Error updating profile role:", updateError);
                  setSchemaError(true);
                }
              }
            }
          } catch (error) {
            console.error("Error handling profile after schema switch:", error);
            setSchemaError(true);
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
          .eq('id', data.session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          console.log("User ID:", data.session.user.id);
          toast.error("Failed to load profile data");
          setSchemaError(true);
          return;
        }
        
        if (profileData && profileData.role) {
          console.log("Setting user role from profile:", profileData.role);
          // Ensure role is a valid UserRole type
          const validRoles: UserRole[] = ['admin', 'candidate', 'salesperson', 'manager'];
          const validRole: UserRole = validRoles.includes(profileData.role as UserRole)
            ? (profileData.role as UserRole)
            : 'candidate';
          setUserRole(validRole);
        } else {
          console.log("No role found in profile, defaulting to candidate");
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Failed to load dashboard data");
        setSchemaError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

  // If there's a schema error, show a button to force reset to public schema
  if (schemaError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Schema Error</h1>
          <p className="text-gray-700 mb-6">
            There was an error loading your profile data. This may be due to a schema configuration issue.
          </p>
          <p className="text-gray-600 mb-6">
            Current schema: <span className="font-semibold">{getCurrentSchema()}</span>
          </p>
          <button
            onClick={() => forceResetToPublicSchema()}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
          >
            Reset to Public Schema
          </button>
          <p className="text-sm text-gray-500 mt-4">
            This will clear schema-related data and log you out.
          </p>
        </div>
      </div>
    );
  }

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
