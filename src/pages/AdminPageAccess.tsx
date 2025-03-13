
import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePageAccess } from "@/contexts/PageAccessContext";
import { PageAccessRule, CONFIGURABLE_PAGES } from "@/types/pageAccess";
import { UserRole } from "@/pages/DashboardPage";
import { AlertCircle, Lock, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";

const AdminPageAccess = () => {
  const { 
    accessRules, 
    isLoading, 
    refreshRules, 
    updateRule, 
    createDefaultRulesIfNeeded 
  } = usePageAccess();
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filteredRules, setFilteredRules] = useState<PageAccessRule[]>([]);

  useEffect(() => {
    // Filter rules based on active tab
    if (activeTab === "all") {
      setFilteredRules(accessRules);
    } else {
      const roleFilter = activeTab as UserRole;
      setFilteredRules(
        accessRules.filter(rule => 
          CONFIGURABLE_PAGES.find(page => 
            page.path === rule.page_path && 
            page.defaultRoles.includes(roleFilter)
          )
        )
      );
    }
  }, [accessRules, activeTab]);

  const handleInitialize = async () => {
    try {
      await createDefaultRulesIfNeeded();
      toast.success("Page access rules initialized successfully");
    } catch (error) {
      console.error("Error initializing rules:", error);
    }
  };

  const togglePageEnabled = async (rule: PageAccessRule) => {
    try {
      await updateRule(rule.id, { is_enabled: !rule.is_enabled });
    } catch (error) {
      console.error("Error toggling page access:", error);
    }
  };

  const toggleRoleAccess = async (rule: PageAccessRule, role: UserRole) => {
    try {
      const hasRole = rule.allowed_roles.includes(role);
      
      // Create a new array of allowed roles
      const newAllowedRoles = hasRole
        ? rule.allowed_roles.filter(r => r !== role)
        : [...rule.allowed_roles, role];
      
      // Ensure we don't remove all roles
      if (newAllowedRoles.length === 0) {
        toast.error("At least one role must have access to this page");
        return;
      }
      
      await updateRule(rule.id, { allowed_roles: newAllowedRoles });
    } catch (error) {
      console.error("Error updating role access:", error);
    }
  };

  const getPageDescription = (path: string): string => {
    const pageConfig = CONFIGURABLE_PAGES.find(page => page.path === path);
    return pageConfig?.description || "Page description not available";
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
                  <CardTitle className="text-2xl font-bold flex items-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Page Access Control
                  </CardTitle>
                  <CardDescription>
                    Control which user roles can access specific pages
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleInitialize}
                    variant="outline"
                    size="sm"
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Initialize Default Rules
                  </Button>
                  <Button 
                    onClick={() => refreshRules()}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : accessRules.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Access Rules Found</h3>
                  <p className="text-muted-foreground mb-4">
                    It looks like page access rules haven't been set up yet.
                  </p>
                  <Button onClick={handleInitialize}>
                    Initialize Default Access Rules
                  </Button>
                </div>
              ) : (
                <>
                  <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="all">All Pages</TabsTrigger>
                      <TabsTrigger value="admin">Admin</TabsTrigger>
                      <TabsTrigger value="manager">Manager</TabsTrigger>
                      <TabsTrigger value="salesperson">Salesperson</TabsTrigger>
                      <TabsTrigger value="candidate">Candidate</TabsTrigger>
                    </TabsList>
                  </Tabs>
                
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Page</TableHead>
                          <TableHead className="w-[300px]">Description</TableHead>
                          <TableHead className="text-center">Enable/Disable</TableHead>
                          <TableHead className="text-center">Admin</TableHead>
                          <TableHead className="text-center">Manager</TableHead>
                          <TableHead className="text-center">Salesperson</TableHead>
                          <TableHead className="text-center">Candidate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRules.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <p>No pages found for this filter</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRules.map((rule) => (
                            <TableRow key={rule.id}>
                              <TableCell className="font-medium">{rule.page_name}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {getPageDescription(rule.page_path)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={rule.is_enabled}
                                  onCheckedChange={() => togglePageEnabled(rule)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <ToggleGroup type="single" value={rule.allowed_roles.includes('admin') ? 'on' : 'off'}>
                                  <ToggleGroupItem 
                                    value="on" 
                                    onClick={() => toggleRoleAccess(rule, 'admin')}
                                    aria-label="Toggle admin access"
                                    className={rule.allowed_roles.includes('admin') ? 'bg-green-100 text-green-800 data-[state=on]:bg-green-200' : ''}
                                  >
                                    {rule.allowed_roles.includes('admin') ? '✓' : '×'}
                                  </ToggleGroupItem>
                                </ToggleGroup>
                              </TableCell>
                              <TableCell className="text-center">
                                <ToggleGroup type="single" value={rule.allowed_roles.includes('manager') ? 'on' : 'off'}>
                                  <ToggleGroupItem 
                                    value="on" 
                                    onClick={() => toggleRoleAccess(rule, 'manager')}
                                    aria-label="Toggle manager access"
                                    className={rule.allowed_roles.includes('manager') ? 'bg-green-100 text-green-800 data-[state=on]:bg-green-200' : ''}
                                  >
                                    {rule.allowed_roles.includes('manager') ? '✓' : '×'}
                                  </ToggleGroupItem>
                                </ToggleGroup>
                              </TableCell>
                              <TableCell className="text-center">
                                <ToggleGroup type="single" value={rule.allowed_roles.includes('salesperson') ? 'on' : 'off'}>
                                  <ToggleGroupItem 
                                    value="on" 
                                    onClick={() => toggleRoleAccess(rule, 'salesperson')}
                                    aria-label="Toggle salesperson access"
                                    className={rule.allowed_roles.includes('salesperson') ? 'bg-green-100 text-green-800 data-[state=on]:bg-green-200' : ''}
                                  >
                                    {rule.allowed_roles.includes('salesperson') ? '✓' : '×'}
                                  </ToggleGroupItem>
                                </ToggleGroup>
                              </TableCell>
                              <TableCell className="text-center">
                                <ToggleGroup type="single" value={rule.allowed_roles.includes('candidate') ? 'on' : 'off'}>
                                  <ToggleGroupItem 
                                    value="on" 
                                    onClick={() => toggleRoleAccess(rule, 'candidate')}
                                    aria-label="Toggle candidate access"
                                    className={rule.allowed_roles.includes('candidate') ? 'bg-green-100 text-green-800 data-[state=on]:bg-green-200' : ''}
                                  >
                                    {rule.allowed_roles.includes('candidate') ? '✓' : '×'}
                                  </ToggleGroupItem>
                                </ToggleGroup>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPageAccess;
