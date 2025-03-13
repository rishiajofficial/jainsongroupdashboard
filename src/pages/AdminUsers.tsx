
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, UserCog, UserPlus, Trash2, PenSquare } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/pages/DashboardPage";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company?: string;
  position?: string;
}

interface NewUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  company?: string;
  position?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState<NewUserData>({
    email: "",
    password: "",
    full_name: "",
    role: "candidate",
    company: "",
    position: ""
  });
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching users...");
      
      // Using a direct query without filters to get all users
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      console.log("Fetched users:", data?.length);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const createUser = async () => {
    try {
      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name,
            role: newUser.role,
            company: newUser.company || null,
            position: newUser.position || null
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // Update the profiles table if needed (should happen automatically via trigger)
      if (newUser.company || newUser.position) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            company: newUser.company,
            position: newUser.position
          })
          .eq('id', authData.user?.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      
      // Reset the form
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "candidate",
        company: "",
        position: ""
      });
      
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: selectedUser.full_name,
          company: selectedUser.company,
          position: selectedUser.position,
          role: selectedUser.role
        })
        .eq('id', selectedUser.id);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...selectedUser } : user
      ));
      
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete from auth (this will cascade to profiles due to the foreign key constraint)
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user. Note: Only superadmins can delete users.');
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'salesperson':
        return 'secondary';
      case 'candidate':
      default:
        return 'outline';
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
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
                  <CardTitle className="text-2xl font-bold">User Management</CardTitle>
                  <CardDescription>
                    View and manage all users in the system
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        <span>New User</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                          Add a new user to the system. They will receive an email to confirm their account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="full_name" className="text-right">
                            Full Name
                          </Label>
                          <Input
                            id="full_name"
                            value={newUser.full_name}
                            onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                            Password
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                            Role
                          </Label>
                          <Select 
                            value={newUser.role} 
                            onValueChange={(value) => setNewUser({...newUser, role: value as UserRole})}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="candidate">Candidate</SelectItem>
                              <SelectItem value="salesperson">Salesperson</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="company" className="text-right">
                            Company
                          </Label>
                          <Input
                            id="company"
                            value={newUser.company || ''}
                            onChange={(e) => setNewUser({...newUser, company: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="position" className="text-right">
                            Position
                          </Label>
                          <Input
                            id="position"
                            value={newUser.position || ''}
                            onChange={(e) => setNewUser({...newUser, position: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={createUser}>Create User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    onClick={fetchUsers}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Refresh Users
                  </Button>
                </div>
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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <AlertCircle className="h-8 w-8 mb-2" />
                              <p>No users found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.company || 'N/A'}</TableCell>
                            <TableCell>{user.position || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Select
                                  value={user.role}
                                  onValueChange={(value) => 
                                    updateUserRole(user.id, value as UserRole)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="candidate">Candidate</SelectItem>
                                    <SelectItem value="salesperson">Salesperson</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <PenSquare className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
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
          
          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_full_name" className="text-right">
                      Full Name
                    </Label>
                    <Input
                      id="edit_full_name"
                      value={selectedUser.full_name || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="edit_email"
                      value={selectedUser.email || ''}
                      disabled
                      className="col-span-3 bg-muted"
                    />
                    <div className="col-span-4 text-xs text-muted-foreground ml-auto w-3/4">
                      Email cannot be changed. Create a new user instead.
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_role" className="text-right">
                      Role
                    </Label>
                    <Select 
                      value={selectedUser.role} 
                      onValueChange={(value) => setSelectedUser({...selectedUser, role: value as UserRole})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candidate">Candidate</SelectItem>
                        <SelectItem value="salesperson">Salesperson</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_company" className="text-right">
                      Company
                    </Label>
                    <Input
                      id="edit_company"
                      value={selectedUser.company || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, company: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit_position" className="text-right">
                      Position
                    </Label>
                    <Input
                      id="edit_position"
                      value={selectedUser.position || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, position: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={updateUser}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Delete User Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="py-4">
                  <p className="mb-2"><strong>Name:</strong> {selectedUser.full_name || 'N/A'}</p>
                  <p className="mb-2"><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={deleteUser}>Delete User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
