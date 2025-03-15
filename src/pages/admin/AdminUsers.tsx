import { useState, useEffect } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  created_at: string;
  role: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, created_at, role");

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      // Delete user from auth.users
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

      // Delete user profile from public.profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
      if (profileError) throw profileError;

      // Optimistically update the UI
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      toast({
        description: "User deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role="admin" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage registered users and their roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div>Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => alert("Edit user")}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
