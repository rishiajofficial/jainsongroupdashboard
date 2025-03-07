
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationsEmptyStateProps {
  clearFilters: () => void;
}

export function ApplicationsEmptyState({ clearFilters }: ApplicationsEmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Applications Found</CardTitle>
        <CardDescription>
          There are no applications matching your current filters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-2">
          Try changing your filters or check back later when new applications are submitted.
        </p>
        <Button 
          variant="outline" 
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}

export function ApplicationsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
