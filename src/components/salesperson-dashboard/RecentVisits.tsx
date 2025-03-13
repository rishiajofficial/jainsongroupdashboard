
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Map } from "lucide-react";

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

export interface ShopVisit {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  audio_url?: string;
  created_at: string;
  salesperson_id: string;
  shop_name: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Salesperson {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface RecentVisitsProps {
  visits: ShopVisit[];
  salespeople: Salesperson[];
  isLoading: boolean;
}

export const RecentVisits = ({ visits, salespeople, isLoading }: RecentVisitsProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (visits.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No shop visits recorded in this period
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {visits.map((visit) => {
        const salesperson = salespeople.find(p => p.id === visit.salesperson_id);
        
        return (
          <Card key={visit.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-lg flex items-center">
                  {visit.shop_name}
                  {visit.status === 'completed' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  )}
                  {visit.status === 'pending' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      In Progress
                    </span>
                  )}
                  {visit.status === 'failed' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Cancelled
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {formatDate(visit.created_at)}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      <strong>Salesperson:</strong> {salesperson ? salesperson.full_name || salesperson.email : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Map className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      <strong>Location:</strong> Lat: {visit.location.latitude.toFixed(6)}, 
                      Long: {visit.location.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
                
                {visit.audio_url && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Sales Pitch Recording</h4>
                    <audio controls src={visit.audio_url} className="w-full h-8" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
