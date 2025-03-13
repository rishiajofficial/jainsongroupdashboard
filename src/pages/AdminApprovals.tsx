import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ApprovalRequest {
  id: string;
  manager_id: string;
  status: string;
  created_at: string;
  approved_by: string | null;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    company: string | null;
    position: string | null;
  }
}

const AdminApprovals = () => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovalRequests();
  }, []);

  const fetchApprovalRequests = async () => {
    try {
      setIsLoading(true);
      
      // Get manager approvals and join with profiles data
      const { data, error } = await supabase
        .from('manager_approvals')
        .select(`
          *,
          user: profiles!manager_approvals_manager_id_fkey(
            id, full_name, email, role, company, position
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const typedRequests = data as ApprovalRequest[] || [];
      setApprovalRequests(typedRequests);
    } catch (error) {
      console.error('Error fetching approval requests:', error);
      toast.error('Failed to load approval requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string, userId: string) => {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Update the approval request
      const { error: updateError } = await supabase
        .from('manager_approvals')
        .update({ 
          status: 'approved',
          approved_by: user.id
        })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setApprovalRequests(approvalRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'approved', approved_by: user.id } 
          : request
      ));
      
      toast.success('Request approved successfully');
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Update the approval request
      const { error: updateError } = await supabase
        .from('manager_approvals')
        .update({ 
          status: 'rejected',
          approved_by: user.id
        })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setApprovalRequests(approvalRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected', approved_by: user.id } 
          : request
      ));
      
      toast.success('Request rejected successfully');
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="ml-1 capitalize">
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Rejected
        </Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>;
    }
  };

  return (
    <div className="min-h-screen flex">
      <SideNav role="admin" />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Role Approval Requests</CardTitle>
                  <CardDescription>
                    Approve or reject user role change requests
                  </CardDescription>
                </div>
                <Button 
                  onClick={fetchApprovalRequests}
                  variant="outline"
                  disabled={isLoading}
                >
                  Refresh Requests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Requested Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvalRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <AlertCircle className="h-8 w-8 mb-2" />
                              <p>No approval requests found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        approvalRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.user?.full_name || 'N/A'}</TableCell>
                            <TableCell>{request.user?.email || 'N/A'}</TableCell>
                            <TableCell>{request.user?.company || 'N/A'}</TableCell>
                            <TableCell>{request.user?.position || 'N/A'}</TableCell>
                            <TableCell className="capitalize">{request.user?.role || 'N/A'}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              {new Date(request.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {request.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleApprove(request.id, request.manager_id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleReject(request.id)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovals;
