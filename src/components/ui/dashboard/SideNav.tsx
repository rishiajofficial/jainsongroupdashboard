import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, GraduationCap, Briefcase, Users, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  roles: string[];
}

interface SideNavProps {
  role: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', roles: ['salesperson', 'manager', 'admin'] },
  { id: 'training', label: 'Training Videos', icon: GraduationCap, path: '/training', roles: ['salesperson', 'manager'] },
  { id: 'jobs', label: 'Job Postings', icon: Briefcase, path: '/jobs', roles: ['salesperson'] },
  { id: 'applications', label: 'My Applications', icon: Users, path: '/applications', roles: ['salesperson'] },
  { id: 'admin-approvals', label: 'Approvals', icon: Users, path: '/admin/approvals', roles: ['admin'] },
  { id: 'admin-users', label: 'Manage Users', icon: Users, path: '/admin/users', roles: ['admin'] },
  { id: 'admin-settings', label: 'Dashboard Settings', icon: Settings, path: '/admin/settings', roles: ['admin'] },
  { id: 'admin-page-access', label: 'Page Access', icon: Settings, path: '/admin/page-access', roles: ['admin'] },
];

export function SideNav({ role }: SideNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      setUser(session.session?.user);
    };

    fetchUser();
  }, []);

  const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        description: "Signed out successfully",
      });
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col w-64 border-r flex-shrink-0">
      <div className="flex-1 flex flex-col space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Acme Co.</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-1">
          {filteredNavItems.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "justify-start",
                location.pathname === item.path ? "font-semibold" : "text-muted-foreground",
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
