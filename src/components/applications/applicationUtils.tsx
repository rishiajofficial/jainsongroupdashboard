
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-green-500 text-white">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          {status}
        </Badge>
      );
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const downloadResume = async (resumeUrl: string | null) => {
  if (!resumeUrl) {
    toast.error("No resume available for download");
    return;
  }

  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .download(resumeUrl);

    if (error) {
      console.error("Error downloading resume:", error);
      toast.error("Failed to download resume");
      return;
    }

    // Create a download link for the file
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = resumeUrl.split('/').pop() || 'resume.pdf';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading resume:", error);
    toast.error("Failed to download resume");
  }
};
