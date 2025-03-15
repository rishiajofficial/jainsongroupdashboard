
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoGrid } from "./VideoGrid";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredVideos: any[];
  isLoading: boolean;
}

export const CategoryTabs = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  filteredVideos, 
  isLoading 
}: CategoryTabsProps) => {
  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-4 inline-flex flex-nowrap min-w-full">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      
      <div className="pt-2">
        <VideoGrid videos={filteredVideos} isLoading={isLoading} />
      </div>
    </div>
  );
}
