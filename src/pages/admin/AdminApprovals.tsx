import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApprovalRequest {
  id: string;
  created_at: string;
  user_id: string;
  page_id: string;
  status: 'pending' | 'approved' | 'rejected';
  profiles: {
    full_name: string;
    email: string;
  };
  page_access: {
    label: string;
  };
}

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [role, setRole] = useState('admin');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

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
        .from('page_access_requests')
        .select(`
          id,
          created_at,
          user_id,
          page_id,
          status,
          profiles (full_name, email),
          page_access (label)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApprovals(data || []);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      toast({
        description: "Failed to fetch approval requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, approve: boolean) => {
    try {
      setLoading(true);
      const newStatus = approve ? 'approved' : 'rejected';

      const { error } = await supabase
        .from('page_access_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        description: `Request ${approve ? 'approved' : 'rejected'} successfully`,
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating approval:", error);
      toast({
        description: "Failed to update approval request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Approval Requests</h1>

            {loading ? (
              <Card className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ) : approvals.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Approval Requests</CardTitle>
                  <CardDescription>There are no pending approval requests.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {approvals.map((approval) => (
                  <Card key={approval.id}>
                    <CardHeader>
                      <CardTitle>{approval.profiles?.full_name}</CardTitle>
                      <CardDescription>
                        Request for access to {approval.page_access?.label}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Email: {approval.profiles?.email}</p>
                      <p>Requested on: {new Date(approval.created_at).toLocaleDateString()}</p>
                      <p>Status: {approval.status}</p>
                    </CardContent>
                    <div className="flex justify-end space-x-2 p-4">
                      {approval.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleApproval(approval.id, false)}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApproval(approval.id, true)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
