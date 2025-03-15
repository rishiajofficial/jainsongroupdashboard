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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { usePageAccess } from "@/contexts/PageAccessContext";
import { PageAccessRule, CONFIGURABLE_PAGES } from "@/types/pageAccess";
import { UserRole } from "@/pages/DashboardPage";
import { AlertCircle, Lock, RefreshCcw, Settings2, Check, X } from "lucide-react";
import { toast } from "sonner";

const SelectAllControl = ({ role, filteredRules }: { role: UserRole, filteredRules: PageAccessRule[] }) => {
  const { bulkUpdateRolesAccess } = usePageAccess();
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  useEffect(() => {
    if (filteredRules.length > 0) {
      const allSelected = filteredRules.every(rule => 
        rule.allowed_roles.includes(role as UserRole)
      );
      setIsAllSelected(allSelected);
    }
  }, [filteredRules, role]);
  
  const handleSelectAll = async () => {
    await bulkUpdateRolesAccess(role as UserRole, !isAllSelected);
  };
  
  return (
    <div className="flex items-center mb-4 justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSelectAll}
        className="text-xs"
      >
        {isAllSelected ? (
          <>
            <X className="mr-1 h-3 w-3" />
            Deselect All
          </>
        ) : (
          <>
            <Check className="mr-1 h-3 w-3" />
            Select All
          </>
        )}
      </Button>
    </div>
  );
};

const RoleToggle = ({ rule, role }: { rule: PageAccessRule, role: UserRole }) => {
  const { updateRule } = usePageAccess();
  const isEnabled = rule.allowed_roles.includes(role);

  const toggleRoleAccess = async () => {
    try {
      const newAllowedRoles = isEnabled
        ? rule.allowed_roles.filter(r => r !== role)
        : [...rule.allowed_roles, role];
      
      await updateRule(rule.id, { allowed_roles: newAllowedRoles });
    } catch (error) {
      console.error("Error updating role access:", error);
    }
  };

  return (
    <Checkbox
      checked={isEnabled}
      onCheckedChange={toggleRoleAccess}
      aria-label={`Toggle ${role} access`}
    />
  );
};

export default function AdminPageAccess() {
  const { 
    accessRules, 
    isLoading, 
    refreshRules, 
    updateRule, 
    createDefaultRulesIfNeeded 
  } = usePageAccess();
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filteredRules, setFilteredRules] = useState<PageAccessRule[]>([]);
  const [visibleRoles, setVisibleRoles] = useState<UserRole[]>(['admin', 'manager', 'salesperson', 'candidate']);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredRules(accessRules);
      setVisibleRoles(['admin', 'manager', 'salesperson', 'candidate']);
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
      setVisibleRoles([roleFilter]);
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
                    Page Visibility Control
                  </CardTitle>
                  <CardDescription>
                    Control which pages are visible in navigation for different user roles
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
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
                    It looks like page visibility rules haven't been set up yet.
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
                
                  {activeTab !== "all" && (
                    <SelectAllControl 
                      role={activeTab as UserRole} 
                      filteredRules={filteredRules} 
                    />
                  )}
                
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Page</TableHead>
                          <TableHead className="w-[300px]">Description</TableHead>
                          <TableHead className="text-center">Enable/Disable</TableHead>
                          {visibleRoles.includes('admin') && (
                            <TableHead className="text-center">Admin</TableHead>
                          )}
                          {visibleRoles.includes('manager') && (
                            <TableHead className="text-center">Manager</TableHead>
                          )}
                          {visibleRoles.includes('salesperson') && (
                            <TableHead className="text-center">Salesperson</TableHead>
                          )}
                          {visibleRoles.includes('candidate') && (
                            <TableHead className="text-center">Candidate</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRules.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
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
                              {visibleRoles.includes('admin') && (
                                <TableCell className="text-center">
                                  <RoleToggle rule={rule} role="admin" />
                                </TableCell>
                              )}
                              {visibleRoles.includes('manager') && (
                                <TableCell className="text-center">
                                  <RoleToggle rule={rule} role="manager" />
                                </TableCell>
                              )}
                              {visibleRoles.includes('salesperson') && (
                                <TableCell className="text-center">
                                  <RoleToggle rule={rule} role="salesperson" />
                                </TableCell>
                              )}
                              {visibleRoles.includes('candidate') && (
                                <TableCell className="text-center">
                                  <RoleToggle rule={rule} role="candidate" />
                                </TableCell>
                              )}
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
}
