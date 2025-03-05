
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ManagerRequest {
  id: string;
  created_at: string;
  manager_id: string;
  status: string;
  manager: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

const AdminApprovals = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<ManagerRequest[]>([]);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
    fetchManagerRequests();
  }, []);

  // Check if current user is an admin
  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        toast.error("Failed to verify admin status");
        navigate("/dashboard");
        return;
      }

      if (data.role !== 'admin') {
        toast.error("You do not have permission to access this page");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("An error occurred");
      navigate("/dashboard");
    }
  };

  // Fetch pending manager approval requests
  const fetchManagerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('manager_approvals')
        .select(`
          id,
          created_at,
          manager_id,
          status,
          manager:profiles(full_name, email, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching manager requests:", error);
        toast.error("Failed to load manager requests");
        return;
      }

      setRequests(data as ManagerRequest[]);
    } catch (error) {
      console.error("Error fetching manager requests:", error);
      toast.error("Failed to load manager requests");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approval or rejection of manager request
  const handleApproval = async (requestId: string, managerId: string, approve: boolean) => {
    setProcessingIds(prev => [...prev, requestId]);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      const { error } = await supabase
        .from('manager_approvals')
        .update({
          status: approve ? 'approved' : 'rejected',
          approved_by: session.user.id
        })
        .eq('id', requestId);

      if (error) {
        console.error("Error updating manager request:", error);
        toast.error(`Failed to ${approve ? 'approve' : 'reject'} request`);
        return;
      }

      // If the request was rejected, we need to manually update the UI
      // as the trigger only handles approvals
      toast.success(`Request ${approve ? 'approved' : 'rejected'} successfully`);
      
      // Remove the processed request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("Error processing manager request:", error);
      toast.error("An error occurred while processing the request");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  // Helper function to get avatar URL for a profile
  const getAvatarUrl = async (avatarPath: string | null) => {
    if (!avatarPath) return null;
    
    try {
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(avatarPath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error getting avatar URL:", error);
      return null;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground mt-2">
                You do not have permission to access this page.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="space-y-8 animate-fade-up">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manager Approval Requests</h2>
            <p className="text-muted-foreground">
              Review and approve requests from users who want to become managers
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Requests</CardTitle>
                <CardDescription>
                  There are currently no pending manager approval requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  New requests will appear here when users request manager access.
                </p>
                <Button 
                  onClick={() => navigate("/dashboard")} 
                  className="mt-4"
                  variant="outline"
                >
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Manager Role Request</CardTitle>
                        <CardDescription>
                          Submitted on {formatDate(request.created_at)}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2 mt-4 sm:mt-0">
                        <Button
                          onClick={() => handleApproval(request.id, request.manager_id, true)}
                          disabled={processingIds.includes(request.id)}
                          className="w-full sm:w-auto"
                          variant="default"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleApproval(request.id, request.manager_id, false)}
                          disabled={processingIds.includes(request.id)}
                          className="w-full sm:w-auto"
                          variant="destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={request.manager.avatar_url ? 
                            supabase.storage.from('avatars').getPublicUrl(request.manager.avatar_url).data.publicUrl : ""} 
                          alt="User" 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {request.manager.full_name?.charAt(0) || request.manager.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.manager.full_name || "No name provided"}</p>
                        <p className="text-sm text-muted-foreground">{request.manager.email}</p>
                      </div>
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
