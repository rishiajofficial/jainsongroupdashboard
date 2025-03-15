import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";

type PageAccess = Database['public']['Tables']['page_access']['Row'];

export default function AdminPageAccess() {
  const [pageAccessList, setPageAccessList] = useState<PageAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string>('admin');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPageAccess = async () => {
      try {
        setIsLoading(true);

        // Get user session
        const { data: sessionData } = await supabase.auth.getSession();

        if (sessionData.session) {
          // Get user role
          const { data: userData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionData.session.user.id)
            .single();

          if (userData) {
            setRole(userData.role);
          }
        }

        const { data, error } = await supabase
          .from('page_access')
          .select('*');

        if (error) {
          throw error;
        }

        setPageAccessList(data || []);
      } catch (error: any) {
        console.error("Error fetching page access:", error);
        toast({
          description: "Failed to load page access settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageAccess();
  }, []);

  const updatePageAccess = async (id: string, is_active: boolean) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('page_access')
        .update({ is_active: !is_active })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setPageAccessList(currentList =>
        currentList.map(item => (item.id === id ? data : item))
      );

      toast({
        description: `Page access updated successfully`,
      });
    } catch (error: any) {
      console.error("Error updating page access:", error);
      toast({
        description: "Failed to update page access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Page Access Management</h1>
            <Card>
              <CardHeader>
                <CardTitle>Page Access Settings</CardTitle>
                <CardDescription>
                  Control which pages are accessible to different user roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-2 animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-8 w-12 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pageAccessList.map((page) => (
                      <div key={page.id} className="flex items-center justify-between py-2">
                        <Label htmlFor={page.id}>{page.page_name}</Label>
                        <Switch
                          id={page.id}
                          checked={page.is_active}
                          onCheckedChange={(checked) => {
                            if (checked !== undefined) {
                              updatePageAccess(page.id, page.is_active);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
