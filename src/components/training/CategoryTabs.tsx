
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
    <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory}>
      <TabsList className="mb-4 flex flex-wrap gap-2">
        {categories.map(category => (
          <TabsTrigger key={category} value={category}>
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value={selectedCategory}>
        <VideoGrid videos={filteredVideos} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
};
