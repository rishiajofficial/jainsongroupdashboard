
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Map, BarChart, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  backLink?: string;
  hideNav?: boolean;
}

export function MobileLayout({ 
  children, 
  title, 
  backLink, 
  hideNav = false 
}: MobileLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Only show mobile-optimized layout on mobile devices
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="flex h-14 items-center px-4">
          {backLink && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => navigate(backLink)}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <h1 className="font-semibold text-lg flex-1 truncate">{title}</h1>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-4 px-4">
          {children}
        </div>
      </main>
      
      {/* Bottom nav */}
      {!hideNav && (
        <div className="sticky bottom-0 z-40 w-full border-t bg-background">
          <nav className="flex justify-around items-center h-16">
            <NavItem 
              icon={<Map className="h-5 w-5" />} 
              label="Track"
              href="/salesperson-tracker"
            />
            <NavItem 
              icon={<BarChart className="h-5 w-5" />} 
              label="Dashboard"
              href="/dashboard"
            />
            <NavItem 
              icon={<User className="h-5 w-5" />} 
              label="Profile"
              href="/user-profile"
            />
            <NavItem 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings"
              href="/settings"
            />
          </nav>
        </div>
      )}
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function NavItem({ icon, label, href }: NavItemProps) {
  const navigate = useNavigate();
  const isActive = location.pathname === href;
  
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center py-2 px-3",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
      onClick={() => navigate(href)}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
