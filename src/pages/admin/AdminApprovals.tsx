
import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ApprovalRequest {
  id: string;
  created_at: string;
  status: string;
  manager_id: string;
  approved_by: string | null;
  manager_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

const AdminApprovals = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from("manager_approvals")
        .select(`
          id,
          created_at,
          status,
          manager_id,
          approved_by,
          manager_profile:profiles!manager_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching approvals:", error);
        toast.error("Failed to load approval requests");
        return;
      }

      setApprovals(data || []);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      toast.error("An error occurred while loading approval requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (id: string, approved: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      const { error } = await supabase
        .from('manager_approvals')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: session.user.id
        })
        .eq('id', id);

      if (error) {
        console.error("Error updating approval status:", error);
        toast.error("Failed to update approval status");
        return;
      }

      // Update local state
      setApprovals(approvals.map(approval => 
        approval.id === id 
          ? { 
              ...approval, 
              status: approved ? 'approved' : 'rejected',
              approved_by: session.user.id 
            } 
          : approval
      ));

      toast.success(`Manager request ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast.error("An error occurred while updating approval status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-500 text-white">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-8 animate-fade-up">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manager Approvals</h2>
            <p className="text-muted-foreground">
              Review and approve manager role requests
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : approvals.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Approvals</CardTitle>
                <CardDescription>
                  There are no manager approval requests at this time
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <Card key={approval.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle>{approval.manager_profile?.full_name || 'Unknown User'}</CardTitle>
                        <CardDescription className="mt-1">
                          {approval.manager_profile?.email || 'No email available'}
                        </CardDescription>
                      </div>
                      <div className="self-start sm:self-center">
                        {getStatusBadge(approval.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Requested on: </span>
                        {formatDate(approval.created_at)}
                      </div>
                      
                      {approval.status === 'pending' ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleApproval(approval.id, false)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleApproval(approval.id, true)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Status: </span>
                          {approval.status === 'approved' ? 'Approved' : 'Rejected'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminApprovals;
