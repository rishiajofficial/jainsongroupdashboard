
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { Job } from "@/hooks/useApplicationsData";

interface ApplicationsFilterProps {
  appStatusFilter: string;
  setAppStatusFilter: (value: string) => void;
  jobFilter: string | null;
  setJobFilter: (value: string | null) => void;
  availableJobs: Job[];
}

export function ApplicationsFilter({
  appStatusFilter,
  setAppStatusFilter,
  jobFilter,
  setJobFilter,
  availableJobs
}: ApplicationsFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <CardDescription>
          Filter applications by status and job
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Status
            </label>
            <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">
              Job
            </label>
            <Select 
              value={jobFilter || ""} 
              onValueChange={(value) => setJobFilter(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Jobs</SelectItem>
                {availableJobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
