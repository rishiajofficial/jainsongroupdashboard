
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
import { useDashboardSettings, DEFAULT_DASHBOARD_WIDGETS } from "@/contexts/DashboardSettingsContext";
import { UserRole } from "@/pages/DashboardPage";
import { AlertCircle, LayoutDashboard, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const AdminDashboardSettings = () => {
  const { 
    widgetSettings,
    isLoading,
    refreshSettings,
    updateWidgetSetting,
    createDefaultSettingsIfNeeded
  } = useDashboardSettings();
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filteredWidgets, setFilteredWidgets] = useState(widgetSettings);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredWidgets(widgetSettings);
    } else if (activeTab === "stats") {
      setFilteredWidgets(widgetSettings.filter(widget => widget.widget_type === 'stats'));
    } else if (activeTab === "actions") {
      setFilteredWidgets(widgetSettings.filter(widget => widget.widget_type === 'actions'));
    } else if (activeTab === "info") {
      setFilteredWidgets(widgetSettings.filter(widget => widget.widget_type === 'info'));
    }
  }, [widgetSettings, activeTab]);

  const handleInitialize = async () => {
    try {
      await createDefaultSettingsIfNeeded();
    } catch (error) {
      console.error("Error initializing widgets:", error);
    }
  };

  const toggleWidgetEnabled = async (widget: any) => {
    try {
      await updateWidgetSetting(widget.id, { is_visible: !widget.is_visible });
    } catch (error) {
      console.error("Error toggling widget visibility:", error);
    }
  };

  const toggleRoleAccess = async (widget: any, role: UserRole) => {
    try {
      const hasRole = widget.allowed_roles.includes(role);
      const newRoles = hasRole
        ? widget.allowed_roles.filter((r: string) => r !== role)
        : [...widget.allowed_roles, role];
      
      // Ensure at least one role has access
      if (newRoles.length === 0) {
        toast.error("At least one role must have access to this widget");
        return;
      }
      
      await updateWidgetSetting(widget.id, { allowed_roles: newRoles });
    } catch (error) {
      console.error("Error toggling role access:", error);
    }
  };

  const getWidgetTypeLabel = (type: string) => {
    switch (type) {
      case 'stats':
        return <Badge className="bg-blue-500">Statistics</Badge>;
      case 'actions':
        return <Badge className="bg-green-500">Actions</Badge>;
      case 'info':
        return <Badge className="bg-amber-500">Information</Badge>;
      default:
        return <Badge>Unknown</Badge>;
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
                  <CardTitle className="text-2xl font-bold flex items-center">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Dashboard Widget Settings
                  </CardTitle>
                  <CardDescription>
                    Control which widgets are visible on user dashboards
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleInitialize}
                    variant="outline"
                    size="sm"
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Initialize Default Widgets
                  </Button>
                  <Button 
                    onClick={() => refreshSettings()}
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
              ) : widgetSettings.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Dashboard Widgets Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You need to initialize dashboard widget settings.
                  </p>
                  <Button onClick={handleInitialize}>
                    Initialize Default Widgets
                  </Button>
                </div>
              ) : (
                <>
                  <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="all">All Widgets</TabsTrigger>
                      <TabsTrigger value="stats">Statistics</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                      <TabsTrigger value="info">Information</TabsTrigger>
                    </TabsList>
                  </Tabs>
                
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Widget</TableHead>
                          <TableHead className="w-[120px]">Type</TableHead>
                          <TableHead className="w-[200px]">Description</TableHead>
                          <TableHead className="text-center">Visible</TableHead>
                          <TableHead className="text-center">Admin</TableHead>
                          <TableHead className="text-center">Manager</TableHead>
                          <TableHead className="text-center">Salesperson</TableHead>
                          <TableHead className="text-center">Candidate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWidgets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <p>No widgets found for this filter</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredWidgets.map((widget) => (
                            <TableRow key={widget.id}>
                              <TableCell className="font-medium">{widget.widget_name}</TableCell>
                              <TableCell>{getWidgetTypeLabel(widget.widget_type)}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {widget.description}
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={widget.is_visible}
                                  onCheckedChange={() => toggleWidgetEnabled(widget)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={widget.allowed_roles.includes('admin')}
                                  onCheckedChange={() => toggleRoleAccess(widget, 'admin')}
                                  disabled // Admins always see everything
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={widget.allowed_roles.includes('manager')}
                                  onCheckedChange={() => toggleRoleAccess(widget, 'manager')}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={widget.allowed_roles.includes('salesperson')}
                                  onCheckedChange={() => toggleRoleAccess(widget, 'salesperson')}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={widget.allowed_roles.includes('candidate')}
                                  onCheckedChange={() => toggleRoleAccess(widget, 'candidate')}
                                />
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

export default AdminDashboardSettings;
