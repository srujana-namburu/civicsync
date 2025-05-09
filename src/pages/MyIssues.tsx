import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import IssueList from "@/components/issues/IssueList";
import { getUserIssues, deleteIssue, hasVotedOnIssue, voteOnIssue } from "@/lib/supabase-data";
import { Issue } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extend Issue type locally to include hasVoted
type IssueWithVoted = Issue & { hasVoted: boolean };

const MyIssues = () => {
  const [issues, setIssues] = useState<IssueWithVoted[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await getUserIssues();
        // For each issue, check if the user has voted
        const issuesWithVoted: IssueWithVoted[] = await Promise.all(
          data.map(async (issue) => ({
            ...issue,
            hasVoted: await hasVotedOnIssue(issue.id),
          }))
        );
        setIssues(issuesWithVoted);
      } catch (error: any) {
        console.error("Error fetching user issues:", error);
        toast({
          title: "Error loading issues",
          description: error.message || "There was a problem loading your issues. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [toast]);

  const handleEdit = (issue: Issue) => {
    navigate(`/edit-issue/${issue.id}`, { state: { issue } });
  };

  const handleDelete = async (issueId: string) => {
    try {
      await deleteIssue(issueId);
      setIssues(issues.filter(issue => issue.id !== issueId));
      toast({
        title: "Issue deleted",
        description: "Your issue has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting issue:", error);
      toast({
        title: "Error deleting issue",
        description: error.message || "There was a problem deleting this issue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleIssueClick = (issue: Issue) => {
    navigate(`/issues/${issue.id}`);
  };

  const handleVote = async (issueId: string) => {
    try {
      await voteOnIssue(issueId);
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId
            ? { ...issue, hasVoted: true, votes: issue.votes + 1 }
            : issue
        )
      );
      toast({
        title: "Vote recorded",
        description: "Thanks for supporting this issue!",
      });
    } catch (error: any) {
      toast({
        title: "Error voting",
        description: error.message || "There was a problem recording your vote.",
        variant: "destructive",
      });
    }
  };

  // Filter issues by status
  const filteredIssues = statusFilter === "all"
    ? issues
    : issues.filter(issue => {
        if (statusFilter === "pending") return issue.status === "pending";
        if (statusFilter === "in-progress") return issue.status === "in-progress";
        if (statusFilter === "resolved") return issue.status === "resolved";
        return true;
      });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 md:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Issues</h1>
              <p className="text-muted-foreground mt-2">
                Track and manage the civic issues you've reported
              </p>
            </div>
            
            <Button className="mt-4 md:mt-0" asChild>
              <a href="/report">
                <Plus className="mr-2 h-4 w-4" /> Report New Issue
              </a>
            </Button>
          </div>
          
          {/* Filter Dropdown */}
          <div className="mb-6 flex justify-end">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <IssueList 
              issues={filteredIssues} 
              isUserOwned={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={handleIssueClick}
              onVote={handleVote}
            />
          )}
          
          <div className="mt-12 bg-white dark:bg-gray-900 rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Understanding Issue Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-status-pending/10 border border-status-pending/20">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-status-pending mr-2"></div>
                  <h3 className="font-medium">Pending</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your issue has been submitted and is awaiting review by local authorities.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-status-in-progress/10 border border-status-in-progress/20">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-status-in-progress mr-2"></div>
                  <h3 className="font-medium">In Progress</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Authorities have acknowledged the issue and are actively working to resolve it.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-status-resolved/10 border border-status-resolved/20">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-status-resolved mr-2"></div>
                  <h3 className="font-medium">Resolved</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  The issue has been successfully addressed and is now considered resolved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyIssues;
