import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function JobsManage() {
  const [role, setRole] = useState("admin"); // Replace with actual role fetching logic
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Manage Jobs
              </h1>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Job
              </Button>
            </div>

            {showAddForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Job</CardTitle>
                  <CardDescription>
                    Fill out the form below to create a new job listing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add Job Form Here */}
                  <p>Job Form Coming Soon...</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Current Job Listings</CardTitle>
                  <CardDescription>
                    Manage and edit existing job listings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Job List Here */}
                  <p>Job List Coming Soon...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
