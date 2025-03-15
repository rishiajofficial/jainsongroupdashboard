
import React from 'react';

export const DummyDashboardHeader = ({ name }: { name: string }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}</h1>
      <p className="text-muted-foreground">Here's an overview of your dashboard.</p>
    </div>
  );
};

export const DummyRecentActivity = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow border">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        <div className="border-b pb-2">
          <p className="font-medium">Completed training video</p>
          <p className="text-sm text-muted-foreground">2 hours ago</p>
        </div>
        <div className="border-b pb-2">
          <p className="font-medium">Applied to job posting</p>
          <p className="text-sm text-muted-foreground">Yesterday</p>
        </div>
        <div className="border-b pb-2">
          <p className="font-medium">Updated profile</p>
          <p className="text-sm text-muted-foreground">3 days ago</p>
        </div>
      </div>
    </div>
  );
};

export const DummyPerformanceSummary = () => {
  return (
    <div className="bg-card p-6 rounded-lg shadow border">
      <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>Training Progress</span>
            <span>75%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{width: '75%'}}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>Applications</span>
            <span>3/5</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{width: '60%'}}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>Skills Assessment</span>
            <span>82%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{width: '82%'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
