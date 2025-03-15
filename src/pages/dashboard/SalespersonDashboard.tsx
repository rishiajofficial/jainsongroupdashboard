
import React from 'react';
import { Header } from "@/components/ui/Header";
import { SideNav } from "@/components/ui/dashboard/SideNav";

// We'll need to create these components or import them from the correct location
import { DummyDashboardHeader } from "@/components/ui/dashboard/DummyComponents";
import { DummyRecentActivity } from "@/components/ui/dashboard/DummyComponents";
import { DummyPerformanceSummary } from "@/components/ui/dashboard/DummyComponents"; 

// Let's create a simple useAuth hook for now
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('salesperson');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || 'User'
        });
        
        // Get role from profiles table
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setRole(data.role);
        }
      }
      setIsLoading(false);
    };
    
    getUser();
  }, []);
  
  return { user, role, isLoading };
};

const SalespersonDashboard = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SideNav role={role as any} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight mb-8">
              Welcome, {user?.name || "Salesperson"}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <ul className="space-y-2">
                  <li className="text-gray-600">Completed training video</li>
                  <li className="text-gray-600">Applied to job posting</li>
                  <li className="text-gray-600">Updated profile</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Performance</h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Training Progress</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Applications</span>
                      <span>3/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded">
                    Continue Training
                  </button>
                  <button className="w-full bg-green-100 text-green-700 py-2 px-4 rounded">
                    Browse Jobs
                  </button>
                  <button className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded">
                    View Applications
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalespersonDashboard;
