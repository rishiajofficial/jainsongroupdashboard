import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role="salesperson" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your account settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Settings content coming soon.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
