
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Helper function to format dates consistently
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

export interface DailyStats {
  date: string;
  totalVisits: number;
  completedVisits: number;
  hasRecordings: number;
  salespeople: {
    [id: string]: {
      name: string;
      visits: number;
    }
  }
}

interface StatsCardsProps {
  data: DailyStats[];
  isLoading: boolean;
}

export const StatsCards = ({ data, isLoading }: StatsCardsProps) => {
  const totalVisits = data.reduce((sum, day) => sum + day.totalVisits, 0);
  const completedVisits = data.reduce((sum, day) => sum + day.completedVisits, 0);
  const recordingsCount = data.reduce((sum, day) => sum + day.hasRecordings, 0);
  
  const salespeople: {[id: string]: { name: string, visits: number }} = {};
  
  data.forEach(day => {
    Object.entries(day.salespeople).forEach(([id, info]) => {
      if (!salespeople[id]) {
        salespeople[id] = { name: info.name, visits: 0 };
      }
      salespeople[id].visits += info.visits;
    });
  });
  
  const topSalespeople = Object.entries(salespeople)
    .sort((a, b) => b[1].visits - a[1].visits)
    .slice(0, 5);
  
  if (isLoading) {
    return (
      <>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recordings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
  
  return (
    <>
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Total Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalVisits}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.length > 0 ? `Last updated: ${formatDate(data[0].date)}` : 'No data available'}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {completedVisits} of {totalVisits} visits completed
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{recordingsCount}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {recordingsCount > 0 
              ? `${Math.round((recordingsCount / completedVisits) * 100)}% of completed visits`
              : 'No recordings available'}
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Top Salespeople</CardTitle>
        </CardHeader>
        <CardContent>
          {topSalespeople.length > 0 ? (
            <div className="space-y-4">
              {topSalespeople.map(([id, info]) => (
                <div key={id} className="flex justify-between items-center">
                  <span className="font-medium">{info.name}</span>
                  <span className="text-sm px-2 py-1 bg-primary/10 rounded">
                    {info.visits} {info.visits === 1 ? 'visit' : 'visits'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              No salesperson data available
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
