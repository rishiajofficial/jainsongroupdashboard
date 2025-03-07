
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'candidate' | 'manager' | 'admin';

export interface ProfileData {
  fullName: string;
  email: string;
  role: UserRole;
}

export function useUserProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', session.user.id)
          .single();

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          setError(new Error(fetchError.message));
          return;
        }

        if (data) {
          setUserData({
            fullName: data.full_name || "",
            email: data.email || "",
            role: data.role as UserRole,
          });
        }
      } catch (err) {
        console.error("Error in profile fetch:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { isLoading, userData, error };
}
